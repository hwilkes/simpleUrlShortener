import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from '@aws-sdk/client-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = DynamoDBDocument.from(new DynamoDB());

export const handler: APIGatewayProxyHandler = async (event): Promise<any> => {
    if (!event.body || !JSON.parse(event.body).url) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter body or url' };
  }

  const url = JSON.parse(event.body).url;

  const getParams = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: url,
    }
  };

  const output = await db.get(getParams);
  if(output.Item) {
    return { statusCode: 200, body: JSON.stringify({
      urlCode: output.Item.code,
    })};
  } else {
    return { statusCode: 404, body: {
      errorMessage: `No URL found for ${url}`
    } };
  }
};