# Github action to generate global envs from special prefixed secrets

Simple Action warpper around [secret-environment-emulator](https://github.com/shkreios/secret-environment-emulator)

# Examples

## Read from secrets

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: shkreios/secret-environment-emulator-action@v1
        with:
          version: v1.1.0
          prefix: RUN_ENV_
          output: ./public/env.js
          removePrefix: "true"
        env:
          RUN_ENV_EXAMPLE: ${{ secrets.EXAMPLE }}
```

```js
// resulting env.js in public folder
window.__RUNTIME_CONFIG__ = { EXAMPLE: "SECRET_VALUE" };
```

## Load from .env file

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: shkreios/secret-environment-emulator-action@v1
        with:
          version: v1.1.0
          envFile: ./qa.env
          output: ./public/env.js
          noEnvs: true
```

<!-- ```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: shkreios/secret-environment-emulator-action@v1
        with:
          version: v1.1.0
          envFile:
          prefix:
          output:
          typeDeclarationsFile:
          globalKey:
          removePrefix:
          noEnvs:
          disableLogs:
``` -->

# Configuration

| Key                  | Value                                                            | Required | Type    | Default  |
| -------------------- | ---------------------------------------------------------------- | -------- | ------- | -------- |
| version              | The version of secret-environment-emulator you want to use       | Yes      | vx.x.x  | N/A      |
| envFile              | The .env file to be parsed                                       | No       | path    | N/A      |
| prefix               | The env prefix to matched                                        | No       | string  | N/A      |
| output               | Output file path                                                 | No       | path    | ./env.js |
| typeDeclarationsFile | Output file path for the typescript declaration file             | No       | path    | N/A      |
| globalKey            | Customize the key on which the envs will be set on window object | No       | string  | N/A      |
| removePrefix         | Remove the prefix from the env                                   | No       | boolean | N/A      |
| noEnvs               | Only read envs from file not from environment variables          | No       | boolean | N/A      |
| disableLogs          | Disable logging output                                           | No       | boolean | N/A      |
