// AGENTIC BACKBONE — Main restoreit Chat Interface
// Implements: RestoreAgent (natural language query), TroubleshootingAgent,
// SupportAgent, streaming responses, tool use display, safety layer
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Loader2, AlertTriangle, CheckCircle2, Terminal, FileText, Image as ImageIcon, Film } from 'lucide-react';

type MessageRole = 'user' | 'agent';
type ChunkType = 'thinking' | 'tool_use' | 'result' | 'error';

interface ToolUse {
    name: string;
    input: string;
    output?: string;
    status: 'running' | 'done' | 'error';
}

interface MessageChunk {
    type: ChunkType;
    content: string;
    toolUse?: ToolUse;
}

interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: number;
    chunks?: MessageChunk[];
    isStreaming?: boolean;
}

interface AgentChatProps {
    onClose: () => void;
    darkMode: boolean;
}

// Simulated agent responses with tool use + streaming
const AGENT_RESPONSES: Record<string, MessageChunk[]> = {
    restore_photos_intent: [
        { type: 'thinking', content: 'Parsing intent: file types → JPEG, DNG, RAW. Date range detected: June 2025. Prioritizing by resolution.' },
        { type: 'tool_use', content: '', toolUse: { name: 'scan_drive', input: '{ file_types: ["jpg","jpeg","dng","raw","heic"], date_range: "2025-06-01..2025-06-30", sort: "resolution_desc" }', status: 'running' } },
        { type: 'tool_use', content: '', toolUse: { name: 'scan_drive', input: '{ file_types: ["jpg","jpeg","dng","raw","heic"], date_range: "2025-06-01..2025-06-30", sort: "resolution_desc" }', output: '214 files found · 4.2 GB restorable · 98% intact', status: 'done' } },
        { type: 'result', content: 'I found **214 photos from June 2025**, totalling 4.2 GB. Most are intact — 98% restoration confidence.\n\nTop results include:\n• 47 high-resolution JPEG files (6000×4000+)\n• 38 DNG RAW files from what appears to be a mirrorless camera\n• 129 HEIC files from an iPhone\n\nI\'ve pre-selected the strongest candidates in the file browser above. Ready to extract?' },
    ],
    relay_fail: [
        { type: 'thinking', content: 'Relay connection error detected. Running automated diagnostics.' },
        { type: 'tool_use', content: '', toolUse: { name: 'check_network', input: '{}', status: 'running' } },
        { type: 'tool_use', content: '', toolUse: { name: 'check_network', input: '{}', output: 'Network: OK (24ms latency)', status: 'done' } },
        { type: 'tool_use', content: '', toolUse: { name: 'verify_ssl', input: '{ host: "restoreit.app" }', status: 'running' } },
        { type: 'tool_use', content: '', toolUse: { name: 'verify_ssl', input: '{ host: "restoreit.app" }', output: 'SSL cert valid · TLS 1.3 OK', status: 'done' } },
        { type: 'tool_use', content: '', toolUse: { name: 'check_disk_permissions', input: '{ drive: "/dev/disk0" }', status: 'running' } },
        { type: 'tool_use', content: '', toolUse: { name: 'check_disk_permissions', input: '{ drive: "/dev/disk0" }', output: 'WARNING: Full Disk Access not granted for Terminal', status: 'done' } },
        { type: 'result', content: 'Found the issue. **Terminal does not have Full Disk Access.** This is blocking the relay from reading your drive.\n\n**Fix (30 seconds):**\n1. Open **System Settings**\n2. Go to **Privacy & Security → Full Disk Access**\n3. Click the `+` button and add **Terminal**\n4. Re-run the relay command\n\nNetwork and SSL are both fine — this is the only blocker.' },
    ],
    restore_photos: [
        { type: 'thinking', content: 'Identifying photo fragments across disk sectors...' },
        { type: 'result', content: 'I have identified 4,284 JPEG and RAW fragments that appear to be from a wedding shoot. I can prioritize these for bit-perfect restoration.\n\nWould you like to start the restoration of these fragments?' }
    ],
    default: [
        { type: 'thinking', content: 'Searching knowledge base and app context...' },
        { type: 'result', content: 'I\'m here to help. You can ask me to:\n\n• **Restore specific files** — e.g. "Find my tax documents from 2024"\n• **Troubleshoot relay issues** — if the curl command fails\n• **Explain the process** — how sectors, APFS, or data restoration works\n• **Guide you through restoration** — step by step\n\nWhat would you like to do?' }
        ,
    ],
};

const QUICK_PROMPTS = [
    { label: 'Restore wedding photos', icon: <ImageIcon size={13} aria-hidden="true" />, query: 'restore_photos' },
    { label: 'Relay connection failed', icon: <AlertTriangle size={13} aria-hidden="true" />, query: 'relay_fail' },
    { label: 'Find tax documents', icon: <FileText size={13} aria-hidden="true" />, query: 'default' },
    { label: 'Restore videos from 2023', icon: <Film size={13} aria-hidden="true" />, query: 'default' },
];

