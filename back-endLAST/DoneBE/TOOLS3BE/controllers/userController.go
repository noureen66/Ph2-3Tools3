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
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var userCollection *mongo.Collection

// InitUserController initializes the user controller by setting up the MongoDB collection.
func InitUserController(client *mongo.Client) {
	dbName := os.Getenv("DB_NAME")
	userCollection = client.Database(dbName).Collection("users")
}

func CreateAdminUser() {
	// Check if an admin already exists
	var existingUser models.User
	err := userCollection.FindOne(context.TODO(), bson.M{"role": "admin"}).Decode(&existingUser)
	if err == nil {
		log.Println("Admin user already exists.")
		return
	}

	// Create the admin user
	adminUser := models.User{
		ID:    primitive.NewObjectID(),
		Email: "admin@example.com", // Set the admin email here
		Name:  "Admin",
		Phone: "0000000000", // Provide a default phone number or leave it as is
		Role:  "admin",      // Set role to "admin"
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("root123"), 14)
	if err != nil {
		log.Println("Password hashing failed:", err)
		return
	}
	adminUser.Password = string(hashedPassword)

	// Insert admin into the database
	_, err = userCollection.InsertOne(context.TODO(), adminUser)
	if err != nil {
		log.Println("Failed to insert admin user:", err)
		return
	}

	log.Println("Admin user created successfully.")
}

// RegisterUser handles user registration.
func RegisterUser(c *gin.Context) {
	email := c.PostForm("email")
	name := c.PostForm("name")
	password := c.PostForm("password")
	number := c.PostForm("number")

	if email == "" || name == "" || password == "" || number == "" {
		c.String(http.StatusBadRequest, "Error: All fields (email, name, password, and number) are required.")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		log.Println("Password hashing failed:", err)
		c.String(http.StatusInternalServerError, "Error: Failed to hash password.")
		return
	}

	var existingUser models.User
	err = userCollection.FindOne(context.TODO(), bson.M{"email": email}).Decode(&existingUser)
	if err == nil {
		c.String(http.StatusConflict, "Error: Email already in use.")
		return
	} else if err != mongo.ErrNoDocuments {
		c.String(http.StatusInternalServerError, "Error: Database query failed.")
		return
	}

	user := models.User{
		ID:       primitive.NewObjectID(),
		Email:    email,
		Name:     name,
		Password: string(hashedPassword),
		Phone:    number,
		Role:     "user", // Set role to "user"
	}

	_, err = userCollection.InsertOne(context.TODO(), user)
	if err != nil {
		log.Println("User creation failed:", err)
		c.String(http.StatusInternalServerError, "Error: Failed to create user.")
		return
	}

	c.String(http.StatusCreated, "Success: User registered successfully.")
}

// LoginUser handles user login and token generation.
func LoginUser(c *gin.Context) {
	email := c.PostForm("email")
	password := c.PostForm("password")

	// Basic check for email and password
	if email == "" || password == "" {
		c.String(http.StatusBadRequest, "Error: Email and password are required.")
		return
	}

	// Try to find the user in the users collection
	var user models.User
	err := userCollection.FindOne(context.TODO(), bson.M{"email": email}).Decode(&user)

	// If user not found, try to find the courier in the courier collection
	if err != nil && err != mongo.ErrNoDocuments {
		log.Println("Error finding user:", err)
		c.String(http.StatusInternalServerError, "Error: Failed to fetch user.")
		return
	}

	if err == nil {
		// User found, validate password and create token for user
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
			log.Println("Incorrect password for user:", email)
			c.String(http.StatusUnauthorized, "Error: Invalid email or password.")
			return
		}

		token, err := utils.GenerateJWT(user.ID.Hex(), user.Role)
		if err != nil {
			log.Println("Token generation failed for user:", user.Email)
			c.String(http.StatusInternalServerError, "Error: Failed to log in.")
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Success", "token": token, "role": user.Role})
		return
	}

	// User not found, now check for courier
	var courier models.Courier
	err = courierCollection.FindOne(context.TODO(), bson.M{"email": email}).Decode(&courier)

	if err != nil {
		log.Println("Login failed - User not found for email:", email)
		c.String(http.StatusUnauthorized, "Error: Invalid email or password.")
		return
	}

	// Courier found, validate password and create token for courier
	if err := bcrypt.CompareHashAndPassword([]byte(courier.Password), []byte(password)); err != nil {
		log.Println("Incorrect password for courier:", email)
		c.String(http.StatusUnauthorized, "Error: Invalid email or password.")
		return
	}

	token, err := utils.GenerateJWT(courier.ID.Hex(), courier.Role)
	if err != nil {
		log.Println("Token generation failed for courier:", courier.Email)
		c.String(http.StatusInternalServerError, "Error: Failed to log in.")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Success", "token": token, "role": courier.Role})
}
