import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

interface ApiResponse {
  statusCode: number;
  body: string;
}

interface LambdaResponse {
  message: string;
  timestamp: string;
  api_status?: number;
  response_data?: any;
  error_type?: string;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Get API endpoint from environment variable
  const apiEndpoint = process.env.API_ENDPOINT || 'https://your-api-server.com/endpoint';
  const apiKey = process.env.API_KEY;
  
  console.log(`Starting API call to ${apiEndpoint} at ${new Date().toISOString()}`);
  
  try {
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'AWS-Lambda-EventBridge-Scheduler'
    };
    
    // Add authentication if API key is provided
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    // Make the API call using fetch
    const response = await fetch(apiEndpoint, {
      method: 'GET', // Change as needed (POST, PUT, etc.)
      headers,
      signal: AbortSignal.timeout(25000) // 25 second timeout
    });
    
    console.log(`API call successful. Status: ${response.status}`);
    
    // Parse response
    let responseData: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    console.log('Response data:', responseData);
    
    const successResponse: LambdaResponse = {
      message: 'API call completed successfully',
      timestamp: new Date().toISOString(),
      api_status: response.status,
      response_data: responseData
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify(successResponse)
    };
    
  } catch (error: any) {
    let errorResponse: LambdaResponse;
    
    if (error.name === 'TimeoutError') {
      console.error('API call timed out');
      errorResponse = {
        message: 'API call timed out',
        timestamp: new Date().toISOString(),
        error_type: 'TimeoutError'
      };
      
      return {
        statusCode: 408,
        body: JSON.stringify(errorResponse)
      };
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Network error: ${error.message}`);
      errorResponse = {
        message: `Network error: ${error.message}`,
        timestamp: new Date().toISOString(),
        error_type: 'NetworkError'
      };
      
      return {
        statusCode: 500,
        body: JSON.stringify(errorResponse)
      };
    }
    
    console.error(`Unexpected error: ${error.message}`);
    errorResponse = {
      message: `Unexpected error: ${error.message}`,
      timestamp: new Date().toISOString(),
      error_type: 'UnexpectedError'
    };
    
    return {
      statusCode: 500,
      body: JSON.stringify(errorResponse)
    };
  }
};