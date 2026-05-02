# syntax=docker/dockerfile:1

# Step 1: Install dependencies (caching layer)
FROM oven/bun:alpine AS deps
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Step 2: Build the application
FROM oven/bun:alpine AS build
WORKDIR /app

# Define build arguments for environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG GEMINI_API_KEY
ARG APP_URL

# Set environment variables for the build process
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    GEMINI_API_KEY=$GEMINI_API_KEY \
    APP_URL=$APP_URL

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN bun run build

# Step 3: Serve the application with Nginx
FROM nginx:alpine
# Copy the build output
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
