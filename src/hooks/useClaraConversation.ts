import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceBrasilia } from '@/lib/dateUtils';

interface ConversationMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface ConversationHistory {
  lastTopic: string | null;
  lastMessageDate: Date | null;
  recentTopics: string[];
  totalMessages: number;
}

interface WelcomeData {
  greeting: string;
  hasHistory: boolean;
  lastVisitInfo: string | null;
  suggestedContinuation: string | null;
}

// Extrai tópico principal de uma mensagem (simplificado)
function extractTopic(content: string): string {
  const firstSentence = content.split(/[.!?]/)[0] || content;
  // Limita a 50 chars
  return firstSentence.substring(0, 50).trim() + (firstSentence.length > 50 ? '...' : '');
}

export function useClaraConversation() {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<ConversationHistory | null>(null);
  const [previousMessages, setPreviousMessages] = useState<ConversationMessage[]>([]);
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  // Busca histórico de conversas anteriores
  const fetchConversationHistory = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Busca últimas 10 conversas do usuário
      const { data, error } = await supabase
        .from('clara_conversations')
        .select('id, role, content, created_at, session_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('[ClaraConversation] Fetch error:', error);
        setIsLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setHistory({
          lastTopic: null,
          lastMessageDate: null,
          recentTopics: [],
          totalMessages: 0,
        });
        setIsLoading(false);
        return;
      }

      // Processa histórico
      const lastMessage = data[0];
      const userMessages = data.filter(m => m.role === 'user');
      const topics = userMessages.slice(0, 3).map(m => extractTopic(m.content));

      setHistory({
        lastTopic: userMessages[0] ? extractTopic(userMessages[0].content) : null,
        lastMessageDate: lastMessage?.created_at ? new Date(lastMessage.created_at) : null,
        recentTopics: topics,
        totalMessages: data.length,
      });

      // Salva mensagens anteriores para contexto
      setPreviousMessages(data.reverse().map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        created_at: m.created_at || undefined,
      })));

    } catch (err) {
      console.error('[ClaraConversation] Exception:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Carrega histórico ao montar
  useEffect(() => {
    fetchConversationHistory();
  }, [fetchConversationHistory]);

  // Gera saudação personalizada
  const generateWelcome = useCallback((): WelcomeData => {
    const userName = profile?.nome;
    const now = new Date();
    const hour = now.getHours();
    
    // Saudação baseada no horário
    let timeGreeting = 'Olá';
    if (hour >= 5 && hour < 12) timeGreeting = 'Bom dia';
    else if (hour >= 12 && hour < 18) timeGreeting = 'Boa tarde';
    else timeGreeting = 'Boa noite';

    // Sem histórico
    if (!history || history.totalMessages === 0) {
      if (userName) {
        return {
          greeting: `${timeGreeting}, ${userName}! 👋 Sou a Clara, sua copiloto tributária.\n\nPosso ajudar com dúvidas sobre regimes tributários, reforma, créditos fiscais e muito mais. Como posso te ajudar hoje?`,
          hasHistory: false,
          lastVisitInfo: null,
          suggestedContinuation: null,
        };
      }
      return {
        greeting: `${timeGreeting}! 👋 Sou a Clara, sua copiloto tributária.\n\nAinda não sei seu nome. Como posso te chamar?\n\n_(Você pode me contar ou ir direto para sua dúvida, como preferir!)_`,
        hasHistory: false,
        lastVisitInfo: null,
        suggestedContinuation: null,
      };
    }

    // Com histórico
    const lastDate = history.lastMessageDate;
    let lastVisitInfo: string | null = null;
    let suggestedContinuation: string | null = null;

    if (lastDate) {
      const timeSince = formatDistanceBrasilia(lastDate, { addSuffix: false });
      lastVisitInfo = timeSince;
      
      // Se foi recente (menos de 24h), sugere continuar
      const hoursSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24 && history.lastTopic) {
        suggestedContinuation = history.lastTopic;
      }
    }

    // Monta saudação personalizada
    let greeting: string;
    const nameGreeting = userName ? `, ${userName}` : '';

    if (suggestedContinuation) {
      greeting = `${timeGreeting}${nameGreeting}! 🎯 Que bom te ver de novo.\n\nNa última conversa você perguntou sobre "${suggestedContinuation}". Quer continuar ou tem outra dúvida?`;
    } else if (lastVisitInfo && history.recentTopics.length > 0) {
      greeting = `${timeGreeting}${nameGreeting}! 👋 Faz ${lastVisitInfo} que conversamos.\n\nComo posso te ajudar hoje?`;
    } else {
      greeting = `${timeGreeting}${nameGreeting}! 😊 Como posso te ajudar hoje?`;
    }

    return {
      greeting,
      hasHistory: true,
      lastVisitInfo,
      suggestedContinuation,
    };
  }, [profile?.nome, history]);

  // Salva mensagem na tabela clara_conversations
  const saveMessage = useCallback(async (
    role: 'user' | 'assistant',
    content: string,
    screenContext?: string
  ): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('clara_conversations')
        .insert({
          user_id: user.id,
          session_id: sessionIdRef.current,
          role,
          content,
          screen_context: screenContext || 'clara-ai',
        })
        .select('id')
        .single();

      if (error) {
        console.error('[ClaraConversation] Save error:', error);
        return null;
      }

      return data?.id || null;
    } catch (err) {
      console.error('[ClaraConversation] Save exception:', err);
      return null;
    }
  }, [user?.id]);

  // Atualiza o nome do usuário se ele informar
  const updateUserName = useCallback(async (name: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nome: name })
        .eq('user_id', user.id);

      if (error) {
        console.error('[ClaraConversation] Update name error:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[ClaraConversation] Update name exception:', err);
      return false;
    }
  }, [user?.id]);

  // Retorna session ID para enviar ao backend
  const getSessionId = useCallback(() => sessionIdRef.current, []);

  // Retorna contexto de histórico para enviar ao backend
  const getHistoryContext = useCallback(() => {
    if (!history || history.totalMessages === 0) {
      return null;
    }

    return {
      recentTopics: history.recentTopics,
      lastMessageDate: history.lastMessageDate?.toISOString() || null,
      totalMessages: history.totalMessages,
      // Envia últimas 5 mensagens para contexto
      recentMessages: previousMessages.slice(-5).map(m => ({
        role: m.role,
        content: m.content.substring(0, 200), // Limita tamanho
      })),
    };
  }, [history, previousMessages]);

  return {
    isLoading,
    history,
    previousMessages,
    generateWelcome,
    saveMessage,
    updateUserName,
    getSessionId,
    getHistoryContext,
  };
}
