export interface BlobStore {
  put(key: string, data: Uint8Array, contentType: string): Promise<void>;
}
export class MemoryBlobStore implements BlobStore {
  blobs = new Map<string, Uint8Array>();
  async put(key: string, data: Uint8Array) { this.blobs.set(key, data); }
}
/** S3 with server-side encryption. UNTESTED against real AWS. */
export class S3BlobStore implements BlobStore {
  bucket: string;
  constructor(bucket: string) {
    this.bucket = bucket;
  }
  async put(key: string, data: Uint8Array, contentType: string) {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    await new S3Client({}).send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: data, ContentType: contentType, ServerSideEncryption: "AES256" }));
  }
}
