import { BaseStore, type Values } from "@langchain/langgraph";
import { kv, type VercelKV } from "@vercel/kv";

export class VercelMemoryStore extends BaseStore {
  protected client: VercelKV;

  constructor(fields?: { client?: VercelKV }) {
    super();
    this.client = fields?.client || kv;
  }

  async list(
    prefixes: string[]
  ): Promise<Record<string, Record<string, Values>>> {
    const result: Record<string, Record<string, Values>> = {};

    for (const prefix of prefixes) {
      const keys = await this.client.keys(`${prefix}:*`);
      result[prefix] = {};

      for (const fullKey of keys) {
        const value = await this.client.get<string>(fullKey);
        if (value !== null) {
          const [, key] = fullKey.split(":");
          result[prefix][key] = JSON.parse(value);
        }
      }
    }

    return result;
  }

  async put(writes: Array<[string, string, Values | null]>): Promise<void> {
    const pipeline = this.client.pipeline();

    for (const [namespace, key, value] of writes) {
      const fullKey = `${namespace}:${key}`;
      if (value === null) {
        pipeline.del(fullKey);
      } else {
        pipeline.set(fullKey, JSON.stringify(value));
      }
    }

    await pipeline.exec();
  }
}
