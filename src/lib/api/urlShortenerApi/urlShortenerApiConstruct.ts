import { ApiKeySourceType, Cors, JsonSchemaType, LambdaIntegration, Model, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import path = require('path');
import { ShortenerFunction } from '../../lambda/shortenerFunction';


export class UrlShortenerApi extends RestApi {
    constructor(scope: Construct) {
        super(scope, 'UrlShortenerApi', {
            restApiName: 'URL Shortener API',
            apiKeySourceType: ApiKeySourceType.HEADER,
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS, // this is also the default
            }
        });
    }
}