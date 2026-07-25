import { BaseAgent, type AgentContext, type AgentResult, type AgentTool } from "../types";
import { MERCADOLIVRE_PROMPT } from "../prompts";
import {
  meliGetAuthUrlTool,
  meliCreateProductTool,
  meliUpdateProductTool,
  meliGetMetricsTool,
  meliListOrdersTool,
  meliSearchProductsTool,
  meliAnalyzeCompetitorTool,
  meliItemDetailTool,
  meliTrendingTool,
} from "../tools";

export class MercadoLivreAgent extends BaseAgent {
  readonly name = "mercadolivre";
  readonly description = "Gerencia produtos, pedidos, metricas e analise competitiva do Mercado Livre";
  readonly systemPrompt = MERCADOLIVRE_PROMPT;
  readonly tools: AgentTool[] = [
    meliGetAuthUrlTool,
    meliCreateProductTool,
    meliUpdateProductTool,
    meliGetMetricsTool,
    meliListOrdersTool,
    meliSearchProductsTool,
    meliAnalyzeCompetitorTool,
    meliItemDetailTool,
    meliTrendingTool,
  ];

  async run(_ctx: AgentContext): Promise<AgentResult> {
    return { message: "[MercadoLivreAgent placeholder — execucao real no backend]" };
  }
}
