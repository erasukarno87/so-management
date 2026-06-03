const fs = require('fs');
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

// Find return statement
const returnStart = code.indexOf('\n  return (');
const exportIdx = code.indexOf('export default');
const returnCode = code.slice(returnStart, exportIdx);

// Split into lines and track div balance
let depth = 0;
let inString = false;
let stringChar = '';
const issues = [];

const lines = returnCode.split('\n');
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];

  // Count divs in this line
  for (let j = 0; j < l.length; j++) {
    const c = l[j];

    // Track strings
    if (!inString && (c === '"' || c === "'" || c === '`')) {
      inString = true;
      stringChar = c;
    } else if (inString && c === stringChar && l[j-1] !== '\\') {
      inString = false;
    }

    if (inString) continue;

    // Check for div
    if (c === '<' && l.slice(j, j+5) === '<div ') {
      depth++;
    } else if (c === '<' && l.slice(j, j+6) === '</div>') {
      depth--;
      if (depth < 0) {
        issues.push({ line: i+1, action: 'extra close', depth });
        depth = 0;
      }
    }
  }

  inString = false;
}

console.log('Issues found:', issues.length);
issues.forEach(issue => {
  console.log('  Line', issue.line, ':', issue.action);
});