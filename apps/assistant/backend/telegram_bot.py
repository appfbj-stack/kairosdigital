import asyncio
import logging
import os
import sys
from datetime import datetime

import httpx
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

load_dotenv()

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

BOT_TOKEN = "8889524703:AAHQevKeU4PTIUOOXXA-cPdnruMjQYWvljw"
BACKEND_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
API_KEY = os.getenv("API_KEY", "kairos-b4cad9a30caf4491809f90ff")

user_conversations: dict[int, str] = {}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Olá! Eu sou o Kairós Bot, seu assistente com IA.\n\n"
        "Envie qualquer mensagem que eu respondo usando inteligência artificial.\n\n"
        "Comandos:\n"
        "/start - Ver esta mensagem\n"
        "/novo - Nova conversa\n"
        "/ajuda - Ajuda"
    )


async def novo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id in user_conversations:
        del user_conversations[user_id]
    await update.message.reply_text("🆕 Conversa reiniciada! Envie sua mensagem.")


async def ajuda(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "💡 Comandos disponíveis:\n\n"
        "/start - Mensagem inicial\n"
        "/novo - Nova conversa\n"
        "/ajuda - Esta mensagem\n\n"
        "Envie qualquer texto para conversar com a IA."
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    user_text = update.message.text
    chat_id = update.effective_chat.id
    username = update.effective_user.first_name or "Usuário"

    if not user_text:
        return

    await context.bot.send_chat_action(chat_id=chat_id, action="typing")

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            payload = {
                "message": user_text,
                "conversation_id": user_conversations.get(user_id),
                "app_slug": "telegram",
            }
            headers = {"Authorization": f"Bearer {API_KEY}"}

            response = await client.post(
                f"{BACKEND_URL}/api/chat",
                json=payload,
                headers=headers,
            )

            if response.status_code == 200:
                data = response.json()
                reply = data.get("content", "Desculpe, não entendi.")
                conv_id = data.get("conversation_id")
                if conv_id:
                    user_conversations[user_id] = conv_id
            elif response.status_code == 401:
                reply = "❌ Erro de autenticação. Verifique a API_KEY no servidor."
            else:
                reply = f"❌ Erro no servidor ({response.status_code}). Tente novamente."

    except httpx.ConnectError:
        reply = "❌ Não consegui conectar ao servidor. Ele está rodando?"
    except httpx.TimeoutException:
        reply = "⏰ O servidor demorou muito para responder. Tente novamente."
    except Exception as e:
        logger.error(f"Erro ao processar mensagem: {e}")
        reply = "❌ Erro interno. Tente novamente."

    try:
        max_len = 4096
        if len(reply) > max_len:
            parts = [reply[i:i+max_len] for i in range(0, len(reply), max_len)]
            for part in parts:
                await update.message.reply_text(part)
        else:
            await update.message.reply_text(reply)
    except Exception as e:
        logger.error(f"Erro ao enviar resposta: {e}")


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE):
    logger.error(f"Exceção: {context.error}", exc_info=context.error)


async def verify_backend():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{BACKEND_URL}/api/health")
            if r.status_code == 200:
                logger.info(f"✅ Backend conectado em {BACKEND_URL}")
                return True
    except Exception:
        pass
    logger.warning(f"⚠️ Backend não disponível em {BACKEND_URL}")
    logger.warning("O bot iniciará mesmo assim. Mensagens serão rejeitadas até o backend subir.")
    return False


async def main():
    logger.info(f"🤖 Iniciando Kairós Bot (token: {BOT_TOKEN[:10]}...)")
    logger.info(f"🔗 Backend: {BACKEND_URL}")

    await verify_backend()

    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("novo", novo))
    app.add_handler(CommandHandler("ajuda", ajuda))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.add_error_handler(error_handler)

    me = await app.bot.get_me()
    logger.info(f"✅ Bot @{me.username} autenticado e rodando com long polling!")
    logger.info("Aguardando mensagens...")

    await app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot encerrado pelo usuário.")
        sys.exit(0)
