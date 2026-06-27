## Installing through Docker containers

This application works as a one-shot container, the image for which you can download from [Docker Hub](https://hub.docker.com/repository/docker/alphadock/worklogger).

```bash
docker pull alphadock/worklogger
```

Since the image requires some information to be setup through local files and environment variables, you will need to specify some of those by creating a container:

```bash
docker create \
    -v /path/to/your/application/folder:/app/worklogger_home \
    -e TZ=America/Toronto \
    --name worklogger \
    alphadock/worklogger
```

You can replace the following elements:

- `America/Toronto` with your timezone of preference, with any of the [valid timezones from the tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
- `--name worklogger` can be any name that you want to use to identify this container
- `/path/to/your/application/folder` to the **Worklogger Home folder**, a directory that should contain the following files:
    - `configuration.json` with the [application configuration](configuration.md)
    - If using local storage for credential files (instead of S3), ensure the [Google Input configuration files](google-calendar.md) are present in here as well.
    - Notice that all output files will be written to this folder too.

If you don't want to do all of it manually, you can take this docker-compose file and edit it:

```yaml
services:
  worklogger:
    image: alphadock/worklogger:latest
    volumes:
      - ./worklogger_home:/app/worklogger_home
    env:
      - TZ=America/Toronto
```

Finally, you can setup a cronjob that will run this command with the periodicity that you'd like:

```bash
docker start -a worklogger

# or...

docker-compose run worklogger
```

While having the containers detached is a common practice, it will prevent your cronjob from receiving the output of the operation, so I'd suggest leaving it attached.