package controllers

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"example.com/tools3be/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var adminOrderCollection *mongo.Collection

// InitAdminController initializes the MongoDB collection for orders.
func InitAdminController(client *mongo.Client) {
	dbName := os.Getenv("DB_NAME")
	adminOrderCollection = client.Database(dbName).Collection("orders")
}

// Retrieve all orders for admin
func GetAllOrders(c *gin.Context) {
	adminRole, exists := c.Get("role")
	if !exists || adminRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized access"})
		return
	}

	var orders []models.Order
	cursor, err := adminOrderCollection.Find(context.TODO(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve orders"})
		return
	}
	defer cursor.Close(context.TODO())

	if err := cursor.All(context.TODO(), &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// ADMIN: Retrieve all orders assigned to couriers
func AdminGetAssignedOrders(c *gin.Context) {
	adminRole, exists := c.Get("role")
	if !exists || adminRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized access"})
		return
	}

	var assignedOrders []models.Order
	cursor, err := adminOrderCollection.Find(context.TODO(), bson.M{"courier_id": bson.M{"$ne": ""}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve assigned orders"})
		return
	}
	defer cursor.Close(context.TODO())

	if err := cursor.All(context.TODO(), &assignedOrders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding assigned orders"})
		return
	}

	c.JSON(http.StatusOK, assignedOrders)
}

// ADMIN: Update order status
func AdminUpdateOrderStatus(c *gin.Context) {
	adminRole, exists := c.Get("role")
	if !exists || adminRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized access"})
		return
	}

	orderID := c.Param("id")
	var statusUpdate struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&statusUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status data"})
		return
	}

	orderObjID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	_, err = adminOrderCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": orderObjID},
		bson.M{"$set": bson.M{"status": statusUpdate.Status}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order status updated successfully by admin"})
}

// Delete an order
func DeleteOrder(c *gin.Context) {
	adminRole, exists := c.Get("role")
	if !exists || adminRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized access"})
		return
	}

	orderID := c.Param("id")
	orderObjID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	_, err = adminOrderCollection.DeleteOne(context.TODO(), bson.M{"_id": orderObjID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order deleted successfully"})
}
func ReassignOrder(c *gin.Context) {
	adminRole, exists := c.Get("role")
	if !exists || adminRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized access"})
		return
	}

	orderID := c.Param("id")
	var reassignData struct {
		CourierID string `json:"courier_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&reassignData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid courier data"})
		return
	}

	orderObjID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	// Fetch the current order to get the existing courier ID
	var order models.Order
	err = orderCollection.FindOne(context.TODO(), bson.M{"_id": orderObjID}).Decode(&order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch order"})
		return
	}

	oldCourierID := order.CourierID
	fmt.Println("Old Courier ID:", oldCourierID)

	// Step 1: Remove the order from the old courier's assigned_orders list if the order is assigned
	if oldCourierID != primitive.NilObjectID {
		updateResult, err := courierCollection.UpdateOne(
			context.TODO(),
			bson.M{"_id": oldCourierID, "assigned_orders._id": orderObjID}, // Ensure the order exists in assigned_orders
			bson.M{
				"$pull": bson.M{"assigned_orders": bson.M{"_id": orderObjID}},
			},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove order from old courier's assigned orders"})
			return
		}

		if updateResult.ModifiedCount == 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Order not found in the old courier's assigned orders"})
			return
		}
	}

	// Step 2: Update the order to the new courier's ID
	newCourierID, err := primitive.ObjectIDFromHex(reassignData.CourierID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid courier ID"})
		return
	}

	// Update the order with the new courier ID
	_, err = orderCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": orderObjID},
		bson.M{"$set": bson.M{"courier_id": newCourierID}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reassign order"})
		return
	}

	// Step 3: Add the order to the new courier's assigned_orders list
	_, err = courierCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": newCourierID},
		bson.M{
			"$push": bson.M{"assigned_orders": order},
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add order to new courier's assigned orders"})
		return
	}

	// Step 4: Respond with success message
	c.JSON(http.StatusOK, gin.H{"message": "Order reassigned to new courier successfully"})
}
