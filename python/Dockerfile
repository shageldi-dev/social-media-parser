# Use an official Python runtime as the base image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN playwright install 
RUN playwright install-deps 

# Copy the current directory contents into the container at /app
COPY . /app/

# Define environment variable
ENV ms_token="dUI8nA0tm8Zl-gH9UhiHLn9uSHXWBFVga-q1LdoUaFRaicZwUM2TfKuNkenyvMgwhS7slU87-D-h_MVlK0xwuzkI7Rm--2GWaNuqdcIwmUfjwXWo4006XnJa4VCVsy8TXukslEuRgoBeXiU="

EXPOSE 5000

# Run the application
CMD ["hypercorn", "main:app", "--bind", "0.0.0.0:8000"]
