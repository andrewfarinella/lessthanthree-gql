FROM node:8.11-alpine

ENV APP=/usr/app/
RUN mkdir -p $APP
WORKDIR $APP
COPY . $APP

RUN apk update && apk add yarn && yarn && npm i -g nodemon

CMD ["yarn", "start"]
