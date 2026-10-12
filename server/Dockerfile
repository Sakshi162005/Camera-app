# Dockerfile for Render deployment with native FFmpeg
FROM node:20-slim

# Install native system FFmpeg (resolves glibc NSS segmentation faults on Linux)
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Use system ffmpeg binary
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV PORT=10000

EXPOSE 10000

CMD ["npm", "start"]
