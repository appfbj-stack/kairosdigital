import { BaseAgent, type AgentContext, type AgentResult, type AgentTool } from "../types";
import { DEVOPS_PROMPT } from "../prompts";

export class DevOpsAgent extends BaseAgent {
  readonly name = "devops";
  readonly description = "Monitora containers e reinicia instâncias (superadmin)";
  readonly systemPrompt = DEVOPS_PROMPT;
  readonly tools: AgentTool[] = [];

  async run(_ctx: AgentContext): Promise<AgentResult> {
    return { message: "[DevOpsAgent placeholder — execução real no backend]" };
  }
}
