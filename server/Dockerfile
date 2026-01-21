# Production Deployment for Dokploy

# Use Node.js 20 Alpine for a lightweight production image
FROM node:20-alpine

# Set build environment to production
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 3030

# Start the server
CMD ["npm", "start"]
