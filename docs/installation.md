# Installing Worklogger

## Common to any distribution

1. Create a worklogger directory somwhere in your disk.

   ```console
   mkdir -p ~/worklogger
   ```
   
   It doesn't need to be called `worklogger`, and it can be anywhere you want.
   
1. Create a configuration file. You can base it on the [configuration template](configuration.md) available. Save it inside the worklogger directory.

1. Connect your specific services.

   1. If you need to connect to Jira, see [Getting a Jira Password/token](https://github.com/AlphaGit/worklogger#getting-a-jira-passwordtoken).
   1. If you need to connect to Harvest, see [Getting a Harvest personal token](https://github.com/AlphaGit/worklogger#getting-a-harvest-personal-token).
   1. If you need to connect to Google Calendar, see [Allowing Google Calendar APIs](https://github.com/AlphaGit/worklogger#allowing-google-calendar-apis) and [Getting calendar IDs](https://github.com/AlphaGit/worklogger#getting-your-calendar-ids).

## Docker version (recommended)

Docker makes it easy to run the system without requiring dependencies or dealing with JavaScript files.

1. Install docker: https://docs.docker.com/get-docker/
   
1. Create a container with the right configuration.

   1. Replace `/my/path` with your full worklogger path.
   1. Replace `America/Buenos_Aires` with the name of your timezone ([check the list here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)).

   ```console
   docker create -v /my/path:/app/worklogger_home -e TZ=America/Buenos_Aires --name worklogger alphadock/worklogger:latest
   ```
   
1. Run it!

   When you're ready to run it to synchronize your worklogs, just execute the container. It will end on its own.
   
   ```console
   docker start -a worklogger
   ```
   
   Consider using a task manager / cron to set it up recurrently.
     
### Upgrading

1. Get the latest version of the image

   ```console
   docker pull alphadock/worklogger:latest
   ```
   
   You can replace `latest` with `v1.1.0` or any other version you want, from [any of the tags available](https://hub.docker.com/r/alphadock/worklogger/tags). Don't worry if you specify `latest`, as it will not update without you knowing about it.

1. Recreate your container

   1. Replace `/my/path` with your full worklogger path.
   1. Replace `America/Buenos_Aires` with the name of your timezone ([check the list here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)).

    ```console
    docker rm worklogger
    docker create -v /my/path:/app/worklogger_home -e TZ=America/Buenos_Aires --name worklogger alphadock/worklogger:latest
    ```

## Node

(Instructions pending)

## Serverless

(Instructions pending)
