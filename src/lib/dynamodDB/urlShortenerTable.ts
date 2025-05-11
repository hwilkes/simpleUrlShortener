import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class UrlShortenerTable extends Table {
    constructor(scope: Construct, tableName: string, partitionKey: string) {
        super(scope, 'UrlShortenerTable', {
            partitionKey: {
                name: partitionKey,
                type: AttributeType.STRING
              },
              tableName: tableName,
              removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
            });
    }
}