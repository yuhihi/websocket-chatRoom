FROM node:8-alpine
COPY ./ app
WORKDIR /app
RUN npm install

EXPOSE 8011
CMD ["npm", "dev"]