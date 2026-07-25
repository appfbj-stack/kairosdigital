import type { BaseAgent } from "./types";
import type { AgentName } from "@kairosdigital/types";

const registry = new Map<AgentName, BaseAgent>();

export function registerAgent(name: AgentName, agent: BaseAgent): void {
  registry.set(name, agent);
}

export function getAgent(name: AgentName): BaseAgent | undefined {
  return registry.get(name);
}

export function listAgents(): Array<{ name: AgentName; description: string }> {
  return Array.from(registry.entries()).map(([name, agent]) => ({
    name,
    description: agent.description,
  }));
}
