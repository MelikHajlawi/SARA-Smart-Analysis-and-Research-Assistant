FROM node:18-alpine

# Set working directory
WORKDIR /app

# Declare build argument for API host
ARG API_HOST
ENV API_HOST=${API_HOST}

# Install Angular CLI globally
RUN npm install -g @angular/cli@16

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --force --no-audit

# Copy application source
COPY . .

# Replace placeholder in environment.ts with the build-time API_HOST value
RUN sed -i "s|\${API_HOST}|${API_HOST}|g" src/environments/environment.ts

# Expose Angular dev server port
EXPOSE 4200

# Start the Angular dev server
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll=2000"]
