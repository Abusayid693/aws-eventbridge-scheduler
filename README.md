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

Updated GitHub secrets list:

- AWS_ACCESS_KEY_ID (required)
- AWS_SECRET_ACCESS_KEY (required)
- S3_BUCKET (required)
- API_ENDPOINT (optional - your webhook URL)
- AWS_REGION (optional)

**IAM Permissions needed:**
Your AWS user needs these permissions:

- `s3:PutObject` on your S3 bucket
- `cloudformation:*` for stack operations
- `lambda:*` for Lambda function management
- `events:*` for EventBridge rules
- `iam:CreateRole`, `iam:AttachRolePolicy` for Lambda execution role

**Deploy:**

- **Automatic:** Push code to main/master branch
