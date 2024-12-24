package controllers

import (
	"context"
	"log"
	"net/http"
	"os"

	"example.com/tools3be/models"
	"example.com/tools3be/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var userCollection *mongo.Collection

// Initialize the user controller by setting up the MongoDB collection
func InitUserController(client *mongo.Client) {
	dbName := os.Getenv("DB_NAME")
	userCollection = client.Database(dbName).Collection("users")
}

// Register user with form data for email, name, password, and number
func RegisterUser(c *gin.Context) {
	email := c.PostForm("email")
	name := c.PostForm("name")
	password := c.PostForm("password")
	number := c.PostForm("number")

	if email == "" || name == "" || password == "" || number == "" {
		c.String(http.StatusBadRequest, "All fields (email, name, password, and number) are required")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		log.Println("Password hashing failed:", err)
		c.String(http.StatusInternalServerError, "Error processing request")
		return
	}

	// Check if email already exists
	var existingUser models.User
	err = userCollection.FindOne(context.TODO(), bson.M{"email": email}).Decode(&existingUser)
	if err == nil {
		c.String(http.StatusConflict, "Email already in use")
		return
	}

	// Create user struct with provided data
	user := models.User{
		Email:    email,
		Name:     name,
		Password: string(hashedPassword),
		Phone:    number,
	}

	_, err = userCollection.InsertOne(context.TODO(), user)
	if err != nil {
		log.Println("User creation failed:", err)
		c.String(http.StatusInternalServerError, "Failed to create user")
		return
	}

	c.String(http.StatusCreated, "User registered successfully")
}

// Login user with form data for email and password
func LoginUser(c *gin.Context) {
	email := c.PostForm("email")
	password := c.PostForm("password")

	// Check for required fields
	if email == "" || password == "" {
		c.String(http.StatusBadRequest, "Email and password are required")
		return
	}

	// Find user by email
	var user models.User
	err := userCollection.FindOne(context.TODO(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		// If user not found, return unauthorized
		c.String(http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Compare hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		c.String(http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Generate token
	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		log.Println("Token generation failed:", err)
		c.String(http.StatusInternalServerError, "Failed to log in")
		return
	}

	// Return the token as a plain text response
	c.String(http.StatusOK, "Token: %s", token)
}
