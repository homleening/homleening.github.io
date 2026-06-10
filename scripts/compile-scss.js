const sass = require('sass');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../themes/even/source/css/style.scss');
const outputPath = path.join(__dirname, '../themes/even/source/css/style.css');

try {
  const result = sass.compile(inputPath, {
    style: 'expanded'
  });
  
  fs.writeFileSync(outputPath, result.css);
  console.log('SCSS compiled successfully!');
} catch (error) {
  console.error('Error compiling SCSS:', error.message);
  process.exit(1);
}
