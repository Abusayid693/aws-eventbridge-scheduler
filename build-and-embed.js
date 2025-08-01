#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building TypeScript...');

// Build the TypeScript
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

// Remove the source map comment if present
jsContent = jsContent.replace(/\/\/# sourceMappingURL=.*$/gm, '');

// Clean up the code - remove exports and require statements that won't work in Lambda inline
jsContent = jsContent
  .replace(/^"use strict";\s*$/gm, '')
  .replace(/Object\.defineProperty\(exports, "__esModule", \{ value: true \}\);\s*/g, '')
  .replace(/exports\.handler/g, 'const handler')
  .trim();

// Add the exports.handler at the end
jsContent += '\n\nexports.handler = handler;';

// Write the code to a separate file
const lambdaCodeFile = path.join(__dirname, 'lambda-code.js');
fs.writeFileSync(lambdaCodeFile, jsContent);

// Read the CloudFormation template
const cfTemplate = path.join(__dirname, 'eventbridge-scheduler.yaml');
let cfContent = fs.readFileSync(cfTemplate, 'utf8');

// Find the placeholder and replace it
const placeholder = '# LAMBDA_CODE_PLACEHOLDER';
const placeholderIndex = cfContent.indexOf(placeholder);

if (placeholderIndex === -1) {
  console.error('Could not find LAMBDA_CODE_PLACEHOLDER in CloudFormation template');
  process.exit(1);
}

// Indent the JavaScript code properly for YAML (10 spaces for ZipFile content)
const indentedJs = jsContent
  .split('\n')
  .map(line => line ? `          ${line}` : '')
  .join('\n');

// Replace the placeholder
const newCfContent = cfContent.replace(placeholder, indentedJs);

// Write the updated CloudFormation template
fs.writeFileSync(cfTemplate, newCfContent);

console.log('✅ Successfully embedded compiled TypeScript into CloudFormation template!');
console.log('📁 Lambda code also saved to lambda-code.js for reference');
console.log('🚀 Ready to deploy with: aws cloudformation deploy --template-file eventbridge-scheduler.yaml --stack-name eventbridge-api-scheduler --capabilities CAPABILITY_IAM --parameter-overrides ApiEndpoint=https://your-api-server.com/endpoint');