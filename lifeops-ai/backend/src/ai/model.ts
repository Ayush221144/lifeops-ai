export interface Model {
  /** Returns the model's raw text reply (expected to contain one JSON object). */
  extract(data: Uint8Array, filename: string): Promise<string>;
}
