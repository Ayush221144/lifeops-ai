import type { Model } from "./model.ts";
import { DOCUMENT_ANALYSIS_PROMPT } from "./prompt.ts";

/** Amazon Bedrock Converse API. UNTESTED against real AWS. */
export class BedrockModel implements Model {
  modelId: string;
  constructor(modelId: string) {
    this.modelId = modelId;
  }
  async extract(data: Uint8Array, filename: string): Promise<string> {
    const { BedrockRuntimeClient, ConverseCommand } = await import("@aws-sdk/client-bedrock-runtime");
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    let block: any;
    if (ext === "pdf") block = { document: { format: "pdf", name: "document", source: { bytes: data } } };
    else if (ext === "png") block = { image: { format: "png", source: { bytes: data } } };
    else if (ext === "jpg" || ext === "jpeg") block = { image: { format: "jpeg", source: { bytes: data } } };
    else block = { text: new TextDecoder().decode(data).slice(0, 20_000) };
    const client = new BedrockRuntimeClient({});
    const r = await client.send(new ConverseCommand({
      modelId: this.modelId,
      messages: [{ role: "user", content: [block, { text: DOCUMENT_ANALYSIS_PROMPT }] }],
      inferenceConfig: { maxTokens: 600, temperature: 0 },
    }));
    const text = r.output?.message?.content?.find((c: any) => c.text)?.text;
    if (!text) throw new Error("empty model response");
    return text;
  }
}
