const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, callback);
    } else if (stat.isFile() && /\.(tsx?|jsx?)$/.test(file)) {
      callback(filePath);
    }
  }
}

function replaceIconsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip files that don't use Ionicons
  if (!content.includes('Ionicons')) {
    return;
  }

  console.log(`Processing: ${path.relative(srcDir, filePath)}`);

  // 1. Replace JSX Tags
  content = content.replace(/<Ionicons\b/g, '<PhosphorIcon');
  content = content.replace(/<\/Ionicons>/g, '</PhosphorIcon>');

  // 2. Replace type/glyphMap references
  content = content.replace(/as keyof typeof Ionicons\.glyphMap/g, 'as any');
  content = content.replace(/typeof Ionicons\.glyphMap/g, 'any');
  content = content.replace(/Ionicons\.glyphMap/g, 'any');
  content = content.replace(/keyof typeof Ionicons/g, 'string');

  // 3. Remove/Modify Imports
  // Case A: Direct default imports like import Ionicons from '@expo/vector-icons/Ionicons'
  content = content.replace(/import\s+Ionicons\s+from\s+['"]@expo\/vector-icons\/Ionicons['"];?\r?\n?/g, '');

  // Case B: Destructured imports from @expo/vector-icons (possibly multiline)
  const vectorIconsImportRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@expo\/vector-icons['"];?\r?\n?/gs;
  content = content.replace(vectorIconsImportRegex, (match, specifiersText) => {
    let specifiers = specifiersText.split(',').map(s => s.trim()).filter(Boolean);
    specifiers = specifiers.filter(s => s !== 'Ionicons');
    if (specifiers.length === 0) {
      return ''; // remove import entirely
    }
    return `import { ${specifiers.join(', ')} } from "@expo/vector-icons";\n`;
  });

  // 4. Add the PhosphorIcon import if it was used and is not already imported
  if (content.includes('PhosphorIcon') && !content.includes('import { PhosphorIcon }')) {
    // Insert after the first import or at the very top
    const firstImportIndex = content.indexOf('import ');
    if (firstImportIndex !== -1) {
      content = content.slice(0, firstImportIndex) + `import { PhosphorIcon } from "@/components/PhosphorIcon";\n` + content.slice(firstImportIndex);
    } else {
      content = `import { PhosphorIcon } from "@/components/PhosphorIcon";\n` + content;
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

walk(srcDir, replaceIconsInFile);
console.log('Icon replacement completed successfully.');
