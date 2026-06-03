const fs = require('fs');
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

let brace = 0, paren = 0, angle = 0;
let issues = [];
let lastOpenAngle = -1;

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  const next2 = code.slice(i, i+2);
  const line = code.slice(0, i).split('\n').length;

  // Skip strings and comments
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

  // Track braces, parens
  if (c === '{') brace++;
  if (c === '}') brace--;
  if (c === '(') paren++;
  if (c === ')') paren--;

  // Track angle brackets (JSX)
  if (c === '<') {
    const next3 = code.slice(i, i+3);
    if (next3 === '!--') {
      // HTML comment
      const j = code.indexOf('-->', i);
      if (j !== -1) { i = j + 2; continue; }
    }
    // Check if it's a closing tag
    if (code[i+1] === '/') {
      angle--;
    } else {
      // Check for self-closing
      const rest = code.slice(i);
      const match = rest.match(/^<([a-zA-Z][a-zA-Z0-9]*)([^>]*)\/>/);
      if (!match) {
        // Opening tag - track it
        lastOpenAngle = line;
        angle++;
      }
      // Self-closing or regular - handled above
    }
  }
  if (c === '>') {
    // Only close if we opened a tag (not self-closing handled in open)
    // This is simplified
  }
}

// More careful: count all < and > as angle brackets
angle = 0;
for (let i = 0; i < code.length; i++) {
  const c = code[i];
  const next2 = code.slice(i, i+2);
  const next3 = code.slice(i, i+3);
  const line = code.slice(0, i).split('\n').length;

  if (c === '"' || c === "'" || c === '`') {
    let j = i + 1;
    while (j < code.length && code[j] !== c) {
      if (code[j] === '\\') j++;
      j++;
    }
    i = j;
    continue;
  }

  if (next2 === '//' || next3 === '-->') {
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

  if (c === '{') brace++;
  if (c === '}') brace--;
  if (c === '(') paren++;
  if (c === ')') paren--;
  if (c === '<') angle++;
  if (c === '>') angle--;
}

console.log('Final balances: brace=' + brace + ' paren=' + paren + ' angle=' + angle);

// Now find where angle brackets balance out
brace = 0; paren = 0; angle = 0;
let inString = false, stringChar = '';
let lastAngleOpen = -1;

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  const next2 = code.slice(i, i+2);
  const lineNum = code.slice(0, i).split('\n').length;

  // String handling
  if (!inString && (c === '"' || c === "'" || c === '`')) {
    inString = true;
    stringChar = c;
  } else if (inString && c === stringChar && code[i-1] !== '\\') {
    inString = false;
    continue;
  }

  if (inString) continue;

  // Skip comments
  if (next2 === '//') {
    const j = code.indexOf('\n', i);
    if (j !== -1) i = j;
    continue;
  }
  if (next2 === '/*') {
    const j = code.indexOf('*/', i);
    if (j !== -1) i = j + 2;
    continue;
  }

  if (c === '{') brace++;
  if (c === '}') brace--;
  if (c === '(') paren++;
  if (c === ')') paren--;
  if (c === '<') angle++;
  if (c === '>') angle--;

  if (angle < 0) {
    console.log('Extra > at line', lineNum, ':', code.split('\n')[lineNum-1]);
    angle = 0;
  }
}

console.log('Final: brace=' + brace + ' paren=' + paren + ' angle=' + angle);