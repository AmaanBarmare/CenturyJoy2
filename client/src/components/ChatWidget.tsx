import { useEffect, useRef, useState } from 'react';
import { api, apiError } from '../lib/api';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const GREETING: Msg = {
  role: 'assistant',
  content: "Hi! I'm the Century Joy assistant. Ask me about our visualisation services, the process, file types, or how to get access.",
};

const SUGGESTIONS = [
  'What services do you offer?',
  'How does the process work?',
  'What files can I upload?',
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    setInput('');

    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setLoading(true);
    try {
      // Send the real exchange (skip the local greeting).
      const history = next.filter((m, i) => !(i === 0 && m === GREETING));
      const { data } = await api.post<{ reply: string }>('/chat', { messages: history });
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="chatw">
      {open && (
        <div className="chatw-panel" role="dialog" aria-label="Century Joy assistant">
          <header className="chatw-head">
            <div className="chatw-head-t">
              <span className="chatw-dot" />
              <div>
                <div className="chatw-title">Century Joy assistant</div>
                <div className="chatw-sub">Typically replies instantly</div>
              </div>
            </div>
            <button className="chatw-x" onClick={() => setOpen(false)} aria-label="Close chat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </header>

          <div className="chatw-body" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatw-msg ${m.role}`}>{m.content}</div>
            ))}
            {loading && (
              <div className="chatw-msg assistant chatw-typing" aria-label="Assistant is typing">
                <span /><span /><span />
              </div>
            )}
            {error && <div className="chatw-error">{error}</div>}
            {messages.length === 1 && !loading && (
              <div className="chatw-suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>

          <div className="chatw-input">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              placeholder="Ask a question…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Message"
            />
            <button onClick={() => send(input)} disabled={!input.trim() || loading} aria-label="Send message">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
          </div>
        </div>
      )}

      <button
        className={`chatw-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
        )}
      </button>
    </div>
  );
}
