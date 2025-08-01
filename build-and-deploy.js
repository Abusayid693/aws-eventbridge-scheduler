#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('Building and deploying Lambda function to S3...');

// Build the TypeScript
console.log('1. Building TypeScript...');
try {
  execSync('npx tsc', { stdio: 'inherit' });
} catch (error) {
  console.error('TypeScript build failed:', error.message);
  process.exit(1);
}

// Read the compiled JavaScript
const jsFilePath = path.join(__dirname, 'dist', 'lambda_function.js');
if (!fs.existsSync(jsFilePath)) {
  console.error('Compiled JavaScript file not found at:', jsFilePath);
  process.exit(1);
}

let jsContent = fs.readFileSync(jsFilePath, 'utf8');

// Clean up the code - remove TypeScript compilation artifacts
jsContent = jsContent
  .replace(/^"use strict";\s*$/gm, '')
  .replace(/Object\.defineProperty\(exports, "__esModule", \{ value: true \}\);\s*/g, '')
  .replace(/exports\.handler = void 0;\s*/g, '')
  .replace(/exports\.handler = handler;/g, '')
  .replace(/\/\/# sourceMappingURL=.*$/gm, '')
  .trim();

// The function is already declared as 'const handler', so just add exports at the end
jsContent += '\n\nexports.handler = handler;';

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Write the cleaned JavaScript
const cleanedJsFile = path.join(distDir, 'index.js');
fs.writeFileSync(cleanedJsFile, jsContent);

console.log('2. Creating deployment package...');

// Create zip file
const zipPath = path.join(distDir, 'lambda-deployment.zip');
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ Created deployment package: ${archive.pointer()} bytes`);
  
  // Upload to S3
  console.log('3. Uploading to S3...');
  
  const s3Bucket = process.env.S3_BUCKET || process.argv[2];
  if (!s3Bucket) {
    console.error('❌ S3 bucket not specified. Use: npm run deploy YOUR_BUCKET_NAME');
    console.error('   Or set S3_BUCKET environment variable');
    process.exit(1);
  }
  
  const s3Key = process.env.S3_KEY || 'lambda-deployment.zip';
  
  try {
    execSync(`aws s3 cp ${zipPath} s3://${s3Bucket}/${s3Key}`, { stdio: 'inherit' });
    console.log('✅ Uploaded to S3 successfully!');
    
    // Deploy CloudFormation
    console.log('4. Deploying CloudFormation stack...');
    const deployCmd = `aws cloudformation deploy --template-file eventbridge-scheduler.yaml --stack-name eventbridge-api-scheduler --capabilities CAPABILITY_IAM --parameter-overrides S3Bucket=${s3Bucket} S3Key=${s3Key} ApiEndpoint=${process.env.API_ENDPOINT || 'https://your-api-server.com/endpoint'}`;
    
    execSync(deployCmd, { stdio: 'inherit' });
    console.log('🚀 Deployment completed successfully!');
    
  } catch (error) {
    console.error('❌ S3 upload or CloudFormation deployment failed:', error.message);
    process.exit(1);
  }
});

archive.on('error', (err) => {
  console.error('❌ Error creating zip file:', err);
  process.exit(1);
});

archive.pipe(output);
archive.file(cleanedJsFile, { name: 'index.js' });
archive.finalize();