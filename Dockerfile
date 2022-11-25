FROM node:latest


# Create app directory
WORKDIR /usr/src/app
COPY . .

# Install app dependencies

RUN npm config set registry http://taobao.npm.taobao.org/ \
    & npm install -g npm@9.1.2 \
    & npm install

EXPOSE 3000:3000

ENTRYPOINT [ "npm run start" ]