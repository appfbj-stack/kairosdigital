"""Manifesto completo do app Igreja Sede — usado pelo GuideAgent."""

APP_MANIFEST = {
    "name": "Igreja Sede",
    "description": "Sistema de gestão eclesiástica — membros, documentos, notas, ferramentas",
    "version": "2.1.0",
    "features": [
        {
            "id": "members",
            "name": "Membros",
            "description": "Cadastro, busca, listagem e gerenciamento de membros da igreja",
            "endpoints": [
                {"method": "POST", "path": "/api/members/", "description": "Criar novo membro"},
                {"method": "GET", "path": "/api/members/", "description": "Listar todos os membros"},
                {"method": "GET", "path": "/api/members/search?q=", "description": "Buscar membro por nome/telefone/email"},
                {"method": "GET", "path": "/api/members/{id}", "description": "Ver detalhes de um membro"},
                {"method": "PUT", "path": "/api/members/{id}", "description": "Atualizar dados do membro"},
                {"method": "DELETE", "path": "/api/members/{id}", "description": "Desativar membro"},
            ],
            "examples": [
                "cadastrar João Silva como membro",
                "buscar membro Maria",
                "listar membros da Sede",
                "qual o telefone do Pedro?",
            ],
            "fields": [
                "nome (obrigatório)", "data_nascimento", "telefone", "whatsapp",
                "email", "endereço", "estado_civil", "congregação",
                "data_entrada", "batismo", "ministério", "observações",
            ],
        },
        {
            "id": "vault",
            "name": "Second Brain / Notas",
            "description": "Vault de notas obsidian — memória persistente do ecossistema",
            "endpoints": [
                {"method": "GET", "path": "/api/vault/search?q=", "description": "Buscar notas"},
                {"method": "GET", "path": "/api/vault/", "description": "Listar notas"},
                {"method": "GET", "path": "/api/vault/folders", "description": "Listar pastas"},
                {"method": "GET", "path": "/api/vault/{id}", "description": "Ver nota com backlinks"},
                {"method": "POST", "path": "/api/vault/", "description": "Criar nota"},
                {"method": "PUT", "path": "/api/vault/{id}", "description": "Atualizar nota"},
                {"method": "DELETE", "path": "/api/vault/{id}", "description": "Remover nota"},
            ],
            "examples": [
                "criar uma nota sobre a reunião de hoje",
                "buscar notas sobre evento",
                "mostrar conexões de uma nota",
                "arquivar nota antiga",
            ],
        },
        {
            "id": "documents",
            "name": "Documentos",
            "description": "Upload e processamento de documentos (PDF, DOCX, imagens)",
            "endpoints": [
                {"method": "POST", "path": "/api/multimodal/document", "description": "Upload + processar documento"},
            ],
            "examples": [
                "processar este PDF",
                "extrair texto deste documento",
                "analisar esta imagem",
            ],
        },
        {
            "id": "chat",
            "name": "Chat / Assistente",
            "description": "Conversa com o assistente IA com suporte multimodal",
            "endpoints": [
                {"method": "POST", "path": "/api/chat", "description": "Enviar mensagem e receber resposta"},
                {"method": "POST", "path": "/api/chat/stream", "description": "Enviar mensagem com resposta em streaming"},
            ],
            "examples": [
                "conversar com o assistente",
                "fazer perguntas sobre a igreja",
            ],
        },
        {
            "id": "agents",
            "name": "Agentes Inteligentes",
            "description": "Sistema multi-agente LangGraph para tarefas complexas",
            "endpoints": [
                {"method": "POST", "path": "/api/agents/process", "description": "Processar mensagem com agentes"},
                {"method": "POST", "path": "/api/agents/church/chat", "description": "Chat com Church Agent"},
                {"method": "GET", "path": "/api/agents/church/members", "description": "Listar membros via agente"},
                {"method": "GET", "path": "/api/agents/church/members/search", "description": "Buscar membros via agente"},
            ],
            "examples": [
                "agentes disponíveis",
                "usar agentes para tarefa complexa",
            ],
        },
        {
            "id": "tools",
            "name": "Ferramentas (Tools)",
            "description": "Registro e execução de ferramentas do ecossistema",
            "endpoints": [
                {"method": "POST", "path": "/api/tools/register", "description": "Registrar nova ferramenta"},
                {"method": "GET", "path": "/api/tools/list", "description": "Listar ferramentas disponíveis"},
                {"method": "POST", "path": "/api/tools/execute", "description": "Executar ferramenta"},
            ],
            "examples": [
                "quais ferramentas estão disponíveis?",
                "executar ferramenta X",
            ],
        },
        {
            "id": "aion",
            "name": "Aion Integration",
            "description": "Integração com o sistema multi-agente Aion",
            "endpoints": [
                {"method": "GET", "path": "/api/aion/status", "description": "Status da integração Aion"},
                {"method": "GET", "path": "/api/aion/skills", "description": "Listar skills do Aion"},
                {"method": "GET", "path": "/api/aion/agents", "description": "Listar agentes do Aion"},
                {"method": "POST", "path": "/api/aion/execute", "description": "Executar capability no Aion"},
            ],
            "examples": [
                "status do Aion",
                "skills disponíveis",
            ],
        },
        {
            "id": "audit",
            "name": "Auditoria",
            "description": "Logs de auditoria de todas as ações do sistema",
            "endpoints": [
                {"method": "GET", "path": "/api/audit/logs", "description": "Listar logs de auditoria"},
            ],
        },
    ],
    "workflows": [
        {
            "id": "cadastrar_membro",
            "name": "Cadastrar novo membro",
            "steps": [
                "Diga 'quero cadastrar um membro' ou 'cadastrar João'",
                "O Church Agent vai perguntar cada campo (nome, data, etc.)",
                "Campos opcionais podem ser pulados com 'pular'",
                "No final, revise e confirme com 'sim'",
                "O membro é salvo automaticamente",
            ],
        },
        {
            "id": "buscar_membro",
            "name": "Buscar membro",
            "steps": [
                "Diga 'buscar membro NOME' ou 'procura por João'",
                "O agente busca por nome, telefone ou email",
                "Resultados aparecem na conversa",
            ],
        },
        {
            "id": "criar_nota",
            "name": "Criar nota no vault",
            "steps": [
                "Diga 'criar nota TÍTULO' ou 'salvar no vault'",
                "Informe o conteúdo da nota",
                "A nota é salva e indexada automaticamente",
            ],
        },
    ],
    "faq": [
        {"q": "Como cadastrar um membro?", "a": "É só falar 'quero cadastrar um membro' que o Church Agent te guia passo a passo."},
        {"q": "O que é o vault?", "a": "É o Second Brain — um banco de notas onde o sistema guarda informações importantes. Você pode criar, buscar e conectar notas."},
        {"q": "Quais agentes existem?", "a": "Church Agent (membros), Vault Agent (notas), Guide Agent (ajuda), Documents Agent (documentos), Tools Agent (ferramentas)."},
        {"q": "Como faço para...?", "a": "Pergunte normalmente! Eu entendo o que você quer fazer e te ajudo."},
    ],
}
