import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from '@aws-sdk/client-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || '';
const SECONDARY_KEY = process.env.SECONDARY_KEY || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = DynamoDBDocument.from(new DynamoDB());

export const handler: APIGatewayProxyHandler = async (event): Promise<any> => {
    if (!event.pathParameters) {
    return { statusCode: 400, body: 'invalid request, you are missing the urlCode' };
  }

  const urlCode  = event.pathParameters['urlCode'];

  const getParams = {
    TableName: TABLE_NAME,
    Key: {
      [SECONDARY_KEY]: urlCode,
    }
  };

  const output = await db.get(getParams);
  if(output.Item) {

    const url = output.Item[PRIMARY_KEY];

    return { statusCode: 302, Headers: {
      Location: url,
    } };
  } else {
    return { statusCode: 404, body: {
      errorMessage: `No URL found for code ${urlCode}`
    } };
  }
};