const fs = require('fs');
const babel = require('@babel/parser');
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

// Find the SalesOrders function
const funcStart = code.indexOf('function SalesOrders()');
const exportStart = code.indexOf('export default SalesOrders');
const salesOrdersCode = code.slice(funcStart, exportStart);

// Find the LAST return
const returnPositions = [];
let searchFrom = 0;
while (true) {
  const idx = salesOrdersCode.indexOf('return (', searchFrom);
  if (idx === -1) break;
  returnPositions.push(idx);
  searchFrom = idx + 1;
}

const lastReturn = returnPositions[returnPositions.length - 1];
const jsxStart = lastReturn + 'return ('.length;

// Get JSX content
const jsxContent = salesOrdersCode.slice(jsxStart);

// Find where the return statement ends
const closePattern = ';\n}';
const closeIdx = jsxContent.lastIndexOf(closePattern);
const jsxCode = jsxContent.slice(0, closeIdx);

console.log('Return JSX length:', jsxCode.length);
console.log('Return JSX lines:', jsxCode.split('\n').length);

// Print first 15 lines of the return JSX
const lines = jsxCode.split('\n');
console.log('\nFirst 15 lines of return JSX:');
for (let i = 0; i < 15; i++) {
  console.log((i+1) + ': ' + lines[i]);
}

// Try parsing with a wrapper
const wrapped = 'function Test() { return <>' + jsxCode + '</>; }';
try {
  babel.parse(wrapped, { sourceType: 'module', plugins: ['jsx'] });
  console.log('\nWrapped JSX: OK');
} catch(e) {
  console.log('\nWrapped JSX: ERROR');
  console.log('Error:', e.message);
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