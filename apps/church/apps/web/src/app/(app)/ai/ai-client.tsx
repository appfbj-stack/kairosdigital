"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, RotateCcw, User, Mic, MicOff, Volume2, VolumeX, ImagePlus, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

const QUICK_PROMPTS = [
  { label: "Sermao", text: "Crie um esboco de sermao sobre fe e perseveranca com 3 pontos e versiculos" },
  { label: "Oracao", text: "Escreva uma oracao de abertura para o culto de domingo" },
  { label: "Post", text: "Crie uma postagem inspiradora para o Instagram da igreja" },
  { label: "Devocional", text: "Gere o devocional de hoje com versiculo, reflexao e aplicacao pratica" },
  { label: "Comunicado", text: "Redija um comunicado cordial para os membros sobre dizimo e oferta" },
  { label: "Celulas", text: "Como posso motivar os lideres de celulas a crescerem?" },
];

interface AiClientProps {
  churchName: string;
  userName: string;
  userRole: string;
}

const SR = typeof window !== "undefined"
  ? ((window as Record<string, unknown>).SpeechRecognition ?? (window as Record<string, unknown>).webkitSpeechRecognition)
  : null;

function speakText(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[*_#>-]/g, " ").replace(/\s+/g, " ").trim();
  const utt = new SpeechSynthesisUtterance(clean);
  utt.lang = "pt-BR";
  utt.rate = 1.05;
  utt.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find((v) => v.lang.startsWith("pt")) ?? null;
  if (ptVoice) utt.voice = ptVoice;
  window.speechSynthesis.speak(utt);
}

export function AiClient({ churchName, userName, userRole }: AiClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recogRef = useRef<unknown>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleMic = useCallback(() => {
    if (!SR) { alert("Reconhecimento de voz nao suportado. Use Chrome ou Edge."); return; }
    if (listening) {
      (recogRef.current as { stop: () => void } | null)?.stop();
      setListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SR as any)();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recogRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const send = async (text?: string) => {
    const content = text ?? input.trim();
    if ((!content && !imagePreview) || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: content || "[Imagem enviada]", ...(imagePreview ? { imageUrl: imagePreview } : {}) };
    const next = [...messages, userMsg];
    setMessages(next);
    setImagePreview(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })), context: { churchName, userRole }, module: "chat", imageUrl: userMsg.imageUrl }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      const reply = data.content ?? "Erro ao processar resposta.";
      setMessages([...next, { role: "assistant", content: reply }]);
      if (ttsEnabled) speakText(reply);
    } catch {
      setMessages([...next, { role: "assistant", content: "Erro de conexao. Tente novamente." }]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Kairos AI</h1>
          <p className="text-sm text-muted-foreground">Assistente pastoral - DeepSeek V3 Free</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => { setTtsEnabled((p) => !p); window.speechSynthesis?.cancel(); }} title={ttsEnabled ? "Desativar voz" : "Ativar voz"} className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${ttsEnabled ? "bg-primary/10 border-primary/30 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {messages.length > 0 && (
            <button onClick={() => { setMessages([]); window.speechSynthesis?.cancel(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs text-muted-foreground hover:bg-muted transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Nova conversa
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div>
              <div className="text-4xl mb-3">cross</div>
              <h2 className="text-lg font-semibold mb-1">Como posso ajudar, {userName.split(" ")[0]}?</h2>
              <p className="text-sm text-muted-foreground max-w-sm">Fale por voz, escreva ou envie uma imagem. Estou aqui para ajudar.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {QUICK_PROMPTS.map((p) => (
                <button key={p.label} onClick={() => void send(p.text)} className="text-left px-4 py-3 rounded-xl border bg-card text-sm hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <span className="font-medium block">{p.label}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1"><Sparkles className="w-4 h-4 text-primary" /></div>)}
                <div className="flex flex-col gap-1 max-w-[80%]">
                  {msg.imageUrl && <img src={msg.imageUrl} alt="img" className="rounded-xl max-h-48 object-cover border" />}
                  <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border rounded-tl-sm"}`}>{msg.content}</div>
                </div>
                {msg.role === "user" && (<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1"><User className="w-4 h-4 text-muted-foreground" /></div>)}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-primary" /></div>
                <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3"><div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" /><span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" /><span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" /></div></div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {imagePreview && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl mb-2 border">
          <img src={imagePreview} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
          <span className="text-xs text-muted-foreground flex-1">Imagem pronta para enviar</span>
          <button onClick={() => setImagePreview(null)} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex gap-2 items-end pt-2 border-t">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        <button onClick={() => fileInputRef.current?.click()} title="Enviar imagem" className="w-11 h-11 rounded-xl border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-primary transition-colors shrink-0">
          <ImagePlus className="w-5 h-5" />
        </button>
        <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={listening ? "Ouvindo... fale agora" : "Escreva, fale ou envie imagem..."} rows={1} className={`flex-1 px-4 py-3 rounded-xl border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary max-h-32 overflow-y-auto ${listening ? "border-red-400 ring-2 ring-red-400/30" : ""}`} style={{ height: "auto" }} onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }} />
        <button onClick={toggleMic} title={listening ? "Parar" : "Falar"} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 ${listening ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40" : "border text-muted-foreground hover:bg-muted hover:text-primary"}`}>
          {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button onClick={() => void send()} disabled={(!input.trim() && !imagePreview) || loading} className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
