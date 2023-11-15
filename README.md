# Threshold 360's secret loader

This is a custom npm module designed to allow the Threshold 360 team to dynamically import secrets into various environments from a secure store.
This module has been kept public to allow for maximum flexibility in our stack, so there should not be any private information found here.

# How to use this package

This package has two main functions:

- The ability to fetch secrets so that they can be used locally in your environment
- An importable module that parses the secret files so that you can use secret values much easier in your code

It is worth noting that the second function can only really be used in Node.js projects.
If you are manually fetching the secrets and using them in another kind of project, you will be responsible for parsing them properly.

## Authenticating with Bitwarden

### From you local development environment

Obtain a recent version of `.threshold-secrets.json` and store it in your home directory (`~/.threshold-secrets.json`).

### From a deployed instance

Make sure you have configured the following environment variables for the deployed instance:

- `TH_BW_CLIENT_ID`
- `TH_BW_CLIENT_SECRET`
- `TH_BW_PASSWORD`

You can also find these values in `.threshold-secrets.json`.

# How to update this package

In order to publish new versions of this package you will need to be authenticated with the GitHub npm registry for the Threshold 360 organization.
It is recommended that you set up a `~/.npmrc` (home directory) file with the following contents in order to authenticate with the GitHub npm registry.

```
//npm.pkg.github.com/:_authToken=YOUR_ACCESS_TOKEN
```

You can find more details about how to create an access token on GitHub (here)[https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens].

Once you have successfully set up your credentials, you can simply run `npm publish` to create a new version (be sure to update the version in package.json first).
