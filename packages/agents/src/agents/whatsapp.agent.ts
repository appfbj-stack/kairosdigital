import { BaseAgent, type AgentContext, type AgentResult, type AgentTool } from "../types";
import { WHATSAPP_PROMPT } from "../prompts";
import { sendWhatsAppTool } from "../tools";

export class WhatsAppAgent extends BaseAgent {
  readonly name = "whatsapp";
  readonly description = "Envia mensagens e gerencia instâncias WhatsApp";
  readonly systemPrompt = WHATSAPP_PROMPT;
  readonly tools: AgentTool[] = [sendWhatsAppTool];

  async run(_ctx: AgentContext): Promise<AgentResult> {
    return { message: "[WhatsAppAgent placeholder — execução real no backend]" };
  }
}
