const fs = require('fs');
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

// Trace divs with more debug
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

  // Check for div opening - exact match for '<div '
  if (c === '<' && code.slice(charPos, charPos+5) === '<div ') {
    console.log(`Found <div  at line ${line+1}, char ${charPos}`);
    console.log(`Context: ${JSON.stringify(code.slice(charPos, charPos+30))}`);
    depth++;
    console.log(`  depth now ${depth}`);
  }
  // Check for div closing
  else if (c === '<' && code.slice(charPos, charPos+6) === '</div>') {
    console.log(`Found </div> at line ${line+1}, char ${charPos}`);
    console.log(`  depth was ${depth}, now ${depth-1}`);
    depth--;
  }

  charPos++;
}