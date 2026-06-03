const fs = require('fs');
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

// Track div nesting - with more context
let depth = 0;
let line = 0;
let inString = false;
let stringChar = '';

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  if (c === '\n') line++;

  // Handle strings
  if (!inString && (c === '"' || c === "'" || c === '`')) {
    inString = true;
    stringChar = c;
  } else if (inString && c === stringChar && code[i-1] !== '\\') {
    inString = false;
  }
  if (inString) continue;

  // Skip comments
  if (code.slice(i, i+2) === '//' || code.slice(i, i+2) === '/*' || code.slice(i, i+3) === '-->') {
    const j = code.indexOf('\n', i);
    if (j !== -1) i = j;
    continue;
  }

  // Check for div opening
  if (c === '<' && code[i+1] === 'd' && code.slice(i, i+5) === '<div ') {
    depth++;
    console.log('OPEN', line+1, 'depth', depth);
  }
  // Check for div closing
  else if (c === '<' && code.slice(i, i+6) === '</div>') {
    console.log('CLOSE', line+1, 'depth', depth);
    depth--;
    if (depth < 0) {
      console.log('*** EXTRA ***');
      depth = 0;
    }
  }
}