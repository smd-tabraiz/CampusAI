import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Plus,
  Compass,
  Utensils,
  SearchCheck,
  Calendar,
  Users,
  ShieldAlert,
  Bot,
  User,
  Clock,
  ChevronRight,
  RefreshCw,
  PhoneCall,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { campusApi } from '../services/api';
import { AiChatMessage } from '../types';
import { ChatCards } from '../components/ai/ChatCards';

export const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load conversation history on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await campusApi.getConversations();
        setConversations(res.data.conversations || []);
        if (res.data.conversations?.length > 0 && !activeConvoId) {
          loadConversationMessages(res.data.conversations[0].id);
        }
      } catch {
        // Fallback for demo / guest mode
      }
    };
    loadConversations();
  }, []);

  const loadConversationMessages = async (convoId: string) => {
    try {
      setActiveConvoId(convoId);
      const res = await campusApi.getConversation(convoId);
      const msgs = res.data.conversation?.messages || [];
      setMessages(
        msgs.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          content: m.content,
          intent: m.intent,
          cards: m.structuredData ? JSON.parse(m.structuredData).cards : undefined
        }))
      );
    } catch {
      // Fallback
    }
  };

  // If initial query exists in URL (e.g. from Dashboard or Search modal)
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      handleSendMessage(initialQuery);
    } else if (messages.length === 0) {
      // Greeting message
      setMessages([
        {
          id: 'welcome',
          sender: 'ASSISTANT',
          content: `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I am your CampusAI assistant. I can guide you through campus buildings, search lost items, discover cafeteria food under ₹100, suggest roommates, or locate upcoming events. How can I help you?`,
          quickReplies: [
            "What's happening on campus today?",
            'Find food under ₹100 near me',
            'Where can I print my assignment?',
            'Find a roommate who studies at night'
          ]
        }
      ]);
    }
  }, [searchParams]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: AiChatMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      content: query
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await campusApi.chat({
        message: query,
        conversationId: activeConvoId
      });

      if (res.data.conversationId && !activeConvoId) {
        setActiveConvoId(res.data.conversationId);
      }

      const assistantMessage: AiChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ASSISTANT',
        content: res.data.message,
        intent: res.data.intent,
        cards: res.data.cards,
        quickReplies: res.data.quickReplies
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ASSISTANT',
          content: 'I experienced a brief connection interruption. Please try asking again!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = async () => {
    try {
      const res = await campusApi.createConversation('New Campus Chat');
      setActiveConvoId(res.data.conversation.id);
      setMessages([
        {
          id: 'new',
          sender: 'ASSISTANT',
          content: `Started a fresh conversation! What would you like to explore on campus?`,
          quickReplies: ['What events are happening today?', 'Find food under ₹80', 'Where is the computer lab?']
        }
      ]);
    } catch {
      setActiveConvoId(undefined);
      setMessages([]);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex gap-4 animate-in fade-in duration-200">
      {/* LEFT COLUMN: Conversation History (Desktop) */}
      <div className="hidden lg:flex flex-col w-64 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <button
          onClick={startNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-all shadow-sm mb-4"
        >
          <Plus className="w-4 h-4" />
          New Inquiry
        </button>

        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
          Recent Conversations
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => loadConversationMessages(c.id)}
              className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors truncate block ${
                activeConvoId === c.id
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.title || 'Campus Inquiry'}
            </button>
          ))}

          {conversations.length === 0 && (
            <div className="text-xs text-slate-400 p-2 text-center">
              No saved conversations yet.
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>IBM watsonx & Heuristic AI</span>
        </div>
      </div>

      {/* CENTER COLUMN: Chat Interface */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Chat Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight">CampusAI Assistant</div>
              <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Campus Grounding Active
              </div>
            </div>
          </div>

          <button
            onClick={startNewChat}
            className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'USER' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                  m.sender === 'USER'
                    ? 'bg-slate-800'
                    : 'bg-gradient-to-tr from-brand-600 to-purple-600 shadow-sm'
                }`}
              >
                {m.sender === 'USER' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                  m.sender === 'USER'
                    ? 'bg-brand-600 text-white rounded-tr-sm'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Structured UI Cards */}
                {m.cards && m.cards.length > 0 && <ChatCards cards={m.cards} />}

                {/* Quick Reply Chips */}
                {m.quickReplies && m.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-200/60">
                    {m.quickReplies.map((qr, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSendMessage(qr)}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-white hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200 transition-colors shadow-2xs"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Typing Indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about campus life, directions, food, lost items, roommates..."
              className="flex-1 py-2 px-3 text-xs sm:text-sm bg-transparent border-none outline-none focus:ring-0 text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-40 transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Campus Context & Quick Tools (Desktop) */}
      <div className="hidden xl:flex flex-col w-72 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Campus Quick Shortcuts
          </div>
          <div className="space-y-1.5">
            <button
              onClick={() => handleSendMessage('Take me to the computer science block')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 hover:text-indigo-700 text-xs font-medium text-slate-700 transition-colors text-left group"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-500" /> CS Block Route
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500" />
            </button>

            <button
              onClick={() => handleSendMessage('Find food under ₹100 near me')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 hover:text-emerald-700 text-xs font-medium text-slate-700 transition-colors text-left group"
            >
              <span className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-500" /> Meals under ₹100
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500" />
            </button>

            <button
              onClick={() => handleSendMessage('I lost my ID card near the library')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 hover:text-amber-700 text-xs font-medium text-slate-700 transition-colors text-left group"
            >
              <span className="flex items-center gap-2">
                <SearchCheck className="w-4 h-4 text-amber-500" /> Report Lost ID Card
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500" />
            </button>

            <button
              onClick={() => handleSendMessage('Find me a roommate who studies at night')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/60 hover:text-purple-700 text-xs font-medium text-slate-700 transition-colors text-left group"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" /> Night Owl Roommates
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-500" />
            </button>
          </div>
        </div>

        {/* Emergency Card in Context Panel */}
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
          <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700 mb-1">
            <ShieldAlert className="w-4 h-4" /> 24/7 Medical Center
          </div>
          <p className="text-[11px] text-rose-800 mb-2 leading-relaxed">
            Dhanvantari Emergency Health Center is staffed 24 hours daily.
          </p>
          <a
            href="tel:+918023456789"
            className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Call +91 80 2345 6789
          </a>
        </div>

        {/* Today's Campus Hours */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> Today's Facility Hours
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>Central Library</span>
              <span className="font-semibold text-slate-800">8 AM - 11 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Anna Food Court</span>
              <span className="font-semibold text-slate-800">7:30 AM - 10:30 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Digital Printing 102</span>
              <span className="font-semibold text-slate-800">Open Now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
