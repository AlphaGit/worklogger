FROM node:12.7-alpine
LABEL maintainer="alphagma@gmail.com"

COPY ./ /app/
WORKDIR /app
RUN npm install --only=production

# Setting up the timezone
ENV TZ=America/Toronto
RUN apk update
RUN apk upgrade
RUN apk add ca-certificates && update-ca-certificates
RUN apk add --update tzdata
RUN rm -rf /var/cache/apk/*

VOLUME /app/worklogger_home
ENTRYPOINT [ "node", "/app/start.js", "-c", "/app/worklogger_home/configuration.json" ]