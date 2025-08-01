# EventBridge API Scheduler

This project contains AWS CloudFormation template and Lambda function code for setting up an EventBridge scheduler that makes API calls to your server every 1 minute.

## Files

- `lambda_function.ts` - TypeScript Lambda function source code
- `eventbridge-scheduler.yaml` - CloudFormation template
- `build-and-deploy.js` - Local deployment script (requires AWS CLI)
- `.github/workflows/deploy.yml` - GitHub Actions deployment workflow

## Deployment Options

### Option 1: GitHub Actions (Recommended)

**Setup GitHub Secrets:**

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

**Required secrets:**
- `AWS_ACCESS_KEY_ID` - Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret access key  
- `S3_BUCKET` - S3 bucket name for storing Lambda zip (e.g., `my-lambda-deployments`)

**Optional secrets:**
- `AWS_REGION` - AWS region (defaults to `us-east-1`)

**IAM Permissions needed:**
Your AWS user needs these permissions:
- `s3:PutObject` on your S3 bucket
- `cloudformation:*` for stack operations
- `lambda:*` for Lambda function management
- `events:*` for EventBridge rules
- `iam:CreateRole`, `iam:AttachRolePolicy` for Lambda execution role

**Deploy:**
- **Automatic:** Push code to main/master branch