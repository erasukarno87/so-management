const fs = require('fs');
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

let braceBalance = 0;
let parenBalance = 0;
let bracketBalance = 0;

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  const next2 = code.slice(i, i+2);

  if (c === '"' || c === "'") {
    let j = i + 1;
    while (j < code.length && code[j] !== c) {
      if (code[j] === '\\') j++;
      j++;
    }
    i = j;
    continue;
  }

  if (c === '`') {
    let j = i + 1;
    while (j < code.length && code[j] !== '`') {
      if (code[j] === '\\') j++;
      j++;
    }
    i = j;
    continue;
  }

  if (next2 === '//') {
    let j = code.indexOf('\n', i);
    if (j === -1) break;
    i = j;
    continue;
  }

  if (next2 === '/*') {
    let j = code.indexOf('*/', i);
    if (j === -1) break;
    i = j + 2;
    continue;
  }

  if (c === '{') braceBalance++;
  if (c === '}') braceBalance--;
  if (c === '(') parenBalance++;
  if (c === ')') parenBalance--;
  if (c === '[') bracketBalance++;
  if (c === ']') bracketBalance--;
}

const lines = code.split('\n');
let lineBrace = 0, lineParen = 0, lineBracket = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (const c of line) {
    if (c === '{') lineBrace++;
    if (c === '}') lineBrace--;
    if (c === '(') lineParen++;
    if (c === ')') lineParen--;
    if (c === '[') lineBracket++;
    if (c === ']') lineBracket--;
  }

  if (i >= 380 && i <= 743) {
    const state = lineBrace + '/' + lineParen + '/' + lineBracket;
    console.log((i+1) + ': ' + state + '  ' + line.slice(0, 80));
  }
}

console.log('\nFinal: brace=' + braceBalance + ' paren=' + parenBalance + ' bracket=' + bracketBalance);