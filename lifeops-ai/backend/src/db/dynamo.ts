import type { Store } from "./store.ts";
import type { Obligation } from "../utils/types.ts";

/** DynamoDB store (partition key `user`, sort key `id`). UNTESTED against real AWS. */
export class DynamoStore implements Store {
  table: string;
  constructor(table: string) {
    this.table = table;
  }
  private async doc() {
    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const lib = await import("@aws-sdk/lib-dynamodb");
    return { lib, db: lib.DynamoDBDocumentClient.from(new DynamoDBClient({}), { marshallOptions: { removeUndefinedValues: true } }) };
  }
  async put(o: Obligation) {
    const { lib, db } = await this.doc();
    await db.send(new lib.PutCommand({ TableName: this.table, Item: o }));
  }
  async list(user: string) {
    const { lib, db } = await this.doc();
    const r = await db.send(new lib.QueryCommand({
      TableName: this.table, KeyConditionExpression: "#u = :u",
      ExpressionAttributeNames: { "#u": "user" }, ExpressionAttributeValues: { ":u": user },
    }));
    return (r.Items ?? []) as Obligation[];
  }
  async average(user: string, category: string) {
    const v = (await this.list(user)).filter((o) => o.category === category && o.amount).map((o) => o.amount as number);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  }
  async complete(user: string, id: string) {
    const { lib, db } = await this.doc();
    try {
      await db.send(new lib.UpdateCommand({
        TableName: this.table, Key: { user, id }, UpdateExpression: "SET #s = :d",
        ConditionExpression: "attribute_exists(id)", ExpressionAttributeNames: { "#s": "status" }, ExpressionAttributeValues: { ":d": "done" },
      }));
      return true;
    } catch (e) {
      if ((e as Error).name === "ConditionalCheckFailedException") return false;
      throw e;
    }
  }
  /** Open items due on/before `limit` that were not reminded yet. Scan is fine at hackathon scale. */
  async dueSoon(limit: string): Promise<Obligation[]> {
    const { lib, db } = await this.doc();
    const r = await db.send(new lib.ScanCommand({
      TableName: this.table,
      FilterExpression: "#s = :o AND due_date <= :l AND (attribute_not_exists(reminded) OR reminded = :f)",
      ExpressionAttributeNames: { "#s": "status" }, ExpressionAttributeValues: { ":o": "open", ":l": limit, ":f": false },
    }));
    return (r.Items ?? []) as Obligation[];
  }
  async markReminded(user: string, id: string) {
    const { lib, db } = await this.doc();
    await db.send(new lib.UpdateCommand({ TableName: this.table, Key: { user, id }, UpdateExpression: "SET reminded = :t", ExpressionAttributeValues: { ":t": true } }));
  }
}
