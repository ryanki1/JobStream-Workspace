#!/usr/bin/env node

/**
 * Post-processing script to add .js extensions to imports in generated OpenAPI code
 * This is required when using TypeScript with moduleResolution: "nodenext"
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const generatedDir = join(__dirname, '../libs/shared/api-types/src/lib/generated');

/**
 * Recursively find all .ts files in a directory
 */
function findTsFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const files = findTsFiles(generatedDir);
let totalFixedImports = 0;
let totalFilesModified = 0;

files.forEach(filePath => {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;
  let fileImportCount = 0;

  // Replace relative imports that don't have .js extension
  // Matches: import ... from './something' or '../something'
  // Ignores: imports that already have .js or other extensions
  const importRegex = /from\s+['"](\.\.[\/\\]|\.\/)[^'"]*(?<!\.js)['"]/g;

  const newContent = content.replace(importRegex, (match) => {
    // Extract the path from the import statement
    const pathMatch = match.match(/from\s+['"](.*)['"]/);
    if (pathMatch) {
      const importPath = pathMatch[1];
      // Add .js extension before the closing quote
      modified = true;
      fileImportCount++;
      return match.replace(importPath, `${importPath}.js`);
    }
    return match;
  });

  if (modified) {
    writeFileSync(filePath, newContent, 'utf-8');
    totalFixedImports += fileImportCount;
    totalFilesModified++;
    const relativePath = filePath.replace(generatedDir, '').substring(1);
    console.log(`✓ Fixed ${fileImportCount} import(s) in ${relativePath}`);
  }
});

console.log(`\n✅ Fixed ${totalFixedImports} imports in ${totalFilesModified} of ${files.length} files`);
