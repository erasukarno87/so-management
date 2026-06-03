const fs = require('fs');
const babel = require('@babel/parser');

// Read the file
const code = fs.readFileSync('src/client/pages/SalesOrders.jsx', 'utf8');

// Try to find the issue by parsing sections
const lines = code.split('\n');

// Check around line 385 where the return is
console.log('Checking lines around return statement:');
for (let i = 382; i <= 390; i++) {
  console.log((i+1) + ': ' + lines[i]);
}

// Try to parse just the function signature and first few lines
const testCode = code.slice(0, 2000);
try {
  babel.parse(testCode, { sourceType: 'module', plugins: ['jsx'] });
  console.log('\nFirst 2000 chars: OK');
} catch(e) {
  console.log('\nFirst 2000 chars: ERROR -', e.message.split('(')[0]);
}

// Try parsing with return statement
const withReturn = code.slice(0, 5000);
try {
  babel.parse(withReturn, { sourceType: 'module', plugins: ['jsx'] });
  console.log('First 5000 chars: OK');
} catch(e) {
  console.log('First 5000 chars: ERROR -', e.message.split('(')[0]);
}

// Find what's on line 740 (the error location)
console.log('\nLine 740:', lines[739]);

// Let me try to count all <div and </div> in the entire file
const allDivs = code.match(/<div/g) || [];
const allClosers = code.match(/<\/div>/g) || [];
console.log('\nTotal <div:', allDivs.length);
console.log('Total </div>:', allClosers.length);
console.log('Difference:', allDivs.length - allClosers.length);