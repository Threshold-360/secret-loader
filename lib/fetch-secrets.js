const os = require('os');
const fs = require('fs/promises');
const path = require('path');
const shell = require('shelljs');
const pkgDir = require('pkg-dir');

const DEBUG = false;

const THRESHOLD_SECRETS_COLLECTION_ID = 'aa7b7130-0caf-47c1-b546-b2b400552972';

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

    // Reset login state
    run(`npx bw logout`);
    // --apiKey uses the credentials stored in BW_CLIENTID and BW_CLIENTSECRET
    run(`npx bw login --apikey`);

    // Get session
    const stdout = run(`npx bw unlock --passwordenv BW_PASSWORD`);
    const lines = stdout.split('\n');
    const session = lines.pop().split(' ').pop();
    if (DEBUG && verbose) console.log(`Using session token: '${session}'`);

    // Perform a sync to make sure we have the latest secrets
    if (verbose) console.log(`Syncing to make sure we have the latest date from Bitwarden...`);
    run(`npx bw sync --session "${session}"`);

    // TODO get all items in the .threshold-secrets collection
    const secretItems = JSON.parse(run(`npx bw --session "${session}" list items --collectionid ${THRESHOLD_SECRETS_COLLECTION_ID}`));

    // Logout
    run(`npx bw logout`);

    // Make sure the secrets dir exists
    if (verbose) console.log(`Removing existing '.threshold-secrets'`);
    run(`rm -rf ${SECRETS_DIR}`);
    run(`mkdir ${SECRETS_DIR}`);
    if (verbose) console.log(`Created new '.threshold-secrets' directory`);

    const gitIgnores = ['.gitignore'];

    // Write all secrets files to the output directory
    for (const {name, notes} of secretItems) {
        const filename = path.resolve(SECRETS_DIR, name);
        fs.writeFile(filename, notes, {flag: 'w'}).then(() => {
            if (verbose) console.log(`Added '${name}'`);
        });
        gitIgnores.push(path.relative(SECRETS_DIR, filename));
    }

    // Create the .gitignore file
    fs.writeFile(path.resolve(SECRETS_DIR, '.gitignore'), gitIgnores.join('\n'), {flag: 'w'}).then(() => {
        if (verbose) console.log(`Added '.gitignore'`);
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
