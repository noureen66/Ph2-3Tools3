# # Use the official MongoDB image from Docker Hub
# FROM mongo:latest

# # Define mountable directories 
# VOLUME ["/data/db"]

# # Expose MongoDB ports
# EXPOSE 27017
# EXPOSE 28017

# # Define the default command 
# CMD ["mongod"]


# # Copy the initialization script to the MongoDB entrypoint directory
# COPY script.sh /docker-entrypoint-initdb.d/script.sh

# # Ensure the script has executable permissions
# RUN chmod +x /docker-entrypoint-initdb.d/script.sh


# Use the official MongoDB image from Docker Hub
FROM mongo:latest

# Define mountable directories 
VOLUME ["/data/db"]

# Expose MongoDB ports
EXPOSE 27017
EXPOSE 28017

# Define the default command 
CMD ["mongod"]


