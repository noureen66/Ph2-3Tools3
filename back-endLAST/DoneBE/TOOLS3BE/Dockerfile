#Builder Stage (Stage 1)
# The official Golang image as the base image
FROM golang:1.23-alpine as builder

# Setting the working directory inside the container
WORKDIR /app

# Copy the .env file into the container 
COPY .env .env

# Copy go.mod and go.sum for dependency installation
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the Go application
RUN go build -o main .


#Final Stage (Stage 2)
# Useing a minimal image to run the compiled Go application
FROM alpine:latest

WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/main .

# Include the .env file for runtime use
COPY --from=builder /app/.env .env  

# Expose the application port
EXPOSE 8080

# Start the application
CMD ["./main"]



# # Copy the script into the container
# COPY script.sh /app/script.sh

# # Ensure the script is executable
# RUN chmod +x /app/script.sh

# # Start the Go application and then run the script
# CMD ["sh", "-c", "./main & sh /app/script.sh"]