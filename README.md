# Threshold 360's secret loader

This is a custom npm module designed to allow the Threshold 360 team to dynamically import secrets into various environments from a secure store.
This module has been kept public to allow for maximum flexibility in our stack, so there should not be any private information found here.

This package has two main functions:

- The ability to fetch secrets so that they can be used locally in your environment
- An importable module that loads variables from secret files so that you can use them in your code

It's worth noting that the second function can only really be used in Node.js projects.
If you are manually fetching the secrets and using them in another kind of project, you will be responsible for parsing them correctly.

# How to use this package

This package is stored in the GitHub npm registry, so you can install it using this command:

`npm i github:Threshold-360/secret-loader`

## Prerequisite: Bitwarden authentication

### Authenticating from you local development environment

Obtain a recent version of `.threshold-secrets.json` and store it in your home directory (`~/.threshold-secrets.json`).

### Authenticating from a deployed instance

Make sure you have configured the following environment variables for the deployed instance:

- `TH_BW_CLIENT_ID`
- `TH_BW_CLIENT_SECRET`
- `TH_BW_PASSWORD`

You can steal these values from `.threshold-secrets.json`.

This package will also allow for using the default Bitwarden environment variables if necessary:

- `BW_CLIENTID`
- `BW_CLIENTSECRET`
- `BW_PASSWORD`

But it is recommended to use the Threshold specific ones.

## Example usage

### From a Node.js application

TODO provide example

### From the command line

From another project:
```
npx @threshold-360/secret-loader
```

You can technically omit `@threshold-360/`, but it's safer to leave it in.

If you want to test this command locally from within this project, you can run it using the following:
```
npx .
```

Note: This command only loads the secret files. You still need to use `loadSecrets` in your scripts (or parse them yourself in non Node.js projects).

# How to update this package

In order to publish new versions of this package you will need to generate your own personal access token (legacy), and have the appropriate authorization within the Threshold 360 organization.
That will allow you to access the GitHub npm registry for the org.

It is recommended that you set up a `~/.npmrc` (home directory) file with the following contents in order to authenticate with the GitHub npm registry.

```
//npm.pkg.github.com/:_authToken=YOUR_ACCESS_TOKEN
```

You can find more details about how to create an access token on GitHub [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

Once you have successfully set up your credentials, and you are ready to publish, simply run `npm publish`. Be sure to update the version in package.json first!
