import type { Obligation } from "./types.ts";
export interface GraphNode { id: string; type: "core" | "document" | "deadline" | "priority" | "action"; label: string }
export interface GraphEdge { from: string; to: string }

export function buildGraph(obs: Obligation[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [{ id: "core", type: "core", label: "LifeOps" }];
  const edges: GraphEdge[] = [];
  for (const o of obs) {
    nodes.push(
      { id: o.id, type: "document", label: o.title },
      { id: `${o.id}:due`, type: "deadline", label: o.due_date ?? "No date" },
      { id: `${o.id}:pri`, type: "priority", label: o.priority },
      { id: `${o.id}:act`, type: "action", label: o.recommended_action },
    );
    edges.push(
      { from: "core", to: o.id },
      { from: o.id, to: `${o.id}:due` },
      { from: `${o.id}:due`, to: `${o.id}:pri` },
      { from: `${o.id}:pri`, to: `${o.id}:act` },
    );
  }
  return { nodes, edges };
}
