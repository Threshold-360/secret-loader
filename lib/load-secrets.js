const path = require('path');
const fs = require('fs');
const pkgDir = require('pkg-dir');
const dotenv = require('dotenv');

// Define aliases
const ENVIRONMENT_ALIASES = {
    'prod': 'production',
    'stg': 'staging',
    'dev': 'development',
    'test': 'testing'
};

/**
 * Load secrets into environment variables using dotenv
 * @param environment {'production'|'prod'|'staging'|'stag'|'development'|'dev'|'testing'|'test'} the environment to load secret variables for
 * @param [override=true] {boolean} if existing environment variables should be overridden
 */
function loadSecrets(environment, override = true) {

    environment = environment.toLowerCase();

    // Use environment alias if needed
    if (ENVIRONMENT_ALIASES[environment]) {
        environment = ENVIRONMENT_ALIASES[environment];
    }

    const root = pkgDir.sync();
    const SECRETS_DIR = path.resolve(root, '.threshold-secrets');

    // Ensure the secrets directory exists
    if (!fs.existsSync(SECRETS_DIR)) {
        throw new Error(`Unable to find '.threshold-secrets' directory. You need to make sure to fetch them first (npx secret-loader)`)
    }

    const SECRET_FILES = {
        'production': path.resolve(SECRETS_DIR, 'secrets.env'),
        'staging': path.resolve(SECRETS_DIR, 'staging-secrets.env'),
        'development': path.resolve(SECRETS_DIR, 'dev-secrets.env'),
        'testing': path.resolve(SECRETS_DIR, 'test-secrets.env')
    };

    // Take a snapshot of environment variables before loading .env files
    const ENV_SNAPSHOT = {...process.env};

    // Load base production values (default)
    dotenv.config({
        path: SECRET_FILES['production'],
        override: true
    });

    // Override values from non production files
    if (environment !== 'production') {
        // Override production variables from the given environment
        dotenv.config({
            path: SECRET_FILES[environment],
            override: true
        });
    }

    if (!override) {
        // Restore values that were previously specified
        for (const [key, value] of Object.entries(ENV_SNAPSHOT)) {
            process.env[key] = value;
        }
    }
}

module.exports = loadSecrets;
