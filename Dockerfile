FROM node:14-alpine
LABEL maintainer="alphagma@gmail.com"

COPY ./ /app/
WORKDIR /app

RUN yarn install --frozen-lockfile --non-interactive --ignore-optional --link-duplicates && \
    yarn cache clean --all

VOLUME /app/worklogger_home
ENTRYPOINT [ "yarn", "start", "-c", "/app/worklogger_home/configuration.json" ]