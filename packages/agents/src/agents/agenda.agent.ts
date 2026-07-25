import { BaseAgent, type AgentContext, type AgentResult, type AgentTool } from "../types";
import { AGENDA_PROMPT } from "../prompts";
import { createTaskTool, createAppointmentTool } from "../tools";

export class AgendaAgent extends BaseAgent {
  readonly name = "agenda";
  readonly description = "Cria tarefas e compromissos";
  readonly systemPrompt = AGENDA_PROMPT;
  readonly tools: AgentTool[] = [createTaskTool, createAppointmentTool];

  async run(_ctx: AgentContext): Promise<AgentResult> {
    return { message: "[AgendaAgent placeholder — execução real no backend]" };
  }
}
