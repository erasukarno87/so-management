const fs = require('fs');
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

// Find the SalesOrders function start
const funcStart = code.indexOf('function SalesOrders()');

// Debug: show the function header
const funcHeader = code.slice(funcStart, funcStart + 100);
console.log('Function header:');
console.log(JSON.stringify(funcHeader));

// Manual check of what we're looking for
const section = code.slice(funcStart, funcStart + 500);
const returnIdx = section.indexOf('return');
console.log('\nreturn in first 500 chars:', returnIdx);
if (returnIdx !== -1) {
  console.log('Context:', JSON.stringify(section.slice(returnIdx, returnIdx + 50)));
}

// Let's count braces from the function start
let brace = 0;
let charBefore = '';
for (let i = funcStart; i < funcStart + 1000 && i < code.length; i++) {
  const c = code[i];
  if (c === '{') brace++;
  if (c === '}') brace--;
  if (brace < 0) {
    console.log('Brace went negative at offset', i - funcStart);
    break;
  }
  charBefore = code.slice(Math.max(0, i-10), i+1);
}
console.log('\nBrace balance after 1000 chars:', brace);
console.log('Char before negative (if any):', JSON.stringify(charBefore));