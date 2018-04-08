FROM node:9.11-alpine
LABEL maintainer="alphagma@gmail.com"

COPY ./ /app/
WORKDIR /app
RUN npm install --only=production

# TODO simplify this into a single /app/config folder
VOLUME /app/config/config.json
VOLUME /app/_private/client_secret.json
VOLUME /app/.credentials/worklogger.json
ENTRYPOINT [ "node", "/app/start.js", "-c", "/app/config/config.json" ]