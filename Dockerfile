FROM node:12.7-alpine
LABEL maintainer="alphagma@gmail.com"

COPY ./ /app/
WORKDIR /app

RUN yarn install --production --frozen-lockfile --non-interactive --link-duplicates && \
    yarn cache clean --all

VOLUME /app/worklogger_home
ENTRYPOINT [ "node", "/app/index.js", "-c", "/app/worklogger_home/configuration.json" ]