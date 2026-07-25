import { BaseAgent, type AgentContext, type AgentResult, type AgentTool } from "../types";
import { AUTOMACAO_PROMPT } from "../prompts";

export class AutomacaoAgent extends BaseAgent {
  readonly name = "automacao";
  readonly description = "Cria e gerencia automações por trigger";
  readonly systemPrompt = AUTOMACAO_PROMPT;
  readonly tools: AgentTool[] = [];

  async run(_ctx: AgentContext): Promise<AgentResult> {
    return { message: "[AutomacaoAgent placeholder — execução real no backend]" };
  }
}
