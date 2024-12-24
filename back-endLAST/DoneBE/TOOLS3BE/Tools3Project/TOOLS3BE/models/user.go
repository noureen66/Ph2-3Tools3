package models

type User struct {
	ID       string `bson:"_id,omitempty"`
	Name     string `bson:"name"`
	Email    string `bson:"email"`
	Phone    string `bson:"phone"` // Changed field name from "number" to "phone" for consistency
	Password string `bson:"password"`
}
