# Use the node:alpine image as the base image
FROM node:14
# Set the working directory to /app
WORKDIR /app
# Copy the package.json file to the working directory
COPY package*.json .
# Install the dependencies
RUN npm install && rm -rf ./node_modules/.cache
# Copy the remaining files to the working directory
COPY . .
# Set the environment variable PORT to 3000
ENV PORT=3000
# Expose port 3000
EXPOSE 3000
# Run the app
CMD ["npm", "start"]