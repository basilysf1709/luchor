FROM node:22-alpine AS base

WORKDIR /app

# Install agent dependencies first for better layer caching.
COPY agent/package*.json ./agent/
RUN npm --prefix agent ci --omit=dev

# Copy only agent service source.
COPY agent ./agent

WORKDIR /app/agent

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
