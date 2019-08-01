FROM node:10

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

#RUN npm run build:server
#RUN ls -la build

EXPOSE 5001

#CMD ["npm", "run", "server:prod"]
CMD ["npm", "start"]
