# Use a Node.js LTS version as the base image
FROM node:lts-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY package.json yarn.lock ./

# Install dependencies using yarn
RUN yarn

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN yarn build

# Expose port 3000 to the host machine
EXPOSE 3000

# Start the application
CMD ["yarn", "start:dev"]
