## Installing through Serverless

This repository is already setup to work with the Serverless Framework. In order to use it, clone the repository to a local directory:

```bash
git clone https://github.com/AlphaGit/worklogger.git
cd worklogger
yarn install
```

From here on, you can use the local installation of serverless (through `npx sls`) and configure it / authenticate / deploy to different services.

For instance, configuring it for AWS could be done like so:

```bash
npx sls config credentials --provider aws --key [AWS_KEY] --secret [AWS_KEY_SECRET]
```

And deployment can be done as simple as this:

```bash
npx sls deploy
```

If you want to change any of the setup, you can review the `serverless.yml` file and adapt it to your scenario, including trigger times and arguments.

Remember that you will need to update the [configuration file](configuration.md).

Note that the framework will not upload the configuration files, so you will have to place them manually on the source location where they are to be retrieved. There's already an S3 dependency setup to work as the "home" folder for retrieving these configurations, but if you wished to include them statically in the deployment, you will need to update the definition fo the deployment package in `serverless.yml`.