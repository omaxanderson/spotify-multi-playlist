# Stage 0, build-server to compile the server
FROM node:10

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build:server

EXPOSE 5001

#CMD ["npm", "run", "server:prod"]
#CMD ["tail", "-f", "/dev/null"]
CMD ["npm", "start"]
