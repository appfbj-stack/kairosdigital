import { BaseAgent, type AgentContext, type AgentResult, type AgentTool } from "../types";
import { CRM_PROMPT } from "../prompts";
import {
  createContactTool,
  searchContactsTool,
  moveContactStageTool,
} from "../tools";

export class CrmAgent extends BaseAgent {
  readonly name = "crm";
  readonly description = "Gerencia contatos, leads e pipeline";
  readonly systemPrompt = CRM_PROMPT;
  readonly tools: AgentTool[] = [createContactTool, searchContactsTool, moveContactStageTool];

  async run(_ctx: AgentContext): Promise<AgentResult> {
    // Implementação real fica no backend que injeta cliente OpenRouter + tool handlers.
    // Aqui retornamos contrato; backend usa este agent como template.
    return { message: "[CrmAgent placeholder — execução real no backend]" };
  }
}
