FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

FROM node:20-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .

ENV PORT=3000
ENV MONGO_URI=mongodb://mongodb-service:27017/blog
EXPOSE 3000

CMD ["node", "app.js"]