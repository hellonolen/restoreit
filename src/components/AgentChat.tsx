// Find and RestoreIt Engine — Chat Interface
"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, AlertTriangle, CheckCircle2, Terminal, FileText, Image as ImageIcon, Film, HelpCircle } from 'lucide-react';
import type { EngineMessage } from '@/hooks/useEngine';
import type { EngineStreamChunk, ToolResult } from '@/lib/engine/types';

interface AgentChatProps {
    onClose: () => void;
    messages: EngineMessage[];
    isStreaming: boolean;
    onSend: (message: string) => Promise<void>;
}

interface ToolDisplay {
    name: string;
    input: string;
    output?: string;
    status: 'running' | 'done' | 'error';
}

const QUICK_PROMPTS = [
    { label: 'Find my deleted photos', icon: <ImageIcon size={13} aria-hidden="true" />, query: 'I need to find deleted photos on my drive' },
    { label: 'Relay connection failed', icon: <AlertTriangle size={13} aria-hidden="true" />, query: 'My relay connection failed, I need help troubleshooting' },
    { label: 'Find tax documents', icon: <FileText size={13} aria-hidden="true" />, query: 'I need to find my tax documents that were deleted' },
    { label: 'How does this work?', icon: <HelpCircle size={13} aria-hidden="true" />, query: 'How does RestoreIt work? Is my data safe?' },
];

function ToolBlock({ tool }: { tool: ToolDisplay }) {
    return (
        <div className="rounded-xl border text-xs font-mono overflow-hidden my-2 border-[var(--color-accent)]/20 bg-[var(--color-card)]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                    <Terminal size={11} />
                    <span className="font-bold">{tool.name}</span>
                </div>
                {tool.status === 'running' && <Loader2 size={11} className="animate-spin text-[var(--color-accent)]" />}
                {tool.status === 'done' && <CheckCircle2 size={11} className="text-green-400" />}
                {tool.status === 'error' && <AlertTriangle size={11} className="text-red-400" />}
            </div>
            <div className="px-3 py-2 text-[var(--color-text-tertiary)]">{tool.input}</div>
            {tool.output && (
                <div className="px-3 py-2 border-t border-[var(--color-border)] text-[var(--color-text-secondary)]">→ {tool.output}</div>
            )}
        </div>
    );
}

function renderMarkdownSafe(text: string): React.ReactNode {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
        const parts: React.ReactNode[] = [];
        let remaining = line;
        let keyIdx = 0;

        while (remaining.length > 0) {
            const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
            if (boldMatch && boldMatch.index !== undefined) {
                if (boldMatch.index > 0) {
                    parts.push(<span key={`${lineIdx}-${keyIdx++}`}>{remaining.slice(0, boldMatch.index)}</span>);
                }
                parts.push(
                    <strong key={`${lineIdx}-${keyIdx++}`} className="font-semibold text-[var(--color-foreground)]">
                        {boldMatch[1]}
                    </strong>
                );
                remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
            } else {
                parts.push(<span key={`${lineIdx}-${keyIdx++}`}>{remaining}</span>);
                remaining = '';
            }
        }

        return (
            <span key={`line-${lineIdx}`}>
                {lineIdx > 0 && <br />}
                {parts}
            </span>
        );
    });
}

function chunkToToolDisplay(chunk: EngineStreamChunk): ToolDisplay | null {
    if (chunk.type === 'tool_use' && chunk.toolName) {
        return {
            name: chunk.toolName,
            input: JSON.stringify(chunk.toolInput || {}, null, 2),
            status: 'running',
        };
    }
    if (chunk.type === 'tool_result' && chunk.toolName) {
        const result = chunk.toolResult as ToolResult | undefined;
        return {
            name: chunk.toolName,
            input: JSON.stringify(chunk.toolInput || {}, null, 2),
            output: result?.message || 'Done',
            status: result?.success ? 'done' : 'error',
        };
    }
    return null;
}

function MessageBubble({ msg }: { msg: EngineMessage }) {
    const isAssistant = msg.role === 'assistant';

    // Build display from chunks
    const toolDisplays: ToolDisplay[] = [];
    let thinkingText = '';
    let resultText = msg.content;
    let hasError = false;

    for (const chunk of msg.chunks) {
        if (chunk.type === 'thinking' && chunk.content) {
            thinkingText = chunk.content;
        }
        const toolDisplay = chunkToToolDisplay(chunk);
        if (toolDisplay) {
            // Merge running → done for same tool
            const existing = toolDisplays.findIndex(t => t.name === toolDisplay.name && t.status === 'running');
            if (existing >= 0 && toolDisplay.status !== 'running') {
                toolDisplays[existing] = toolDisplay;
            } else {
                toolDisplays.push(toolDisplay);
            }
        }
        if (chunk.type === 'error') {
            hasError = true;
        }
    }

    return (
        <div className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
            {isAssistant && (
                <div className="w-7 h-7 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-3.5 h-3.5 bg-white/10 rounded flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                </div>
            )}
            <div className="max-w-[82%] space-y-2">
                {isAssistant && (
                    <>
                        {thinkingText && (
                            <div className="text-[11px] flex items-center gap-2 px-3 py-2 rounded-xl italic text-[var(--color-text-dim)] bg-[var(--color-card)] border border-[var(--color-border)]">
                                <Loader2 size={10} className={msg.isStreaming ? 'animate-spin' : ''} />
                                {thinkingText}
                            </div>
                        )}
                        {toolDisplays.map((tool, i) => (
                            <ToolBlock key={`${tool.name}-${i}`} tool={tool} />
                        ))}
                        {(resultText || msg.isStreaming) && (
                            <div className={`px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed ${
                                hasError
                                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                    : 'bg-[var(--color-background-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'
                            }`}>
                                {resultText
                                    ? renderMarkdownSafe(resultText)
                                    : <span className="flex items-center gap-2 text-[var(--color-text-tertiary)]"><Loader2 size={13} className="animate-spin" />Thinking...</span>
                                }
                                {msg.isStreaming && resultText && (
                                    <span className="inline-block w-1.5 h-4 bg-[var(--color-accent)] ml-0.5 animate-pulse rounded-sm" />
                                )}
                            </div>
                        )}
                    </>
                )}
                {!isAssistant && (
                    <div className="bg-[var(--color-accent)] text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed ml-auto">
                        {msg.content}
                    </div>
                )}
                <div className={`text-[10px] text-[var(--color-text-dim)] ${isAssistant ? 'pl-1' : 'text-right pr-1'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}

export function AgentChat({ onClose, messages, isStreaming, onSend }: AgentChatProps) {
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isStreaming) return;
        setInput('');
        await onSend(text);
        inputRef.current?.focus();
    };

    // Welcome message + real engine messages
    const displayMessages: EngineMessage[] = [
        {
            id: 'welcome',
            role: 'assistant',
            content: "I'm the RestoreIt Engine. I can scan your drive, analyze detected files, troubleshoot connection issues, and walk you through the process.\n\nWhat would you like to do?",
            timestamp: Date.now(),
            chunks: [{ type: 'text', content: "I'm the RestoreIt Engine. I can scan your drive, analyze detected files, troubleshoot connection issues, and walk you through the process.\n\nWhat would you like to do?" }],
            isStreaming: false,
        },
        ...messages,
    ];

    return (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] flex flex-col rounded-2xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 bg-[var(--color-background-elevated)] border-[var(--color-border)]"
            role="dialog" aria-label="RestoreIt Engine" aria-modal="false">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-card)]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-[var(--color-accent)] flex items-center justify-center">
                        <div className="w-3.5 h-3.5 bg-[var(--color-accent)]/20 rounded flex items-center justify-center">
                            <div className="w-1 h-1 bg-[var(--color-accent)] rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-[var(--color-foreground)]">RestoreIt Engine</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            {isStreaming ? 'Processing...' : 'Ready'}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} aria-label="Close engine" className="p-1.5 rounded-lg transition-colors text-[var(--color-text-tertiary)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card-hover)]">
                    <X size={16} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-[420px]">
                {displayMessages.map(msg => (
                    <MessageBubble key={msg.id} msg={msg} />
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 0 && (
                <div className="px-4 pb-2 border-t border-[var(--color-border)]">
                    <div className="text-[10px] uppercase tracking-wider font-semibold mb-2 pt-3 text-[var(--color-text-dim)]">Quick Actions</div>
                    <div className="grid grid-cols-2 gap-1.5">
                        {QUICK_PROMPTS.map(({ label, icon, query }) => (
                            <button key={label} onClick={() => handleSend(query)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs text-left transition-all border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)]/5">
                                <span className="text-[var(--color-accent)] shrink-0">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-[var(--color-border)]">
                <form onSubmit={e => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all border-[var(--color-border)] bg-[var(--color-card)] focus-within:border-[var(--color-accent)]/50">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={isStreaming}
                        placeholder={isStreaming ? 'Engine is processing...' : 'Describe what you need...'}
                        className="flex-1 bg-transparent text-sm outline-none placeholder-[var(--color-placeholder)]"
                        aria-label="Message the RestoreIt Engine"
                    />
                    <button type="submit" disabled={!input.trim() || isStreaming} aria-label="Send message"
                        className="w-7 h-7 rounded-lg bg-[var(--color-accent)] disabled:opacity-30 hover:opacity-80 text-white flex items-center justify-center transition-all shrink-0">
                        <Send size={13} />
                    </button>
                </form>
                <p className="text-[10px] text-center mt-2 text-[var(--color-text-dim)]">
                    RestoreIt Cloud · Your data is encrypted
                </p>
            </div>
        </div>
    );
}
