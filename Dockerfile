FROM node:8-alpine
COPY ./ app
WORKDIR /app
RUN cnpm install && npm run dev