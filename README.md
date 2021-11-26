# Github action to generate global envs from special prefixed secrets

Some github plans do not support environments.
This action allows you to prefix your secret with an environment name and will output the key-value-pair if the prefix matches the environment input.

# Example

## Github secrets

```
ALL_AWS_REGION=us-east-1
STAGING_AWS_ACCESS_KEY_ID=****
STAGING_AWS_SECRET_ACCESS_KEY=****
PRODUCTION_AWS_ACCESS_KEY_ID=****
PRODUCTION_AWS_SECRET_ACCESS_KEY=****
```

## Workflow

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: shkreios/secret-environment-emulator@v1
        id: secrets
        with:
          secrets: ${{ toJson(secrets) }}
          environment: ${{ (endsWith(github.ref,'refs/heads/main') || contains(github.ref, 'tags')) && 'production' || 'staging' }}
          globalPrefix: ALL

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ steps.secrets.outputs.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ steps.secrets.outputs.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ steps.secrets.outputs.AWS_REGION }}
```

# Configuration

| Key          | Value                                                     | Required | Type   | Default |
| ------------ | --------------------------------------------------------- | -------- | ------ | ------- |
| secrets      | JSON string of secrets                                    | Yes      | string | N/A     |
| environment  | The prefix of the environment that should be filtered for | Yes      | string | N/A     |
| globalPrefix | The prefix of keys that always should parsed              | No       | string | ALL     |
