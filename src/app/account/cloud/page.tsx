"use client";
// /account/cloud — restoreit Cloud file browser
import { useState, useEffect } from 'react';
import { Cloud, Search, Filter, Download, Image, Film, FileText, Shield, Loader2 } from 'lucide-react';

interface CloudFile {
    id: string;
    fileName: string;
    fileType: string;
    sizeBytes: number;
    scanId: string | null;
    expiresAt: string | null;
    createdAt: string;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CloudPage() {
    const [files, setFiles] = useState<CloudFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/cloud/files')
            .then(res => res.json() as Promise<{ success: boolean; data?: CloudFile[] }>)
            .then(data => {
                if (data.success && data.data) setFiles(data.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = files.filter(f =>
        f.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);
    const usagePct = Math.min(100, Math.round((totalBytes / (100 * 1024 * 1024 * 1024)) * 100));

    const handleDownload = async (fileId: string) => {
        setDownloading(fileId);
        try {
            const res = await fetch(`/api/cloud/download-url/${fileId}`);
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
        return 'bg-[var(--color-card-hover)] border-[var(--color-border)] text-[var(--color-text-tertiary)]';
    };

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-xl font-semibold mb-1">restoreit Cloud</h1>
                    <p className="text-sm text-[var(--color-text-tertiary)]">Secure cloud storage for your restored files.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2 text-xs text-[var(--color-foreground)] placeholder-[var(--color-placeholder)] focus:outline-none focus:border-[var(--color-accent)]/50 transition-all w-64"
                        />
                    </div>
                    <button className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-card-hover)] text-[var(--color-text-secondary)] transition-all">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-12 rounded-2xl border border-[var(--color-border-subtle)] text-center">
                    <Loader2 size={32} className="text-[var(--color-text-dim)] mx-auto mb-3 animate-spin" />
                    <p className="text-[var(--color-text-tertiary)] text-sm">Loading your files...</p>
                </div>
            ) : (
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
                                    <span className="text-[var(--color-text-secondary)]">{formatBytes(totalBytes)} of 100 GB</span>
                                    <span className="font-mono">{usagePct}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-[var(--color-card)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--color-accent)] rounded-full shadow-[0_0_8px_rgba(138,43,226,0.5)]" style={{ width: `${usagePct}%` }} />
                                </div>
                            </div>
                            <div className="pt-2 border-t border-[var(--color-accent)]/10 space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[var(--color-text-tertiary)]">Files</span>
                                    <span className="font-medium">{files.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-[var(--color-text-tertiary)]">Encryption</span>
                                    <span className="font-medium">AES-256</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] space-y-4">
                            <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                                <Shield size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Security</span>
                            </div>
                            <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
                                Files are encrypted with AES-256 in transit and at rest. Only your authenticated session can access download links.
                            </p>
                        </div>
                    </div>

                    {/* File Browser */}
                    <div className="col-span-3 space-y-4">
                        {filtered.length === 0 ? (
                            <div className="p-12 rounded-2xl border border-[var(--color-border-subtle)] text-center">
                                <Cloud size={32} className="text-[var(--color-disabled-text)] mx-auto mb-3" />
                                <p className="text-[var(--color-text-tertiary)] text-sm">No files in restoreit Cloud yet.</p>
                                <p className="text-[var(--color-text-dim)] text-xs mt-1">Complete a restoration to see your files here.</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
                                <div className="grid grid-cols-12 px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-card)] text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-tertiary)]">
                                    <div className="col-span-6">Name</div>
                                    <div className="col-span-2">Size</div>
                                    <div className="col-span-2">Date</div>
                                    <div className="col-span-2 text-right">Action</div>
                                </div>

                                <div className="divide-y divide-[var(--color-border-subtle)]">
                                    {filtered.map((file) => (
                                        <div key={file.id} className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-[var(--color-card)] transition-all group">
                                            <div className="col-span-6 flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getFileIconStyle(file.fileType)}`}>
                                                    {getFileIcon(file.fileType)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium truncate max-w-[200px]">{file.fileName}</div>
                                                    <div className="text-[var(--color-text-dim)] text-[10px]">{file.fileType}</div>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-[var(--color-text-secondary)] text-xs">{formatBytes(file.sizeBytes)}</div>
                                            <div className="col-span-2 text-[var(--color-text-tertiary)] text-xs">{formatDate(file.createdAt)}</div>
                                            <div className="col-span-2 flex justify-end gap-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDownload(file.id)}
                                                    disabled={downloading === file.id}
                                                    className="p-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5 text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)] transition-all disabled:opacity-50"
                                                >
                                                    <Download size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-12 border border-dashed border-[var(--color-border-subtle)] rounded-3xl flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-[var(--color-card-hover)] flex items-center justify-center text-[var(--color-text-dim)] mb-4">
                                <Cloud size={32} />
                            </div>
                            <h3 className="font-medium mb-1">restoreit Cloud is active</h3>
                            <p className="text-[var(--color-text-tertiary)] text-sm max-w-sm">Restored files are automatically encrypted and stored in your private cloud space.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
