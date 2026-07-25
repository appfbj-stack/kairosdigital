// hooks/useOpenRouter.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  openRouterService,
  OPENROUTER_MODELS,
  saveApiKey,
  loadApiKey,
  saveSelectedModel,
  loadSelectedModel,
  type ChatMessage,
  type OpenRouterModel
} from "@/lib/openrouter";

export function useOpenRouter() {
  const [apiKey, setApiKeyState] = useState<string>("");
  const [selectedModel, setSelectedModelState] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  // Carregar configurações salvas
  useEffect(() => {
    const savedKey = loadApiKey();
    const savedModel = loadSelectedModel();
    setApiKeyState(savedKey);
    setSelectedModel(savedModel);
    openRouterService.setApiKey(savedKey);
    setIsConfigured(savedKey.length > 0);
  }, []);

  // Atualizar API Key
  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    openRouterService.setApiKey(key);
    saveApiKey(key);
    setIsConfigured(key.length > 0);
  }, []);

  // Atualizar modelo selecionado
  const setSelectedModel = useCallback((modelId: string) => {
    setSelectedModelState(modelId);
    saveSelectedModel(modelId);
  }, []);

  // Enviar mensagem
  const chat = useCallback(
    async (messages: ChatMessage[]) => {
      setIsLoading(true);
      setError(null);

      const result = await openRouterService.chat(messages, selectedModel);

      setIsLoading(false);

      if (!result.success) {
        setError(result.error || "Erro desconhecido");
        return null;
      }

      return result.content;
    },
    [selectedModel]
  );

  // Pergunta bíblica
  const askBibleQuestion = useCallback(
    async (question: string, context: string) => {
      setIsLoading(true);
      setError(null);

      const result = await openRouterService.askBibleQuestion(
        question,
        context,
        selectedModel
      );

      setIsLoading(false);

      if (!result.success) {
        setError(result.error || "Erro desconhecido");
        return null;
      }

      return result.content;
    },
    [selectedModel]
  );

  // Explicar versículo
  const explainVerse = useCallback(
    async (reference: string, verseText: string) => {
      setIsLoading(true);
      setError(null);

      const result = await openRouterService.explainVerse(
        reference,
        verseText,
        selectedModel
      );

      setIsLoading(false);

      if (!result.success) {
        setError(result.error || "Erro desconhecido");
        return null;
      }

      return result.content;
    },
    [selectedModel]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    apiKey,
    setApiKey,
    selectedModel,
    setSelectedModel,
    models: OPENROUTER_MODELS,
    isLoading,
    error,
    isConfigured,
    chat,
    askBibleQuestion,
    explainVerse,
    clearError
  };
}
