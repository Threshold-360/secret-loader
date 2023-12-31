#!/usr/bin/env node

/**
 * @file This is what gets run when a user npx's this module
 */

const path = require('path');
const fetchSecrets = require('./lib/fetch-secrets.js');

// Get root path from arguments or use current working directory
let root = process.cwd();
if (process.argv[2]) {
    root = path.resolve(process.argv[2]);
}

(async() => {
    await fetchSecrets(true);
})();
