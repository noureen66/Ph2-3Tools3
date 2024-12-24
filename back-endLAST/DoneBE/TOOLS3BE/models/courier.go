package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Courier struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name           string             `bson:"name" json:"name"  ` // Name of the courier
	Password       string             `bson:"password" json:"password"  `
	Email          string             `bson:"email" json:"email" `   // Email address of the courier
	Number         string             `bson:"number" json:"number" ` // Phone number of the courier
	Role           string             `bson:"role" json:"role"`
	AssignedOrders []Order            `bson:"assigned_orders" json:"assigned_orders"`
}
