import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// Import the Lambda module
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { UrlShortenerTable } from './dynamodDB/urlShortenerTable';
import { UrlShortenerApi } from './api/urlShortenerApi/urlShortenerApiConstruct';
import { ShortenerFunction, ShortenerFunctionProps } from './lambda/shortenerFunction';
import path = require('path');
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { ApiKey, IResource, LambdaIntegration, MockIntegration, PassthroughBehavior } from 'aws-cdk-lib/aws-apigateway';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class UrlShortenerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const primaryKey = 'originalUrl';
    const secondaryKey = 'urlCode';
    const tableName = 'urls';

    const runtime = lambda.Runtime.NODEJS_22_X;

    const table = new UrlShortenerTable(this, tableName, primaryKey);

    // Define the Lambda function resource
    const urlShortenerFunction = new ShortenerFunction(this, 'UrlShortenerFunction', {
      environment: {
        PRIMARY_KEY: primaryKey,
        SECONDARY_KEY: secondaryKey,
        TABLE_NAME: tableName,
      },
      runtime,
      entry: path.join(__dirname,'../functionCode/urlShortener.ts')
    });

    const urlRetrieverFunction = new ShortenerFunction(this, 'UrlRetrieverFunction', {
      environment: {
        PRIMARY_KEY: primaryKey,
        SECONDARY_KEY: secondaryKey,
        TABLE_NAME: tableName,
      },
      runtime,
      entry: path.join(__dirname,'../functionCode/urlRetriever.ts')
    });

    const urlRedirectFunction = new ShortenerFunction(this, 'UrlRedirectFunction', {
      environment: {
        PRIMARY_KEY: primaryKey,
        SECONDARY_KEY: secondaryKey,
        TABLE_NAME: tableName,
      },
      runtime,
      entry: path.join(__dirname,'../functionCode/urlRedirect.ts')
    });

    table.grantReadData(urlRetrieverFunction);
    table.grantReadData(urlRedirectFunction);
    table.grantReadWriteData(urlShortenerFunction)

    const api = new UrlShortenerApi(this);

    const apiKey = new ApiKey(this, 'UrlShortenerKey', {
      apiKeyName: 'UrlShortenerKey',
      enabled: true
    });

    // define the usage plan
    const usagePlan = api.addUsagePlan('UrlShortenerUsagePlan', {
        name: 'UrlShortenerUsagePlan',
        throttle: {
            rateLimit: 100,
            burstLimit: 200,
        },
    });

    const urls = api.root.addResource('address');
    const redirectPath = api.root.addResource('{urlCode}');

    urls.addMethod('POST', new LambdaIntegration(urlShortenerFunction), {
      apiKeyRequired: true,
    });
    urls.addMethod('GET', new LambdaIntegration(urlRetrieverFunction), {
      apiKeyRequired: true,
    });
    redirectPath.addMethod('GET', new LambdaIntegration(urlRedirectFunction), {
      apiKeyRequired: true,
    });

      // add the API key to the usage plan
    usagePlan.addApiKey(apiKey);

    usagePlan.addApiStage({ stage: api.deploymentStage });
    
  }
}
