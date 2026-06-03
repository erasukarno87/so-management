const fs = require('fs');
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

// Track div nesting and find where it goes negative
let depth = 0;
let maxDepth = 0;
let line = 0;
let inString = false;
let stringChar = '';
let issues = [];

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

  // Handle comments
  if (code.slice(i, i+2) === '//') {
    const j = code.indexOf('\n', i);
    if (j !== -1) i = j;
    continue;
  }
  if (code.slice(i, i+2) === '/*') {
    const j = code.indexOf('*/', i);
    if (j !== -1) i = j + 2;
    continue;
  }

  // Check for div
  if (c === '<' && code[i+1] === 'd' && code.slice(i, i+5) === '<div ') {
    depth++;
    maxDepth = Math.max(maxDepth, depth);
  } else if (c === '<' && code.slice(i, i+6) === '</div>') {
    depth--;
    if (depth < 0) {
      const lineNum = code.slice(0, i).split('\n').length;
      issues.push(lineNum);
      console.log('Extra </div> at line', lineNum, '-', code.slice(i, i+20));
      depth = 0; // Reset to continue
    }
  }
}

console.log('\nMax nesting depth:', maxDepth);
console.log('Extra </div> count:', issues.length);