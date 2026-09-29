const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.join(process.cwd(), 'public', 'assets');
const codeDirs = [
  path.join(process.cwd(), 'src'),
  path.join(process.cwd(), '.agents'),
];

const VALID_IMAGE_EXTS = ['.jpg', '.jpeg', '.png'];
const CODE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.css', '.md'];

function getAllFiles(dir, extensions) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
      results = results.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

function updateCodeReferences(oldName, newName) {
  const codeFiles = codeDirs.flatMap((d) => getAllFiles(d, CODE_EXTS));
  let updatedCount = 0;
  for (const file of codeFiles) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(oldName)) {
      content = content.split(oldName).join(newName);
      fs.writeFileSync(file, content, 'utf8');
      updatedCount++;
    }
  }
  return updatedCount;
}

async function convertFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!VALID_IMAGE_EXTS.includes(ext)) return null;

  const baseName = path.basename(filePath, ext);
  const outPath = path.join(path.dirname(filePath), `${baseName}.webp`);
  const oldFileName = path.basename(filePath);
  const newFileName = `${baseName}.webp`;

  try {
    const origStat = fs.statSync(filePath);
    await sharp(filePath)
      .webp({ quality: 82, effort: 6 })
      .toFile(outPath);

    const newStat = fs.statSync(outPath);
    const saved = Math.round((1 - newStat.size / origStat.size) * 100);

    console.log(
      `✓ Converted: ${oldFileName} (${Math.round(origStat.size / 1024)}KB) -> ${newFileName} (${Math.round(newStat.size / 1024)}KB) [${saved}% saved]`
    );

    // Update code references across src & .agents
    const refsCount = updateCodeReferences(oldFileName, newFileName);
    if (refsCount > 0) {
      console.log(`  Updated references in ${refsCount} file(s): ${oldFileName} -> ${newFileName}`);
    }

    // Safely remove original unconverted file
    fs.unlinkSync(filePath);
    return { oldFile: oldFileName, newFile: newFileName };
  } catch (err) {
    console.error(`Error converting ${filePath}:`, err);
    return null;
  }
}

async function convertAll() {
  const files = getAllFiles(targetDir, VALID_IMAGE_EXTS);
  if (files.length === 0) {
    console.log('No unoptimized JPG/PNG images found in public/assets.');
    return;
  }
  console.log(`Found ${files.length} non-WebP image(s) to optimize...`);
  for (const f of files) {
    await convertFile(f);
  }
  console.log('All images converted to WebP successfully.');
}

// If run with --watch flag, monitor public/assets for any new image drops
if (process.argv.includes('--watch')) {
  console.log(`👀 Watching ${targetDir} for any new PNG/JPG images to auto-convert to WebP...`);
  fs.watch(targetDir, async (eventType, filename) => {
    if (!filename) return;
    const ext = path.extname(filename).toLowerCase();
    if (VALID_IMAGE_EXTS.includes(ext)) {
      const fullPath = path.join(targetDir, filename);
      // Brief debounce for file writes to finish
      setTimeout(async () => {
        if (fs.existsSync(fullPath)) {
          await convertFile(fullPath);
        }
      }, 500);
    }
  });
} else {
  convertAll().catch(console.error);
}

module.exports = { convertFile, convertAll };
