const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  apiUrl: process.env.API_URL || 'https://your-api-domain.com/api',
  sourceDir: './',
  destDir: './dist',
  assets: [
    'index.html',
    'images'
  ],
  styles: ['css/styles.css', 'css/dark-mode.css'],
  scripts: 'js/app.js'
};

// Main build function
async function build() {
  try {
    console.log('Starting build process...');

    // 1. Clean the destination directory
    console.log(`Cleaning ${config.destDir}...`);
    fs.emptyDirSync(config.destDir);

    // 2. Copy static assets
    console.log('Copying static assets...');
    for (const asset of config.assets) {
      const sourcePath = path.join(config.sourceDir, asset);
      const destPath = path.join(config.destDir, asset);
      console.log(`Checking for asset: ${sourcePath}`);
      if (fs.existsSync(sourcePath)) {
        console.log(`Copying ${sourcePath} to ${destPath}`);
        fs.copySync(sourcePath, destPath);
        console.log(`Copied ${asset}`);
      } else {
        console.log(`Asset not found: ${sourcePath}`);
      }
    }

    // 3. Minify CSS
    console.log('Minifying CSS...');
    for (const style of config.styles) {
      const sourcePath = path.join(config.sourceDir, style);
      const destPath = path.join(config.destDir, style);
      fs.ensureDirSync(path.dirname(destPath));
      execSync(`npx cleancss -o ${destPath} ${sourcePath}`, { stdio: 'inherit' });
      console.log(`Minified ${style}`);
    }
    console.log('CSS minified successfully.');

    // 4. Minify JavaScript and update API URL
    console.log('Minifying JavaScript and updating API URL...');
    const jsSourcePath = path.join(config.sourceDir, config.scripts);
    const jsDestPath = path.join(config.destDir, config.scripts);
    let jsContent = fs.readFileSync(jsSourcePath, 'utf8');
    jsContent = jsContent.replace(
      /apiBaseUrl: ".*?"/,
      `apiBaseUrl: "${config.apiUrl}"`
    );
    fs.ensureDirSync(path.dirname(jsDestPath));
    fs.writeFileSync('temp_app.js', jsContent, 'utf8');
    execSync(`npx uglifyjs temp_app.js -o ${jsDestPath} -c -m`, { stdio: 'inherit' });
    fs.removeSync('temp_app.js');
    console.log('JavaScript minified successfully.');

    // 5. Update HTML to point to minified files
    console.log('Updating HTML references...');
    const indexPath = path.join(config.destDir, 'index.html');
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    indexContent = indexContent.replace(
      'href="css/styles.css"',
      'href="css/styles.css"'
    ).replace(
      'src="js/app.js"',
      'src="js/app.js"'
    );
    fs.writeFileSync(indexPath, indexContent, 'utf8');

    console.log('\nBuild completed successfully!');
    console.log(`- Output directory: ${config.destDir}`);
    console.log(`- API URL set to: ${config.apiUrl}`);
    console.log('- Ready for deployment.');

  } catch (error) {
    console.error('\nBuild failed:', error.message);
    process.exit(1);
  }
}

// Run the build
build();