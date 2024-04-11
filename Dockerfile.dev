# Build the image as production
# So we can minimize the size
FROM node:latest

ARG PORT
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE $PORT

CMD ["npm", "run", "dev"]
