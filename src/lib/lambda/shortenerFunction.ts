import { aws_lambda_nodejs, Stack } from 'aws-cdk-lib';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path = require('path');

export class ShortenerFunctionProps extends NodejsFunction {
    entryPath: string
}

export class ShortenerFunction extends aws_lambda_nodejs.NodejsFunction {
    constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
        super(scope, id, {
              handler: 'handler',
              ...props
            });
    }
}