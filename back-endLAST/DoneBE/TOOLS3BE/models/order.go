package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Order struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	PickupLocation  string             `bson:"pickup_location" json:"pickup_location"`
	DropOffLocation string             `bson:"drop_off_location" json:"drop_off_location"`
	PackageDetails  string             `bson:"package_details" json:"package_details"`
	DeliveryTime    string             `bson:"delivery_time" json:"delivery_time"`
	Status          string             `bson:"status" json:"status"`
	UserID          primitive.ObjectID `bson:"user_id" json:"user_id"`
	CourierID       primitive.ObjectID `bson:"courier_id" json:"courier_id"`
}
