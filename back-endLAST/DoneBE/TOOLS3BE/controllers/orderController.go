package controllers

import (
	"context"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"example.com/tools3be/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var orderCollection *mongo.Collection

// InitOrderController initializes the order controller by setting up the MongoDB collection.
func InitOrderController(client *mongo.Client) {
	dbName := os.Getenv("DB_NAME")
	orderCollection = client.Database(dbName).Collection("orders")
}
func CreateOrder(c *gin.Context) {
	var order models.Order

	// Bind the order data from the request body
	if err := c.BindJSON(&order); err != nil {
		log.Printf("BindJSON error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order data"})
		return
	}

	// Set the default status to "pending"
	order.Status = "pending"

	// Get the user ID from the context
	userID, exists := c.Get("userID")
	if !exists {
		log.Println("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Convert userID string to primitive.ObjectID
	userIDStr, ok := userID.(string)
	if !ok {
		log.Println("Invalid user ID type")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	// Convert string to ObjectID
	userIDObj, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		log.Println("Invalid user ID format:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Assign the ObjectID to the order's UserID
	order.UserID = userIDObj

	// Fetch all couriers from the database
	var couriers []models.Courier
	cursor, err := courierCollection.Find(context.Background(), bson.M{})
	if err != nil {
		log.Println("Error fetching couriers:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch couriers"})
		return
	}
	defer cursor.Close(context.Background())

	// Read all couriers into the array
	for cursor.Next(context.Background()) {
		var courier models.Courier
		if err := cursor.Decode(&courier); err != nil {
			log.Println("Error decoding courier:", err)
			continue
		}
		couriers = append(couriers, courier)
	}

	if len(couriers) == 0 {
		log.Println("No couriers found")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No couriers available"})
		return
	}

	// Randomly select a courier from the list
	rand.Seed(time.Now().UnixNano())
	randomIndex := rand.Intn(len(couriers))
	selectedCourier := couriers[randomIndex]

	// Assign the selected courier to the order
	order.CourierID = selectedCourier.ID
	log.Printf("Assigned courier: %+v", selectedCourier)

	// Insert the order into the database
	result, err := orderCollection.InsertOne(context.TODO(), order)
	if err != nil {
		log.Printf("InsertOne error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	orderID := result.InsertedID.(primitive.ObjectID).Hex()

	// Update the selected courier's AssignedOrders array with the new order
	courierUpdate := bson.M{
		"$push": bson.M{"assigned_orders": order}, // Add the order to the assigned_orders array
	}

	// Update the courier in the database
	_, err = courierCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": selectedCourier.ID},
		courierUpdate,
	)
	if err != nil {
		log.Printf("Error updating courier with assigned order: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update courier's orders"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Order created successfully", "order_id": orderID})
}

// GetUserOrders fetches the orders for the logged-in user.
func GetUserOrders(c *gin.Context) {
	// Get the user ID from the context (extracted from the token)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Convert userID string to primitive.ObjectID
	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	userIDObj, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Query the orders collection for orders with the matching userID
	filter := bson.M{"user_id": userIDObj}
	cursor, err := orderCollection.Find(context.TODO(), filter)
	if err != nil {
		log.Printf("Failed to fetch orders: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}
	defer cursor.Close(context.TODO())

	var orders []models.Order
	if err = cursor.All(context.TODO(), &orders); err != nil {
		log.Printf("Failed to decode orders: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

// GetOrderById retrieves a specific order by its ID.
func GetOrderById(c *gin.Context) {
	// Get the order ID from the request parameters
	orderID := c.Param("id")

	// Convert the orderID string to a MongoDB ObjectID
	orderObjectID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		log.Printf("Invalid order ID format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID format"})
		return
	}

	// Define the filter to find the order by its ObjectID
	filter := bson.M{"_id": orderObjectID}

	// Find the order in the collection
	var order models.Order
	err = orderCollection.FindOne(context.TODO(), filter).Decode(&order)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		} else {
			log.Printf("Failed to fetch order: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch order"})
		}
		return
	}

	// Return the found order
	c.JSON(http.StatusOK, gin.H{"order": order})
}
