/**
 * Test-only JSON-lines batch adapter for the UNMODIFIED JavaScript Jactari
 * single-stack core. A Python test drives this oracle; no network server.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {readFileSync} from 'node:fs';
import {resolveStackDuel} from './core.mjs';

const raw=readFileSync(0,'utf8');
const requests=JSON.parse(raw);
if(!Array.isArray(requests)||requests.length>2000)
 throw new RangeError('Bounded list of duel requests required');
process.stdout.write(JSON.stringify(requests.map(x=>resolveStackDuel(x)))+'\n');
