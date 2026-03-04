"use client";
// /account/vault — RestoreIt Cloud file browser
import { useState } from 'react';
import { Cloud, Search, Filter, Download, Image, Film, FileText, Shield } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { DEMO_VAULT_FILES } from '@/lib/demo-data';

export default function VaultPage() {
    const { isDemo } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [downloading, setDownloading] = useState<string | null>(null);

    const files = isDemo ? DEMO_VAULT_FILES : [];
    const filtered = files.filter(f =>
        f.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = async (fileId: string) => {
        setDownloading(fileId);
        try {
            const res = await fetch(`/api/vault/download-url/${fileId}`);
            const data = (await res.json()) as { url?: string };
            if (data.url) {
                window.open(data.url, '_blank');
            }
        } catch {
            // Download failed silently
        }
        setDownloading(null);
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image')) return <Image size={14} />;
        if (type.startsWith('video')) return <Film size={14} />;
        return <FileText size={14} />;
    };

    const getFileIconStyle = (type: string) => {
        if (type.startsWith('image')) return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
        if (type.startsWith('video')) return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
        return 'bg-zinc-800 border-zinc-700 text-zinc-500';
    };

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white mb-1">RestoreIt Cloud</h1>
                    <p className="text-sm text-zinc-500">Secure cloud storage for your restored files.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--color-accent)]/50 transition-all w-64"
                        />
                    </div>
                    <button className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 transition-all">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {/* Cloud Stats */}
                <div className="col-span-1 space-y-4">
                    <div className="p-5 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 space-y-4">
                        <div className="flex items-center gap-2 text-[var(--color-accent)]">
                            <Cloud size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Storage Usage</span>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-zinc-400">{isDemo ? '14.2 GB' : '0 GB'} of 100 GB</span>
                                <span className="text-white font-mono">{isDemo ? '14%' : '0%'}</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                <div className={`h-full bg-[var(--color-accent)] rounded-full shadow-[0_0_8px_rgba(138,43,226,0.5)]`} style={{ width: isDemo ? '14%' : '0%' }} />
                            </div>
                        </div>
                        <div className="pt-2 border-t border-[var(--color-accent)]/10 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-zinc-500">Retention</span>
                                <span className="text-white font-medium">90 Days</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-zinc-500">Encryption</span>
                                <span className="text-white font-medium">AES-256</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/10 bg-black/20 space-y-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Shield size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Security</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Files are encrypted with AES-256 in transit and at rest. Only your authenticated session can access download links.
                        </p>
                    </div>
                </div>

                {/* File Browser */}
                <div className="col-span-3 space-y-4">
                    {filtered.length === 0 ? (
                        <div className="p-12 rounded-2xl border border-white/5 text-center">
                            <Cloud size={32} className="text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-500 text-sm">No files in RestoreIt Cloud yet.</p>
                            <p className="text-zinc-600 text-xs mt-1">Complete a restoration to see your files here.</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
                            <div className="grid grid-cols-12 px-5 py-3 border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                                <div className="col-span-6">Name</div>
                                <div className="col-span-2">Size</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-2 text-right">Action</div>
                            </div>

                            <div className="divide-y divide-white/5">
                                {filtered.map((file) => (
                                    <div key={file.id} className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-white/[0.01] transition-all group">
                                        <div className="col-span-6 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getFileIconStyle(file.fileType)}`}>
                                                {getFileIcon(file.fileType)}
                                            </div>
                                            <div>
                                                <div className="text-white text-sm font-medium truncate max-w-[200px]">{file.fileName}</div>
                                                <div className="text-zinc-600 text-[10px]">{file.fileType}</div>
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-zinc-400 text-xs">{file.sizeDisplay}</div>
                                        <div className="col-span-2 text-zinc-500 text-xs">{file.date}</div>
                                        <div className="col-span-2 flex justify-end gap-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDownload(file.id)}
                                                disabled={downloading === file.id}
                                                className="p-1.5 rounded-lg border border-white/10 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-12 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 mb-4">
                            <Cloud size={32} />
                        </div>
                        <h3 className="text-white font-medium mb-1">RestoreIt Cloud is active</h3>
                        <p className="text-zinc-500 text-sm max-w-sm">Restored files are automatically encrypted and stored in your private cloud space.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
