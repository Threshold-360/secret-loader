/**
 * @file This is what gets imported when a user imports this module in source
 */

import _fetchSecrets from './lib/fetch-secrets.js';
import _loadSecrets from './lib/load-secrets.js';

export const fetchSecrets = _fetchSecrets;
export const loadSecrets = _loadSecrets;
