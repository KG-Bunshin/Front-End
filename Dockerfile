FROM node:18 AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json, package-lock.json, and .env
COPY package*.json ./
COPY .env ./.env
COPY next.config.mjs ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Next.js application
RUN npm run build

# Use a lighter image for the production environment
FROM node:18 AS runner

# Set the working directory in the container
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/next.config.mjs ./

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
