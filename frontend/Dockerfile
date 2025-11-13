# Next.js Dockerfile
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Set environment variables
ENV CHOKIDAR_USEPOLLING=true

# Copy dependency files including .npmrc for pnpm configuration
COPY package.json pnpm-lock.yaml* .npmrc* ./

# Clean any existing node_modules and pnpm store, then install dependencies
RUN rm -rf node_modules .pnpm-store && \
    pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Run development server
CMD ["pnpm", "dev"]