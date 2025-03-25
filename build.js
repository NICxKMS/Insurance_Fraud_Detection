const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Change this to your production API URL
  apiUrl: process.env.API_URL || 'https://your-api-domain.com/api',
  
  // Source and destination directories
  sourceDir: './',
  destDir: '../dist',
  
  // Files to copy
  filesToCopy: [
    'index.html',
    'css/**/*',
    'js/**/*'
  ]
};

// Create destination directory if it doesn't exist
if (!fs.existsSync(config.destDir)) {
  fs.mkdirSync(config.destDir, { recursive: true });
}

// Copy files
console.log('Copying files...');
for (const filePath of config.filesToCopy) {
  if (filePath.includes('*')) {
    // Handle glob patterns
    const baseDir = filePath.split('*')[0];
    const sourcePath = path.join(config.sourceDir, baseDir);
    const destPath = path.join(config.destDir, baseDir);
    
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    const files = fs.readdirSync(sourcePath);
    for (const file of files) {
      fs.copyFileSync(
        path.join(sourcePath, file),
        path.join(destPath, file)
      );
      console.log(`Copied ${baseDir}${file}`);
    }
  } else {
    // Handle individual files
    const destPath = path.join(config.destDir, filePath);
    const destDir = path.dirname(destPath);
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.copyFileSync(
      path.join(config.sourceDir, filePath),
      destPath
    );
    console.log(`Copied ${filePath}`);
  }
}

// Update API URL in app.js
console.log('Updating API URL...');
const appJsPath = path.join(config.destDir, 'js/app.js');
let appJsContent = fs.readFileSync(appJsPath, 'utf8');
appJsContent = appJsContent.replace(
  /const API_BASE_URL = .*?;/,
  `const API_BASE_URL = "${config.apiUrl}"; // Updated by build script`
);
fs.writeFileSync(appJsPath, appJsContent, 'utf8');

console.log('Build completed! The contents of the dist directory are ready for deployment.');
console.log(`API URL set to: ${config.apiUrl}`); 