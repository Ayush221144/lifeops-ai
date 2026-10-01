import * as path from "path";
import * as fs from "fs";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

interface Props extends cdk.StackProps { bedrockModelId: string }

/** UNTESTED: written without AWS access. Run `cdk synth` first and fix anything it reports. */
export class LifeOpsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);
    const backend = path.join(__dirname, "../../backend");
    const distDir = path.join(__dirname, "../../frontend/dist");
    if (!fs.existsSync(distDir)) throw new Error("Build the frontend first: cd frontend && npm install && npm run build");

    // Hackathon settings: everything is deleted on `cdk destroy`.
    const docs = new s3.Bucket(this, "Documents", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, encryption: s3.BucketEncryption.S3_MANAGED, enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, autoDeleteObjects: true,
      lifecycleRules: [{ expiration: cdk.Duration.days(30) }],
    });
    const table = new dynamodb.Table(this, "Obligations", {
      partitionKey: { name: "user", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const bundling = { target: "node20", minify: true, sourceMap: false } as const;
    const common = {
      runtime: lambda.Runtime.NODEJS_20_X, projectRoot: backend, depsLockFilePath: path.join(backend, "package-lock.json"),
      memorySize: 512, bundling,
    };
    const api = new NodejsFunction(this, "ApiFn", {
      ...common, entry: path.join(backend, "src/handlers/api.ts"), handler: "handler", timeout: cdk.Duration.seconds(30),
      environment: { USE_DEMO: "0", BUCKET: docs.bucketName, TABLE: table.tableName, BEDROCK_MODEL_ID: props.bedrockModelId },
    });
    docs.grantReadWrite(api);
    table.grantReadWriteData(api);
    // Broad on purpose so any model / inference profile works. Tighten to your model ARN before real use.
    api.addToRolePolicy(new iam.PolicyStatement({ actions: ["bedrock:InvokeModel", "bedrock:Converse"], resources: ["*"] }));

    const restApi = new apigw.RestApi(this, "Api", {
      deployOptions: { stageName: "prod", throttlingRateLimit: 10, throttlingBurstLimit: 20 },
      defaultCorsPreflightOptions: { allowOrigins: apigw.Cors.ALL_ORIGINS, allowMethods: apigw.Cors.ALL_METHODS, allowHeaders: ["content-type", "x-user"] },
    });
    const integ = new apigw.LambdaIntegration(api);
    restApi.root.addResource("documents").addMethod("POST", integ);
    restApi.root.addResource("actions").addMethod("GET", integ);
    restApi.root.getResource("actions")!.addResource("{id}").addResource("complete").addMethod("POST", integ);
    restApi.root.addResource("graph").addMethod("GET", integ);
    restApi.root.addResource("plan").addMethod("GET", integ);

    // Daily reminder job (EventBridge -> Lambda). Logs due items; does not send email/SMS.
    const reminders = new NodejsFunction(this, "RemindersFn", {
      ...common, entry: path.join(backend, "src/handlers/reminders.ts"), handler: "handler", timeout: cdk.Duration.seconds(60),
      environment: { TABLE: table.tableName },
    });
    table.grantReadWriteData(reminders);
    new events.Rule(this, "DailyReminders", {
      schedule: events.Schedule.cron({ minute: "0", hour: "3" }), targets: [new targets.LambdaFunction(reminders)],
    });

    // Frontend: private bucket behind CloudFront. config.json carries the API URL at deploy time.
    const site = new s3.Bucket(this, "Site", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, encryption: s3.BucketEncryption.S3_MANAGED, enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, autoDeleteObjects: true,
    });
    const cdn = new cloudfront.Distribution(this, "Cdn", {
      defaultRootObject: "index.html",
      defaultBehavior: { origin: origins.S3BucketOrigin.withOriginAccessControl(site), viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS },
    });
    new s3deploy.BucketDeployment(this, "DeploySite", {
      destinationBucket: site, distribution: cdn, distributionPaths: ["/*"],
      sources: [s3deploy.Source.asset(distDir), s3deploy.Source.jsonData("config.json", { apiUrl: restApi.url.replace(/\/$/, "") })],
    });

    new cdk.CfnOutput(this, "SiteUrl", { value: `https://${cdn.distributionDomainName}` });
    new cdk.CfnOutput(this, "ApiUrl", { value: restApi.url });
    new cdk.CfnOutput(this, "DocumentsBucket", { value: docs.bucketName });
    new cdk.CfnOutput(this, "TableName", { value: table.tableName });
    new cdk.CfnOutput(this, "RemindersFunction", { value: reminders.functionName });
  }
}
