import { BaseAgent, type AgentContext, type AgentResult, type AgentTool } from "../types";
import { SUPORTE_PROMPT } from "../prompts";

export class SuporteAgent extends BaseAgent {
  readonly name = "suporte";
  readonly description = "Responde dúvidas, ajuda onboarding e abre tickets";
  readonly systemPrompt = SUPORTE_PROMPT;
  readonly tools: AgentTool[] = [];

  async run(_ctx: AgentContext): Promise<AgentResult> {
    return { message: "[SuporteAgent placeholder — execução real no backend]" };
  }
}
