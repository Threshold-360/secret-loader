const os = require('os');
const fs = require('fs/promises');
const path = require('path');
const shell = require('shelljs');
const pkgDir = require('pkg-dir');

const DEBUG = false;

async function fetchSecrets(verbose) {

    const SECRETS_DIR = path.resolve(await pkgDir(), '.threshold-secrets');
    const CREDENTIALS_FILE = path.resolve(os.homedir(), '.threshold-secrets.json');

    let credentials;

    try {
        credentials = require(CREDENTIALS_FILE);
        if (verbose) console.log(`Using credentials from '~/.threshold-secrets.json'`);
    } catch (e) {
        // Get credentials from environment variable
        // Attempt to use TH specific variables first, but fall back to default BW credentials expected by BW CLI
        credentials = {
            TH_BW_CLIENT_ID: process.env.TH_BW_CLIENT_ID || process.env.BW_CLIENTID,
            TH_BW_CLIENT_SECRET: process.env.TH_BW_CLIENT_SECRET || process.env.BW_CLIENTSECRET,
            TH_BW_PASSWORD: process.env.TH_BW_PASSWORD || process.env.BW_PASSWORD
        };
        if (!credentials.TH_BW_CLIENT_ID || !credentials.TH_BW_CLIENT_SECRET || !credentials.TH_BW_PASSWORD){
            throw new Error(`Unable to get all credentials from environment variables: TH_BW_CLIENT_ID/BW_CLIENTID, TH_BW_CLIENT_SECRET/BW_CLIENTSECRET, TH_BW_PASSWORD/BW_PASSWORD`);
        }
        console.log('Using credentials from environment variables');
    }

    // Set the environment variables that are expected by Bitwarden CLI
    process.env.BW_CLIENTID = credentials.TH_BW_CLIENT_ID;
    process.env.BW_CLIENTSECRET = credentials.TH_BW_CLIENT_SECRET;
    process.env.BW_PASSWORD = credentials.TH_BW_PASSWORD;

    if (verbose) console.log('Fetching secret environment variable files from Bitwarden...');

    // Item id of the secrets file
    const productionSecretsId = '55ce8907-9407-4514-bf09-b097012e798a';
    const stagingSecretsId = 'eed0fab2-53d3-4489-982c-b097012e8c04';
    const devSecretsId = 'a83af41a-dd02-4a64-b887-b09800deb316';
    const testSecretsId = '270527f9-fe9e-44d2-937e-b09800e81949';

    // Reset login state
    run(`npx bw logout`);
    // --apiKey uses the credentials stored in BW_CLIENTID and BW_CLIENTSECRET
    run(`npx bw login --apikey`);

    // Get session
    const stdout = run(`npx bw unlock --passwordenv BW_PASSWORD`);
    const lines = stdout.split('\n');
    const session = lines.pop().split(' ').pop();
    if (DEBUG && verbose) console.log(`Using session token: '${session}'`);

    // Get production secrets
    const prodSecrets = JSON.parse(run(`npx bw --session "${session}" get item ${productionSecretsId}`));
    if (DEBUG && verbose) console.log(prodSecrets);
    // Get staging secrets
    const stagSecrets = JSON.parse(run(`npx bw --session "${session}" get item ${stagingSecretsId}`));
    if (DEBUG && verbose) console.log(stagSecrets);
    // Get dev secrets
    const devSecrets = JSON.parse(run(`npx bw --session "${session}" get item ${devSecretsId}`));
    if (DEBUG && verbose) console.log(devSecrets);
    // Get test secrets
    const testSecrets = JSON.parse(run(`npx bw --session "${session}" get item ${testSecretsId}`));
    if (DEBUG && verbose) console.log(testSecrets);

    // Logout
    run(`npx bw logout`);

    // Make sure the secrets dir exists
    if (verbose) console.log(`Removing existing '.threshold-secrets'`);
    run(`rm -rf ${SECRETS_DIR}`);
    run(`mkdir ${SECRETS_DIR}`);
    if (verbose) console.log(`Created new '.threshold-secrets' directory`);

    const prodFile = path.resolve(SECRETS_DIR, prodSecrets.name);
    const stagFile = path.resolve(SECRETS_DIR, stagSecrets.name);
    const devFile = path.resolve(SECRETS_DIR, devSecrets.name);
    const testFile = path.resolve(SECRETS_DIR, testSecrets.name);

    const gitIgnores = [
        '.gitignore',
        path.relative(SECRETS_DIR, prodFile),
        path.relative(SECRETS_DIR, stagFile),
        path.relative(SECRETS_DIR, devFile),
        path.relative(SECRETS_DIR, testFile)
    ];

    // Create the .gitignore file
    fs.writeFile(path.resolve(SECRETS_DIR, '.gitignore'), gitIgnores.join('\n'), {flag: 'w'}).then(() => {
        if (verbose) console.log(`Added '.gitignore'`);
    });

    // Write file to output and make sure files are .gitignored
    fs.writeFile(prodFile, prodSecrets.notes, {flag: 'w'}).then(() => {
        if (verbose) console.log(`Added '${prodSecrets.name}'`);
    });
    fs.writeFile(stagFile, stagSecrets.notes, {flag: 'w'}).then(() => {
        if (verbose) console.log(`Added '${stagSecrets.name}'`);
    });
    fs.writeFile(devFile, devSecrets.notes, {flag: 'w'}).then(() => {
        if (verbose) console.log(`Added '${devSecrets.name}'`);
    });
    fs.writeFile(testFile, testSecrets.notes, {flag: 'w'}).then(() => {
        if (verbose) console.log(`Added '${testSecrets.name}'`);
    });
}

/**
 * Helper function to run a command and returns the output. Mutes output to the console when not debugging
 * @param command {string} the command to run
 * @return {string} stdout of the command
 */
function run(command) {
    const exec = shell.exec(command, {silent: !DEBUG});
    if (DEBUG) console.log();
    return exec.stdout;
}

module.exports = fetchSecrets;
