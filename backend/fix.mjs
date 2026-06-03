import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('server.js', 'utf8');

code = code.replace(
  /\}` \],\s*\}\),\s*\}\);/,
  '` }],\n    });'
);

writeFileSync('server.js', code);
console.log('Done');
