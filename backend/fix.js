const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

code = code.replace(
  /\`\} \],\s*\}\),\s*\}\);/,
  '` }],\n    });'
);

fs.writeFileSync('server.js', code);
console.log('Done');
