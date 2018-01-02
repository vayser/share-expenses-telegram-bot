FROM node:8.4.0

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn
