import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type ReactNode } from 'react';
import { RotateCcw, Pin, X, Send, Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AgentforceIcon } from './GlobalHeader';

/* ─── Content renderer ─── */

function renderContent(text: string): ReactNode {
  const paragraphs = text.split('\n\n');

  return paragraphs.map((para, pi) => {
    const lines = para.split('\n');
    const rendered: ReactNode[] = [];
    let bulletBuffer: ReactNode[] = [];
    let orderedBuffer: ReactNode[] = [];

    const flushBullets = () => {
      if (bulletBuffer.length) {
        rendered.push(
          <ul key={`ul-${pi}-${rendered.length}`} style={{ margin: '6px 0', paddingLeft: 18 }}>
            {bulletBuffer}
          </ul>,
        );
        bulletBuffer = [];
      }
    };

    const flushOrdered = () => {
      if (orderedBuffer.length) {
        rendered.push(
          <ol key={`ol-${pi}-${rendered.length}`} style={{ margin: '6px 0', paddingLeft: 18 }}>
            {orderedBuffer}
          </ol>,
        );
        orderedBuffer = [];
      }
    };

    lines.forEach((line, li) => {
      const isBullet = line.startsWith('• ') || line.startsWith('- ');
      const orderedMatch = line.match(/^(\d+)\.\s+/);
      const isStep = line.match(/^\*\*Step\s+\d+:\*\*/);

      if (isBullet) {
        flushOrdered();
        bulletBuffer.push(
          <li key={`b-${pi}-${li}`} style={{ marginBottom: 3, lineHeight: 1.55 }}>
            {inlineFormat(line.replace(/^[•\-]\s*/, ''))}
          </li>,
        );
        return;
      }

      if (orderedMatch) {
        flushBullets();
        orderedBuffer.push(
          <li key={`o-${pi}-${li}`} style={{ marginBottom: 3, lineHeight: 1.55 }}>
            {inlineFormat(line.replace(/^\d+\.\s+/, ''))}
          </li>,
        );
        return;
      }

      flushBullets();
      flushOrdered();

      if (isStep) {
        rendered.push(
          <div
            key={`step-${pi}-${li}`}
            style={{
              borderLeft: '3px solid var(--sf-blue)',
              paddingLeft: 10,
              margin: '6px 0',
              lineHeight: 1.55,
            }}
          >
            {inlineFormat(line)}
          </div>,
        );
      } else if (line.trim()) {
        rendered.push(
          <div key={`l-${pi}-${li}`} style={{ lineHeight: 1.55 }}>
            {inlineFormat(line)}
          </div>,
        );
      }
    });

    flushBullets();
    flushOrdered();

    return (
      <div key={`p-${pi}`} style={{ marginBottom: pi < paragraphs.length - 1 ? 10 : 0 }}>
        {rendered}
      </div>
    );
  });
}

function inlineFormat(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[2] !== undefined) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      parts.push(
        <code
          key={key++}
          style={{
            background: '#e8f0fe',
            padding: '1px 5px',
            borderRadius: 3,
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        >
          {match[3]}
        </code>,
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

/* ─── Bouncing dots animation (injected once) ─── */

const DOTS_STYLE_ID = 'agentpanel-dots-keyframes';

function ensureDotsKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(DOTS_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = DOTS_STYLE_ID;
  style.textContent = `
    @keyframes agentDotBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
    }
  `;
  document.head.appendChild(style);
}

function BouncingDots() {
  useEffect(ensureDotsKeyframes, []);

  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center', height: 20 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#999',
            display: 'inline-block',
            animation: `agentDotBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

/* ─── Timestamp formatter ─── */

function formatTime(ts: string): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

/* ─── Main component ─── */

export function AgentPanel() {
  const {
    agentMessages,
    isProcessing,
    processingMessage,
    handleAgentAction,
    sendAgentMessage,
    setAgentPanelOpen,
  } = useAppContext();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentMessages, isProcessing]);

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    sendAgentMessage(trimmed);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [inputValue, sendAgentMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 72) + 'px';
  }, []);

  const hasInput = inputValue.trim().length > 0;

  return (
    <div
      style={{
        width: 380,
        height: '100%',
        background: '#fff',
        borderLeft: '1px solid var(--sf-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* ─── Header ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--sf-border)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AgentforceIcon size={22} />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Agentforce</span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--sf-blue)',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {[RotateCcw, Pin].map((Icon, i) => (
            <button
              key={i}
              style={{
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                color: 'var(--sf-text-secondary)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f3f3')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Icon size={15} />
            </button>
          ))}
          <button
            onClick={() => setAgentPanelOpen(false)}
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              color: 'var(--sf-text-secondary)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f3f3')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ─── Messages ─── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {agentMessages.map((msg) => {
          const isBot = msg.role === 'bot';
          return (
            <div key={msg.id}>
              {/* Message row */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: isBot ? 'row' : 'row-reverse',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                {/* Avatar */}
                {isBot ? (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#eee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AgentforceIcon size={20} />
                  </div>
                ) : (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--sf-blue)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    PR
                  </div>
                )}

                {/* Bubble */}
                <div
                  style={{
                    background: isBot ? 'var(--sf-agent-bg)' : 'var(--sf-agent-user-bg)',
                    borderRadius: isBot ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                    padding: '10px 14px',
                    maxWidth: 'calc(100% - 44px)',
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'var(--sf-text)',
                    wordBreak: 'break-word',
                  }}
                >
                  {renderContent(msg.content)}
                </div>
              </div>

              {/* Timestamp */}
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--sf-text-muted)',
                  marginTop: 4,
                  marginLeft: isBot ? 36 : 0,
                  marginRight: isBot ? 0 : 36,
                  textAlign: isBot ? 'left' : 'right',
                }}
              >
                {formatTime(msg.timestamp)}
              </div>

              {/* Action links */}
              {isBot && msg.actions && msg.actions.length > 0 && (
                <div style={{ marginTop: 6, marginLeft: 36, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {msg.actions.map((action, ai) => (
                    <button
                      key={ai}
                      onClick={() => handleAgentAction((action as any).actionId ?? (action as any).type)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        color: 'var(--sf-blue)',
                        fontSize: 13,
                        fontWeight: 500,
                        padding: 0,
                        textAlign: 'left',
                        lineHeight: 1.4,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      <Play size={10} style={{ flexShrink: 0 }} />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isProcessing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AgentforceIcon size={20} />
            </div>
            <div
              style={{
                background: 'var(--sf-agent-bg)',
                borderRadius: '12px 12px 12px 2px',
                padding: '10px 14px',
                fontSize: 13,
                minHeight: 36,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {processingMessage ? (
                <span style={{ fontStyle: 'italic', color: 'var(--sf-text-secondary)' }}>
                  {processingMessage}
                  <BouncingDots />
                </span>
              ) : (
                <BouncingDots />
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Input area ─── */}
      <div
        style={{
          borderTop: '1px solid var(--sf-border)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Describe your task or ask a question..."
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid var(--sf-border)',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 13,
            lineHeight: 1.45,
            outline: 'none',
            maxHeight: 72,
            overflow: 'auto',
            color: 'var(--sf-text)',
            background: '#fff',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--sf-blue)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--sf-border)')}
        />
        <button
          onClick={handleSend}
          disabled={!hasInput}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: hasInput ? 'var(--sf-blue)' : '#e5e5e5',
            color: hasInput ? '#fff' : '#999',
            flexShrink: 0,
            transition: 'background 0.15s, color 0.15s',
            cursor: hasInput ? 'pointer' : 'default',
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