function ToolBlock({ tool, darkMode }: { tool: ToolUse; darkMode: boolean }) {
    return (
        <div className={`rounded-xl border text-xs font-mono overflow-hidden my-2 ${darkMode ? 'border-[#8A2BE2]/30 bg-black/60' : 'border-[#8A2BE2]/20 bg-zinc-50'}`}>
            <div className={`flex items-center justify-between px-3 py-2 border-b ${darkMode ? 'border-[#8A2BE2]/20 bg-[#8A2BE2]/5' : 'border-[#8A2BE2]/10 bg-[#8A2BE2]/5'}`}>
                <div className="flex items-center gap-2 text-[#8A2BE2]">
                    <Terminal size={11} />
                    <span className="font-bold">{tool.name}</span>
                </div>
                {tool.status === 'running' && <Loader2 size={11} className="animate-spin text-[#8A2BE2]" />}
                {tool.status === 'done' && <CheckCircle2 size={11} className="text-green-400" />}
                {tool.status === 'error' && <AlertTriangle size={11} className="text-red-400" />}
            </div>
            <div className={`px-3 py-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>{tool.input}</div>
            {tool.output && (
                <div className={`px-3 py-2 border-t ${darkMode ? 'border-white/5 text-zinc-300' : 'border-black/5 text-zinc-700'}`}>→ {tool.output}</div>
            )}
        </div>
    );
}

function renderMarkdownSafe(text: string, darkMode: boolean): React.ReactNode {
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
                    <strong key={`${lineIdx}-${keyIdx++}`} className={`font-semibold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
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

function MessageBubble({ msg, darkMode }: { msg: Message; darkMode: boolean }) {
    const isAgent = msg.role === 'agent';

    return (
        <div className={`flex gap-3 ${isAgent ? 'justify-start' : 'justify-end'}`}>
            {isAgent && (
                <div className="w-7 h-7 rounded-full bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 text-[#8A2BE2] flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-3.5 h-3.5 bg-white/10 rounded flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                </div>
            )}
            <div className={`max-w-[82%] space-y-2`}>
                {isAgent && msg.chunks && msg.chunks.map((chunk, i) => (
                    <div key={i}>
                        {chunk.type === 'thinking' && (
                            <div className={`text-[11px] flex items-center gap-2 px-3 py-2 rounded-xl italic ${darkMode ? 'text-zinc-600 bg-white/[0.02] border border-white/5' : 'text-zinc-400 bg-zinc-50 border border-zinc-100'}`}>
                                <Loader2 size={10} className="animate-spin shrink-0" />
                                {chunk.content}
                            </div>
                        )}
                        {chunk.type === 'tool_use' && chunk.toolUse && (
                            <ToolBlock tool={chunk.toolUse} darkMode={darkMode} />
                        )}
                        {chunk.type === 'result' && (
                            <div className={`px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed ${darkMode ? 'bg-[#1A1A1D] border border-white/10 text-zinc-300' : 'bg-white border border-black/10 text-zinc-700'}`}>
                                {renderMarkdownSafe(chunk.content, darkMode)}
                            </div>
                        )}
                    </div>
                ))}
                {isAgent && (!msg.chunks || msg.chunks.length === 0) && (
                    <div className={`px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed ${darkMode ? 'bg-[#1A1A1D] border border-white/10 text-zinc-300' : 'bg-white border border-black/10 text-zinc-700'}`}>
                        {msg.isStreaming ? (
                            <span className="flex items-center gap-2 text-zinc-500"><Loader2 size={13} className="animate-spin" />Thinking...</span>
                        ) : msg.content}
                    </div>
                )}
                {!isAgent && (
                    <div className="bg-[#8A2BE2] text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed ml-auto">
                        {msg.content}
                    </div>
                )}
                <div className={`text-[10px] ${darkMode ? 'text-zinc-700' : 'text-zinc-400'} ${isAgent ? 'pl-1' : 'text-right pr-1'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}

export function AgentChat({ onClose, darkMode }: AgentChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: crypto.randomUUID(),
            role: 'agent',
            content: '',
            timestamp: Date.now(),
            chunks: [{ type: 'result', content: "I'm your Restoration Assistant. I can help you find specific files, troubleshoot connection issues, and walk you through the restoration process.\n\nWhat would you like to restore?" }],
        },
    ]);
    const [input, setInput] = useState('');
    const [streaming, setStreaming] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const streamResponse = useCallback(async (responseKey: string) => {
        const chunks: MessageChunk[] = AGENT_RESPONSES[responseKey] || AGENT_RESPONSES.default;
        const msgId = crypto.randomUUID();

        setMessages(prev => [...prev, {
            id: msgId, role: 'agent', content: '', timestamp: Date.now(),
            chunks: [], isStreaming: true,
        }]);

        for (let i = 0; i < chunks.length; i++) {
            await new Promise(r => setTimeout(r, chunks[i].type === 'thinking' ? 800 : chunks[i].type === 'tool_use' ? 1200 : 600));

            if (chunks[i].type === 'tool_use' && chunks[i].toolUse?.status === 'running') {
                // Show running state
                setMessages(prev => prev.map(m => m.id === msgId ? { ...m, chunks: [...(m.chunks || []), chunks[i]] } : m));
                // Then resolve it
                await new Promise(r => setTimeout(r, 900));
                setMessages(prev => prev.map(m => {
                    if (m.id !== msgId) return m;
                    const updatedChunks = (m.chunks || []).map((c, ci) =>
                        ci === (m.chunks || []).length - 1 && c.type === 'tool_use' && chunks[i + 1]?.toolUse
                            ? { ...c, toolUse: chunks[i + 1].toolUse }
                            : c
                    );
                    return { ...m, chunks: updatedChunks };
                }));
                i++; // Skip the 'done' version we just merged in
            } else {
                setMessages(prev => prev.map(m => m.id === msgId
                    ? { ...m, chunks: [...(m.chunks || []), chunks[i]], isStreaming: i < chunks.length - 1 }
                    : m
                ));
            }
        }

        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isStreaming: false } : m));
        setStreaming(false);
    }, []);

    const sendMessage = useCallback(async (text: string, responseKey = 'default') => {
        if (!text.trim() || streaming) return;
        setInput('');
        setStreaming(true);

        const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);

        // Intent classification (simulated)
        await new Promise(r => setTimeout(r, 300));
        const lower = text.toLowerCase();
        let key = responseKey;
        if (lower.includes('photo') || lower.includes('image') || lower.includes('picture') || lower.includes('wedding')) key = 'restore_photos';
        else if (lower.includes('fail') || lower.includes('error') || lower.includes('curl') || lower.includes('relay') || lower.includes('connect')) key = 'relay_fail';

        await streamResponse(key);
        inputRef.current?.focus();
    }, [streaming, streamResponse]);

    return (
        <div className={`fixed bottom-24 right-6 z-50 w-96 max-h-[600px] flex flex-col rounded-2xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 ${darkMode ? 'bg-[#111113] border-white/10' : 'bg-white border-black/10'}`}
            role="dialog" aria-label="Restoration Assistant" aria-modal="false">

            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3.5 border-b ${darkMode ? 'border-white/5 bg-black/40' : 'border-black/5 bg-zinc-50'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 text-[#8A2BE2] flex items-center justify-center">
                        <div className="w-3.5 h-3.5 bg-[#8A2BE2]/20 rounded flex items-center justify-center">
                            <div className="w-1 h-1 bg-[#8A2BE2] rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Restoration Assistant</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            Ready · {streaming ? 'Analyzing...' : 'Online'}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} aria-label="Close assistant" className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'}`}>
                    <X size={16} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-[420px]">
                {messages.map(msg => (
                    <MessageBubble key={msg.id} msg={msg} darkMode={darkMode} />
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
                <div className={`px-4 pb-2 border-t ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <div className={`text-[10px] uppercase tracking-wider font-semibold mb-2 pt-3 ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>Quick Actions</div>
                    <div className="grid grid-cols-2 gap-1.5">
                        {QUICK_PROMPTS.map(({ label, icon, query }) => (
                            <button key={label} onClick={() => sendMessage(label, query)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs text-left transition-all ${darkMode ? 'border-white/8 text-zinc-400 hover:border-[#8A2BE2]/40 hover:text-white hover:bg-[#8A2BE2]/5' : 'border-black/8 text-zinc-500 hover:border-[#8A2BE2]/30 hover:text-zinc-900 hover:bg-[#8A2BE2]/5'}`}>
                                <span className="text-[#8A2BE2] shrink-0">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className={`p-3 border-t ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
                <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${darkMode ? 'border-white/10 bg-black/40 focus-within:border-[#8A2BE2]/50' : 'border-black/10 bg-zinc-50 focus-within:border-[#8A2BE2]/40'}`}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={streaming}
                        placeholder={streaming ? 'Agent is responding...' : 'Ask about your restoration...'}
                        className="flex-1 bg-transparent text-sm outline-none placeholder-zinc-600"
                        aria-label="Message the restoration assistant"
                    />
                    <button type="submit" disabled={!input.trim() || streaming} aria-label="Send message"
                        className="w-7 h-7 rounded-lg bg-[#8A2BE2] disabled:opacity-30 hover:bg-[#7e22ce] text-white flex items-center justify-center transition-all shrink-0">
                        <Send size={13} />
                    </button>
                </form>
                <p className={`text-[10px] text-center mt-2 ${darkMode ? 'text-zinc-700' : 'text-zinc-400'}`}>
                    RestoreIt Cloud · Never shares your data
                </p>
            </div>
        </div>
    );
}
