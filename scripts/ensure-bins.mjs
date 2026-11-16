import { chmodSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
 
const roots = ['node_modules/@esbuild', 'node_modules/@rollup', 'node_modules/vite/bin'];
 
function walk(dir) {
    let entries;
    try {
        entries = readdirSync(dir, { withFileTypes: true });
    } catch {
        return;
    }
    for (const entry of entries) {
        const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.isFile()) {
        try {
            chmodSync(path, 0o755);
        } catch {
        /* host may not allow chmod; a fresh npm install is the real fix */
        }
    }
    }
}
 
for (const root of roots) walk(root);