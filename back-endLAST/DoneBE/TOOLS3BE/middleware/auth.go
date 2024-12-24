package middleware

import (
	"net/http"
	"strings"

	"example.com/tools3be/utils"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware checks for a valid JWT token
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.Request.Header.Get("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
			c.Abort()
			return
		}

		// Remove the "Bearer " prefix
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		// Validate the token
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Safely retrieve and assert user ID and role from claims
		userID, ok := claims["user_id"].(string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID in token"})
			c.Abort()
			return
		}

		role, ok := claims["role"].(string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid role in token"})
			c.Abort()
			return
		}

		// Store user ID and role in context for use in endpoints
		c.Set("userID", userID)
		c.Set("role", role)
		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Retrieve user role from context
		role, exists := c.Get("role")
		if !exists || role != "admin" {
			// If role is not "admin", respond with a forbidden error
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		// If role is "admin", proceed with the request
		c.Next()
	}
}
