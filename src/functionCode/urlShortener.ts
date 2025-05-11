import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { APIGatewayProxyHandler } from 'aws-lambda';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const SECONDARY_KEY = process.env.SECONDARY_KEY || '';

const db = DynamoDBDocument.from(new DynamoDB());

export const handler: APIGatewayProxyHandler = async (event, context): Promise<any> => {

  if (!event.body || !JSON.parse(event.body).url) {
    const error = {
      statusCode: 404,
      headers: { "Content-Type": "text/plain" },
      body: new Error('invalid request, you are missing the parameter body or url')
    }
    return context.succeed(error);
  }
  const url = JSON.parse(event.body).url;

  console.log(`Looking for entry for ${url}`);

  const getParams = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: url,
    }
  };

  const output = await db.get(getParams);
  try {
    if(output.Item && output.Item[SECONDARY_KEY]) {
      return { statusCode: 200,
        headers:{
          "Content-Type": "application/json"
        },
        isBase64Encoded: false,
        body: JSON.stringify({
        [SECONDARY_KEY]: output.Item[SECONDARY_KEY],
      })};
    } 
  } catch (dbError) {
    const error = {
      statusCode: 500,
      isBase64Encoded: false,
      headers: { "Content-Type": "text/plain" },
      body: new Error(JSON.stringify(dbError))
    }
    return context.succeed(error);
  }

  console.log(`Creating new entry for ${url}`);

  const key = uuidv4()
  const code = parseInt(key,36);

  const entry = {
    [SECONDARY_KEY]: code,
    [PRIMARY_KEY]: url
  }
  const putParams = {
    TableName: TABLE_NAME,
    Item: entry
  };

  try {
    await db.put(putParams);
    return { statusCode: 201,
        headers:{
          "Content-Type": "application/json"
        }, 
        isBase64Encoded: false,
        body: JSON.stringify({
        [SECONDARY_KEY]: code
    })};
  } catch (dbError) {
    const error = {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: new Error('failed to create new urlcode')
    }
    return context.succeed(error);
  }
};
  
