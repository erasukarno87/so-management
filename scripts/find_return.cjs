const fs = require('fs');
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

// Find the SalesOrders function
const funcMatch = code.match(/function SalesOrders\(\)[^{]*\{/);
const funcStart = code.indexOf(funcMatch[0]);

// Find the component return (at brace depth 1)
let braceDepth = 0;
let returnStart = -1;
let inString = false;
let stringChar = '';

for (let i = funcStart; i < code.length; i++) {
  const c = code[i];

  // Handle strings
  if (!inString && (c === '"' || c === "'")) {
    inString = true;
    stringChar = c;
  } else if (inString && c === stringChar && code[i-1] !== '\\') {
    inString = false;
  }

  if (inString) continue;

  // Track braces
  if (c === '{') braceDepth++;
  if (c === '}') {
    braceDepth--;
    if (braceDepth < 1) break; // End of component function
  }

  // Check for return at depth 1
  if (braceDepth === 1 && code.slice(i, i+10) === '  return (') {
    returnStart = i;
    break;
  }
}

console.log('Component return starts at position', returnStart);
const returnLineNum = code.slice(0, returnStart).split('\n').length;
console.log('Component return at line', returnLineNum);

// Extract JSX return content
const returnContent = code.slice(returnStart + 10); // Skip 'return ('
const closeIdx = returnContent.indexOf(';\n}');
const jsxCode = returnContent.slice(0, closeIdx);

console.log('\nReturn JSX length:', jsxCode.length);
console.log('Return JSX lines:', jsxCode.split('\n').length);

// Show first and last few lines
const lines = jsxCode.split('\n');
console.log('\nFirst 3 lines:');
lines.slice(0, 3).forEach((l, i) => console.log(i+1 + ': ' + l));
console.log('\nLast 3 lines:');
lines.slice(-3).forEach((l, i) => console.log((lines.length-2+i) + ': ' + l));

// Now let's try to parse it
const babel = require('@babel/parser');
const wrapped = 'function Test() { return <>' + jsxCode + '</>; }';
try {
  babel.parse(wrapped, { sourceType: 'module', plugins: ['jsx'] });
  console.log('\nWrapped JSX: OK');
} catch(e) {
  console.log('\nWrapped JSX: ERROR');
  console.log('Error:', e.message.split('(')[0]);
  const match = e.message.match(/\((\d+):/);
  if (match) {
    const errLine = parseInt(match[1]);
    console.log('Error at line', errLine);
    console.log('Context:');
    for (let i = Math.max(0, errLine-5); i < Math.min(lines.length, errLine+5); i++) {
      console.log((i+1) + ': ' + lines[i]);
    }
  }
}