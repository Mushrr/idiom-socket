FROM node:latest


# Create app directory
WORKDIR /usr/src/app
COPY . .

# Install app dependencies

RUN npm install -g yarn \
    & yarn install

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start" ]