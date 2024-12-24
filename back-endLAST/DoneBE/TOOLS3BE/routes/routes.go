package routes

import (
	"example.com/tools3be/controllers"
	"example.com/tools3be/middleware"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRouter(client *mongo.Client) *gin.Engine {
	router := gin.Default()
	//initialize controllers
	controllers.InitUserController(client)
	controllers.InitOrderController(client)
	controllers.InitCourierController(client)

	router.POST("/register", controllers.RegisterUser)
	router.POST("/login", controllers.LoginUser)
	router.POST("/orders", middleware.AuthMiddleware(), controllers.CreateOrder)
	router.GET("/orders", middleware.AuthMiddleware(), controllers.GetUserOrders)
	router.GET("/orders/:id", middleware.AuthMiddleware(), controllers.GetOrderById)

	// Courier routes
	router.GET("/courier/:courierID/orders", middleware.AuthMiddleware(), controllers.GetAssignedOrders)
	router.PUT("/orders/:id/status", middleware.AuthMiddleware(), controllers.UpdateOrderStatus)

	// Admin routes
	admin := router.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware()) // Apply Auth and Admin middleware

	// Define admin-specific routes
	admin.GET("/orders", controllers.GetAllOrders)                      // Admin gets all orders
	admin.DELETE("/orders/:id", controllers.DeleteOrder)                // Admin deletes an order
	admin.PUT("/orders/:id", controllers.ReassignOrder)                 // Admin reassigns an order
	admin.GET("/courier/orders", controllers.AdminGetAssignedOrders)    // Admin gets all assigned orders
	admin.PUT("/orders/:id/status", controllers.AdminUpdateOrderStatus) // Admin updates order status

	return router
}
