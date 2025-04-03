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

// Create a reverse map of full environment names to aliases
const REVERSE_ENVIRONMENT_ALIASES = Object.fromEntries(
    Object.entries(ENVIRONMENT_ALIASES).map(([alias, environment]) => [environment, alias])
);

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

    // Fetch all .env filenames in the secrets directory
    const envFilenames = fs.readdirSync(SECRETS_DIR)
        .filter(file => file.endsWith('.env'));

    // Take a snapshot of environment variables before loading .env files
    const ENV_SNAPSHOT = {...process.env};

    // Build the list of all production env files
    const defaultProductionFile = 'secrets.env';
    const productionFiles = [defaultProductionFile];
    productionFiles.push(...envFilenames.filter(f => f.startsWith('prod-') || f.startsWith('production-')));

    // Load base production values (default)
    // Environment files that share the same environment variables names may override eachother
    // This behavior is undefined, so avoid using the same variable names in different files
    for (const filename of productionFiles) {
        dotenv.config({
            path: path.resolve(SECRETS_DIR, filename),
            override: true
        });
    }

    // Override values from non production files if another environment is specified
    if (environment !== 'production') {
        // Get the alias for the given environment
        const alias = REVERSE_ENVIRONMENT_ALIASES[environment];
        // Get all the environment filenames that match the alias or the environment name
        // Once again, sharing variable names across files in the same environment is undefined behavior, so avoid it
        const environmentSpecificFiles = envFilenames.filter(filename => filename.startsWith(`${alias}-`) || filename.startsWith(`${environment}-`));
        for (const filename of environmentSpecificFiles) {
            dotenv.config({
                path: path.resolve(SECRETS_DIR, filename),
                override: true
            });
        }
    }

    if (!override) {
        // Restore values that were previously specified
        for (const [key, value] of Object.entries(ENV_SNAPSHOT)) {
            process.env[key] = value;
        }
    }
}

module.exports = loadSecrets;
