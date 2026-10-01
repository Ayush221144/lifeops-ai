import type { Obligation } from "../utils/types.ts";

export interface Store {
  put(o: Obligation): Promise<void>;
  list(user: string): Promise<Obligation[]>;
  average(user: string, category: string): Promise<number | null>;
  complete(user: string, id: string): Promise<boolean>;
}

export class MemoryStore implements Store {
  items = new Map<string, Obligation>();
  async put(o: Obligation) { this.items.set(`${o.user}#${o.id}`, { ...o }); }
  async list(user: string) { return [...this.items.values()].filter((o) => o.user === user); }
  async average(user: string, category: string) {
    const v = (await this.list(user)).filter((o) => o.category === category && o.amount).map((o) => o.amount as number);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  }
  async complete(user: string, id: string) {
    const o = this.items.get(`${user}#${id}`);
    if (!o) return false;
    o.status = "done";
    return true;
  }
}
