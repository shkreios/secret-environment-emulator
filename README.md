# Github action to generate global envs from special prefixed secrets

# Example

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: shkreios/secret-environment-emulator-action@v1
        with:
          secrets: ${{ toJson(secrets) }}
          environment: ${{ (endsWith(github.ref,'refs/heads/main') || contains(github.ref, 'tags')) && 'production' || 'staging' }}
          globalPrefix: ALL
```
