FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Ensure we are in development mode so that dev dependencies are installed
ENV NODE_ENV=development

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Expose the application port and the Node inspector port
EXPOSE 4000 9229

# Start the app in debug mode
CMD ["npm", "run", "debug"]
