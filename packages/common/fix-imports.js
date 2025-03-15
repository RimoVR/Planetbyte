import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = join(process.cwd(), 'dist');

function fixImports(dir) {
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(dir, file.name);

    if (file.isDirectory()) {
      fixImports(filePath);
    } else if (file.isFile() && file.name.endsWith('.js')) {
      let content = readFileSync(filePath, 'utf8');
      // Regex to match import statements with relative paths and missing .js extension
      const regex = /(import\s+.*?['"]\.[^'"]*)['"]/g;
      content = content.replace(regex, (match, p1) => {
        // Add .js extension if it's not already there
        if (!p1.endsWith('.js')) {
          return `${p1}.js'`;
        }
        return match;
      });
      writeFileSync(filePath, content);
    }
  }
}

fixImports(distDir);
console.log('Fixed import paths in dist directory.');