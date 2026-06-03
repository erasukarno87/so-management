const fs = require('fs');
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

// Try parsing just up to and including the function (before export)
const exportIdx = code.indexOf('export default SalesOrders');
const codeWithoutExport = code.slice(0, exportIdx);

// Count braces, parens, brackets in the code without export
let braces = 0, parens = 0, brackets = 0;
let inString = false, stringChar = '';

for (let i = 0; i < codeWithoutExport.length; i++) {
  const c = codeWithoutExport[i];

  // Handle strings
  if (!inString && (c === '"' || c === "'" || c === '`')) {
    inString = true;
    stringChar = c;
  } else if (inString && c === stringChar && codeWithoutExport[i-1] !== '\\') {
    inString = false;
  }

  if (inString) continue;

  // Skip comments
  if (codeWithoutExport.slice(i, i+2) === '//') {
    const j = codeWithoutExport.indexOf('\n', i);
    if (j !== -1) i = j;
    continue;
  }
  if (codeWithoutExport.slice(i, i+2) === '/*') {
    const j = codeWithoutExport.indexOf('*/', i);
    if (j !== -1) i = j + 2;
    continue;
  }

  if (c === '{') braces++;
  if (c === '}') braces--;
  if (c === '(') parens++;
  if (c === ')') parens--;
  if (c === '[') brackets++;
  if (c === ']') brackets--;
}

console.log('Balance before export:');
console.log('  Braces {}:', braces);
console.log('  Parens ():', parens);
console.log('  Brackets []:', brackets);

// Find where braces go negative
braces = 0; parens = 0; brackets = 0;
inString = false;

let firstNegativeBrace = -1;
for (let i = 0; i < codeWithoutExport.length; i++) {
  const c = codeWithoutExport[i];

  if (!inString && (c === '"' || c === "'" || c === '`')) {
    inString = true;
    stringChar = c;
  } else if (inString && c === stringChar && codeWithoutExport[i-1] !== '\\') {
    inString = false;
  }

  if (inString) continue;

  if (codeWithoutExport.slice(i, i+2) === '//') {
    const j = codeWithoutExport.indexOf('\n', i);
    if (j !== -1) i = j;
    continue;
  }
  if (codeWithoutExport.slice(i, i+2) === '/*') {
    const j = codeWithoutExport.indexOf('*/', i);
    if (j !== -1) i = j + 2;
    continue;
  }

  if (c === '{') braces++;
  if (c === '}') {
    braces--;
    if (braces < 0 && firstNegativeBrace < 0) {
      firstNegativeBrace = i;
      const line = codeWithoutExport.slice(0, i).split('\n').length;
      console.log('First negative brace at line', line);
      console.log('Context:', codeWithoutExport.slice(i, i+50));
    }
  }
  if (c === '(') parens++;
  if (c === ')') parens--;
  if (c === '[') brackets++;
  if (c === ']') brackets--;
}