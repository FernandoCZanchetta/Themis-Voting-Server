FROM node:20

WORKDIR /server

COPY package*.json ./
RUN npm i

COPY . .

RUN npx playwright install --with-deps

RUN npx prisma generate

RUN npm run build

EXPOSE 5193

CMD ["npm", "run", "deploy"]
