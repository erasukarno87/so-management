const fs = require('fs');
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

// Very explicit trace
let depth = 0;
let line = 0;
let charPos = 0;
let inString = false;
let stringChar = '';

while (charPos < code.length) {
  const c = code[charPos];
  if (c === '\n') line++;

  // Handle strings
  if (!inString && (c === '"' || c === "'" || c === '`')) {
    inString = true;
    stringChar = c;
  } else if (inString && c === stringChar && code[charPos-1] !== '\\') {
    inString = false;
  }
  if (inString) { charPos++; continue; }

  // Skip comments
  if (code.slice(charPos, charPos+2) === '//' || code.slice(charPos, charPos+2) === '/*' || code.slice(charPos, charPos+3) === '-->') {
    const j = code.indexOf('\n', charPos);
    if (j !== -1) { charPos = j + 1; continue; }
    else { break; }
  }

  // VERY EXPLICIT: Check for '<div ' (exactly)
  if (code.slice(charPos, charPos+5) === '<div ') {
    console.log(`OPEN  line ${line+1}  depth ${depth+1}  at char ${charPos}`);
    console.log(`       context: ${JSON.stringify(code.slice(charPos, charPos+40))}`);
    depth++;
  }
  // Check for div closing
  else if (code.slice(charPos, charPos+6) === '</div>') {
    console.log(`CLOSE line ${line+1}  depth ${depth-1}  at char ${charPos}`);
    depth--;
    if (depth < 0) {
      console.log(`       *** EXTRA CLOSE ***`);
      depth = 0;
    }
  }

  charPos++;
}