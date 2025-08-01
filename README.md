# EventBridge API Scheduler

This project contains AWS CloudFormation template and Lambda function code for setting up an EventBridge scheduler that makes API calls to your server every 15 minutes.

## Files

- `eventbridge-scheduler.yaml` - CloudFormation template
- `lambda_function.ts` - TypeScript Lambda function code
- `package.json` - Node.js dependencies and scripts
- `tsconfig.json` - TypeScript configuration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Deploy the CloudFormation stack:
```bash
aws cloudformation deploy \
  --template-file eventbridge-scheduler.yaml \
  --stack-name eventbridge-api-scheduler \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides ApiEndpoint=https://your-api-server.com/endpoint
```

## Configuration

### Environment Variables

- `API_ENDPOINT` - The API endpoint to call (set via CloudFormation parameter)
- `API_KEY` - Optional API key for authentication

### Customization

1. **Change the schedule**: Modify the `ScheduleExpression` in the CloudFormation template
2. **Change HTTP method**: Update the `method` in the Lambda function
3. **Add authentication**: Set the `API_KEY` environment variable
4. **Modify timeout**: Adjust the Lambda timeout in CloudFormation

## Deployment Options

### Option 1: CloudFormation (Recommended)
Use the provided CloudFormation template for complete infrastructure setup.

### Option 2: Manual Lambda Deployment
1. Build and package the function:
```bash
npm run package
```
2. Upload the `lambda-deployment.zip` to AWS Lambda manually

## Monitoring

- Check CloudWatch Logs for Lambda execution logs
- Monitor EventBridge rule execution in the AWS Console
- Set up CloudWatch Alarms for failures if needed

## Schedule Options

The EventBridge rule supports various schedule expressions:
- `rate(15 minutes)` - Every 15 minutes
- `rate(1 hour)` - Every hour
- `cron(0 9 * * ? *)` - Daily at 9 AM UTC
- `cron(0/15 * * * ? *)` - Every 15 minutes using cron