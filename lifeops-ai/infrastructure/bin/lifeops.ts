#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { LifeOpsStack } from "../lib/lifeops-stack";

const app = new cdk.App();
const bedrockModelId = app.node.tryGetContext("bedrockModelId") as string | undefined;
if (!bedrockModelId) {
  throw new Error('Pass your Bedrock model ID: cdk deploy -c bedrockModelId=<model-or-inference-profile-id> (check the Bedrock console for what your account can use)');
}
new LifeOpsStack(app, "LifeOpsStack", {
  bedrockModelId,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
