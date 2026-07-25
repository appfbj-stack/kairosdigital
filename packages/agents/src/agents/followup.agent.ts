import { BaseAgent, type AgentContext, type AgentResult, type AgentTool } from "../types";
import { FOLLOWUP_PROMPT } from "../prompts";
import { listOverdueContactsTool, sendWhatsAppTool, createTaskTool } from "../tools";

export class FollowupAgent extends BaseAgent {
  readonly name = "followup";
  readonly description = "Cria sequências de follow-up para leads inativos";
  readonly systemPrompt = FOLLOWUP_PROMPT;
  readonly tools: AgentTool[] = [listOverdueContactsTool, sendWhatsAppTool, createTaskTool];

  async run(_ctx: AgentContext): Promise<AgentResult> {
    return { message: "[FollowupAgent placeholder — execução real no backend]" };
  }
}
