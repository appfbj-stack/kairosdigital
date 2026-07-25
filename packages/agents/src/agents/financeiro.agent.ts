import { BaseAgent, type AgentContext, type AgentResult, type AgentTool } from "../types";
import { FINANCEIRO_PROMPT } from "../prompts";
import { getUsageTool } from "../tools";

export class FinanceiroAgent extends BaseAgent {
  readonly name = "financeiro";
  readonly description = "Mostra consumo, plano e alerta sobre limites";
  readonly systemPrompt = FINANCEIRO_PROMPT;
  readonly tools: AgentTool[] = [getUsageTool];

  async run(_ctx: AgentContext): Promise<AgentResult> {
    return { message: "[FinanceiroAgent placeholder — execução real no backend]" };
  }
}
