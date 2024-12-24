# Stage 1: Build the React app
# Base image for Node.js
FROM node:16-alpine as builder

# Create and set the working directory
WORKDIR /app

# Copy only package.json and package-lock.json for dependency installation
COPY  package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Use NGINX to serve the React app
# Use a lightweight web server to serve the production build
FROM nginx:stable-alpine

# Copy the build files to the Nginx default directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose the default Nginx port
EXPOSE 80

# # Copy the script into the container
# COPY script.sh /app/script.sh

# # Ensure the script is executable
# RUN chmod +x /app/script.sh

# # Start the Nginx server and run the script
# CMD ["sh", "-c", "sh /app/script.sh && nginx -g 'daemon off;'"]

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]