## Installing locally

This repository is also setup to run locally. For this, you will need a copy of the source code and its dependencies:

```bash
git clone https://github.com/AlphaGit/worklogger.git
cd worklogger
yarn install
```

From there, you can execute the code by calling:

```
yarn start <parameters>
```

As for the parameters, you can pass:

- `-c <filePath>` to load the configuration file from the specified path. Otherwise, it will be loaded from `worklogger.json`.
- `-s3 <bucketPath>` to use an S3 bucket folder as a home directory instead of a local home directory.