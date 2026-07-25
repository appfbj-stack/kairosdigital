"use client";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, Smartphone, RefreshCw, AlertCircle } from "lucide-react";
import { whatsAppApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export function WhatsAppConnect() {
  const { tenant } = useAuthStore();
  const [status, setStatus] = useState<"checking" | "disconnected" | "connecting" | "connected">("checking");
  const [qr, setQr] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === "connecting") {
      const qrInterval = setInterval(fetchQR, 3000);
      return () => clearInterval(qrInterval);
    }
  }, [status]);

  const checkStatus = async () => {
    try {
      const { data } = await whatsAppApi.getStatus();
      setStatus(data.connected ? "connected" : data.state === "connecting" ? "connecting" : "disconnected");
      if (data.connected && data.phone) setPhone(data.phone);
    } catch (e: any) {
      setStatus("disconnected");
    }
  };

  const fetchQR = async () => {
    try {
      const { data } = await whatsAppApi.getQR();
      if (data.qrCode) setQr(`data:image/png;base64,\${data.qrCode}`);
    } catch (e) {}
  };

  const handleConnect = async () => {
    setError("");
    try {
      await whatsAppApi.connect();
      setStatus("connecting");
    } catch (e: any) {
      setError(e.response?.data?.message || "Erro ao conectar");
    }
  };

  const handleDisconnect = async () => {
    try {
      await whatsAppApi.disconnect();
      setStatus("disconnected");
      setQr("");
      setPhone("");
    } catch (e) {}
  };

  if (status === "connected") {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-300 mb-4">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Conectado — {phone}</span>
        </div>
        <button onClick={handleDisconnect} className="text-sm text-red-600 hover:underline">
          Desconectar WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        {status === "connecting" && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
        {status === "disconnected" && <XCircle className="w-5 h-5" />}
        <span>Status: {status === "connecting" ? "Conectando..." : "Desconectado"}</span>
      </div>

      {error && <div className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</div>}

      {status !== "connecting" && (
        <button onClick={handleConnect} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Conectar WhatsApp
        </button>
      )}

      {status === "connecting" && qr && (
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">Escaneie com seu WhatsApp:</p>
          <img src={qr} alt="QR Code" className="mx-auto border rounded bg-white p-2" width={256} />
          <p className="text-xs text-gray-500">Atualiza a cada 3s • Expira em 45s</p>
          <p className="text-xs text-gray-500">WhatsApp → Configurações → Aparelhos conectados → Conectar aparelho</p>
        </div>
      )}
    </div>
  );
}