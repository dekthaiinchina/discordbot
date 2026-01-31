# Use the official Node.js 20 LTS image as the base
FROM node:lts-trixie-slim

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package files first to leverage Docker cache for layers
COPY package*.json ./

# Install production dependencies only
RUN npm install

# Copy the rest of your bot's source code
COPY . .

# Use the production script defined in your package.json
CMD ["npm", "run", "dev"]