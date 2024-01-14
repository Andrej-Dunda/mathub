# Write Dockerfile content for the backend service
# Use the official Python image
FROM python:3.8-alpine
# Set the working directory to /app
WORKDIR /app
# Copy the requirements.txt file to the working directory
COPY requirements.txt .
# Install the dependencies
RUN pip install -r requirements.txt
# Copy the remaining files to the working directory
COPY . .
# Expose port 5001
EXPOSE 5001
# Run the app
CMD ["python", "app.py"]