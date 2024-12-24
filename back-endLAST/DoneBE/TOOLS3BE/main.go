// main.go
package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"example.com/tools3be/controllers"
	"example.com/tools3be/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func connectDB() *mongo.Client {
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGO_URI"))
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	if err := client.Ping(context.TODO(), nil); err != nil {
		log.Fatal(err)
	}
	log.Println("Connected to MongoDB")
	return client
}

func main() {
	client = connectDB()

	controllers.InitUserController(client)
	controllers.InitOrderController(client)
	controllers.InitCourierController(client)
	controllers.InitAdminController(client)

	controllers.CreateAdminUser()
	controllers.CreateDefaultCouriers()

	// Set up Gin router with CORS
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://frontendreact"}, //Added , "http://frontendreact" for CORS configuration
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Define a default route to handle requests to "/"
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Welcome to the Package Tracking API!",
		})
	})

	// Define routes
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

	// Handle preflight requests
	router.OPTIONS("/orders", func(c *gin.Context) {
		c.Status(http.StatusNoContent) // Respond with 204 No Content
	})

	// // Start the server
	// if err := router.Run(":8080"); err != nil {
	// 	log.Fatal(err)
	// }

	// Ensure the backend starts correctly when the Docker Compose file is run:
	if err := router.Run("0.0.0.0:8080"); err != nil {
		log.Fatal(err)
	}

}
