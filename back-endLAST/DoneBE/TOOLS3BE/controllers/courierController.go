package controllers

import (
	"context"
	"log"
	"net/http"
	"os"

	"example.com/tools3be/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

var courierCollection *mongo.Collection

// InitCourierController initializes the MongoDB collection for couriers.
func InitCourierController(client *mongo.Client) {
	dbName := os.Getenv("DB_NAME")
	courierCollection = client.Database(dbName).Collection("courier")
}
func CreateDefaultCouriers() {
	couriersData := []struct {
		Name     string
		Email    string
		Number   string
		Password string
	}{
		{
			Name:     "Courier One",
			Email:    "courier1@example.com",
			Number:   "1234567890",
			Password: "courier1",
		},
		{
			Name:     "Courier Two",
			Email:    "courier2@example.com",
			Number:   "0987654321",
			Password: "courier2",
		},
		{
			Name:     "Courier Three",
			Email:    "courier3@example.com",
			Number:   "1122334455",
			Password: "courier3",
		},
	}

	for _, data := range couriersData {
		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Println("Password hashing failed for", data.Name, ":", err)
			continue
		}

		// Create courier object
		courier := models.Courier{
			ID:             primitive.NewObjectID(), // You can use primitive.ObjectID here
			Name:           data.Name,
			Email:          data.Email,
			Number:         data.Number,
			Password:       string(hashedPassword),
			Role:           "courier",
			AssignedOrders: []models.Order{}, // Empty order list
		}

		// Insert courier into MongoDB
		_, err = courierCollection.InsertOne(context.Background(), courier)
		if err != nil {
			log.Println("Failed to insert courier:", courier.Name, ":", err)
		} else {
			log.Println("Courier", courier.Name, "created successfully.")
		}
	}
}

// GetAssignedOrders fetches all orders assigned to a specific courier by courier ID.
func GetAssignedOrders(c *gin.Context) {
	courierID := c.Param("courierID")
	if courierID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Courier ID is required"})
		return
	}

	// Convert courierID string to ObjectID
	id, err := primitive.ObjectIDFromHex(courierID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid courier ID format"})
		return
	}

	var courier models.Courier
	err = courierCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&courier)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courier"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"assigned_orders": courier.AssignedOrders})
}

func UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id") // Get the order ID from the URL parameter
	var statusUpdate struct {
		Status string `json:"status"` // Status field to receive the updated status
	}

	// Bind the status update data from the request body
	if err := c.BindJSON(&statusUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status update data"})
		return
	}

	// Convert orderID from string to ObjectID
	id, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	// Update the order status in the "orders" collection
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"status": statusUpdate.Status}}

	_, err = orderCollection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	// If the order has a courier assigned, update the courier's list of orders
	var order models.Order
	err = orderCollection.FindOne(context.TODO(), filter).Decode(&order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated order"})
		return
	}

	if order.CourierID != primitive.NilObjectID {
		courierFilter := bson.M{"_id": order.CourierID}
		courierUpdate := bson.M{"$set": bson.M{"assigned_orders.$[elem].status": statusUpdate.Status}}

		// Update the courier's assigned order status
		arrayFilters := options.ArrayFilters{
			Filters: []interface{}{bson.M{"elem._id": id}},
		}
		_, err = courierCollection.UpdateOne(
			context.TODO(),
			courierFilter,
			courierUpdate,
			&options.UpdateOptions{ArrayFilters: &arrayFilters},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update courier's order status"})
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{"message": "Order status updated successfully"})
}
