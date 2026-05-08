# Use official Node.js image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Expose the port (usually 5000 or 8080 for AWS)
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
