const fs = require('fs');
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

// Track div nesting more carefully - show line by line
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

  // Check for div opening/closing
  if (c === '<' && code[i+1] === 'd' && code.slice(i, i+5) === '<div ') {
    depth++;
    console.log('LINE', line+1, 'OPEN div (depth now', depth + ')');
  } else if (c === '<' && code.slice(i, i+6) === '</div>') {
    depth--;
    if (depth < 0) {
      console.log('LINE', line+1, 'EXTRA CLOSE div (depth now', depth + ')');
      depth = 0;
    } else {
      console.log('LINE', line+1, 'CLOSE div (depth now', depth + ')');
    }
  }
}