# Write Dockerfile content for the backend service
# Use the official Python image
FROM python:3.8-alpine
# Set the working directory to /backend
WORKDIR /backend
# Copy the requirements.txt file to the working directory
COPY requirements.txt .
# Install the dependencies
RUN pip install -r requirements.txt
# Copy the remaining files to the working directory
COPY . .
EXPOSE 5001
# Run the app
CMD ["python", "app.py", "--host=0.0.0.0", "--port=5001"]