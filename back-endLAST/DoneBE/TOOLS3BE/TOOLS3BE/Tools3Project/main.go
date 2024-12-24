package main

import (
	"context"
	"log"
	"os"

	"example.com/tools3be/routes"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

//second commit by noureen (testing)
//third commit by noureen (testing the branch)

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
	router := routes.SetupRouter(client)
	router.Run(":8080")
}
