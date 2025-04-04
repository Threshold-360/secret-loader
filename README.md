# Threshold 360's secret loader

This is a custom npm module designed to allow the Threshold 360 team to dynamically import secrets into various environments from a secure store.
This module has been kept public to allow for maximum flexibility in our stack, so there should not be any private information found here.

This package has two main functions:

- The ability to fetch secrets so that they can be used locally in your environment
- An importable module that loads variables from secret files so that you can use them in your code

It's worth noting that the second function can only be directly used in Node.js projects.

Bitwarden notes are limited to 1000 characters, so it was necessary to add the ability to load multiple files for default variables.

# How to use this package

This package is stored in the GitHub npm registry, so you can install it using this command:

```
npm i github:Threshold-360/secret-loader
```

To use a specific commit or tag, make sure to append the tag after an `#` symbol:
```
npm i github:Threshold-360/secret-loader#v1.0.6
npm i github:Threshold-360/secret-loader#911fc51750883feed661412cbdd572780bf1b738
```

## Prerequisite: Bitwarden authentication

### Authenticating from you local development environment

Obtain a recent version of `.threshold-secrets.json` and store it in your home directory (`~/.threshold-secrets.json`).
This should go in your User folder if you are on Windows.

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

## Standard environment variable loading algorithm

![implementation.svg](./implementation.svg)

## Example usage

### From a Node.js application

```javascript
// Import
const { loadSecrets } = require('@threshold-360/secret-loader');

// environment could also be any of the following:
// 'staging', 'development', 'testing', 'prod', 'stag', 'dev', 'test'
let environment = 'production';

// Load secrets into environment variables
// Overrides vars by default
loadSecrets(environment);
// But it can also be used without overriding existing vars
loadSecrets(environment, false);

// Make use of variables in process.env
console.log(process.env);

// NOTE: This is not a full implementation of the standard algorithm
```

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

Successful execution of this command should produce secret files in the root of your project like so:

```
project-root/
├── .threshold-secrets/
│   ├── .gitignore
│   ├── dev-secrets.env
│   ├── secrets.env
│   ├── staging-secrets.env
│   └── test-secrets.env
├── ... other project files
```

## Using from other types of projects

If you are manually fetching the secrets and using them in another kind of project, you will be responsible for parsing them correctly.

For ruby implementations, you will probably want to use a gem like [this](https://github.com/bkeepers/dotenv) to process the secret files.

Pay close attention to load order!
The production values are supposed to be inherited to all environments, and specific environments are used to override them.
It looks like the order of this function matters, and we would want to load it in this order so that the specific environment "overrides" the production values:

```ruby
Dotenv.load('<specific-env>secrets.env', 'secrets.env')
```


# How to update this package

In order to publish new versions of this package you will need to generate your own personal access token (legacy), and have the appropriate authorization within the Threshold 360 organization.
That will allow you to access the GitHub npm registry for the org.

It is recommended that you set up a `~/.npmrc` (home directory) file with the following contents in order to authenticate with the GitHub npm registry.

```
//npm.pkg.github.com/:_authToken=YOUR_ACCESS_TOKEN
```

You can find more details about how to create an access token on GitHub [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

Once you have successfully set up your credentials, and you are ready to publish, simply run `npm publish`. Be sure to update the version in package.json first!
