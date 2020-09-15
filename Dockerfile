FROM node:12.7-alpine
LABEL maintainer="alphagma@gmail.com"

COPY ./ /app/
WORKDIR /app

ENV TZ=America/Toronto
RUN yarn install --production --frozen-lockfile --non-interactive --link-duplicates && \
    yarn cache clean --all && \
    # Setting up the timezone
    apk update && \
    apk upgrade && \
    apk add ca-certificates && \
    update-ca-certificates && \
    apk add --update tzdata && \
    rm -rf /var/cache/apk/*

VOLUME /app/worklogger_home
ENTRYPOINT [ "node", "/app/index.js", "-c", "/app/worklogger_home/configuration.json" ]