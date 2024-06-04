# Build the image as production
# So we can minimize the size
FROM node:22-alpine

ARG PORT
ENV NODE_PATH=./dist
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./

RUN npm install
RUN npm install -g typescript
COPY . .

RUN tsc

EXPOSE $PORT

CMD ["node", "./dist/app.js"]
