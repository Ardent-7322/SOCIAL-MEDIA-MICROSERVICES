# Use official Node.js 18 Alpine image
FROM node:18-alpine

# Correct working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose service port (change per service)
EXPOSE 3001

# Use nodemon for dev hot reload
CMD ["npm", "run", "dev"]
