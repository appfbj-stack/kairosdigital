import { BaseAgent, type AgentContext, type AgentResult, type AgentTool } from "../types";
import { ORQUESTRADOR_PROMPT } from "../prompts";
import { ALL_TOOLS } from "../tools";

/**
 * Orquestrador central — recebe qualquer mensagem do usuário,
 * decide se chama uma tool diretamente ou delega para um agent específico.
 * No backend, este agente recebe TODAS as tools registradas.
 */
export class OrquestradorAgent extends BaseAgent {
  readonly name = "orquestrador";
  readonly description = "Cérebro central — orquestra todos os agentes";
  readonly systemPrompt = ORQUESTRADOR_PROMPT;
  readonly tools: AgentTool[] = ALL_TOOLS;

  async run(_ctx: AgentContext): Promise<AgentResult> {
    return { message: "[OrquestradorAgent placeholder — execução real no backend]" };
  }
}
