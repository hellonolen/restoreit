// ExtractionBrowser: File Filter, Search, Selective Restore, Grid/List/Timeline, Proof of Life
"use client";

import { useState, useMemo } from 'react';
import { Lock, CheckCircle2, AlertTriangle, AlertCircle, Grid3X3, List, Clock, Search, Download, RotateCcw, Copy, Shield, FileText, Image as ImageIcon, Film, Archive, Cpu, ChevronRight, X, ArrowLeft, Activity } from 'lucide-react';
import NextImage from 'next/image';
import { FileCategory, ViewMode, ScanStats } from '../types';

interface FileItem {
    id: string;
    name: string;
    size: number;
    category: FileCategory;
    status: 'intact' | 'fragmented' | 'corrupted';
    isDuplicate?: boolean;
    integrity: number;
    modifiedAt: number;
    path: string;
    hash?: string;
    clusterOffset?: string;
}

interface ExtractionBrowserProps {
    totalFiles: number;
    files: { documents: number; media: number; archives: number; other: number };
    stats: ScanStats;
    onRestart: () => void;
    onCheckout: () => void;
    onBack?: () => void;
}

const MOCK_FILES: FileItem[] = [
    { id: '1', name: 'family_vacation_2023.jpg', size: 8_400_000, category: 'images', status: 'intact', integrity: 100, modifiedAt: 1706745600000, path: '/Users/admin/Pictures', hash: '8a2b...e2f9', clusterOffset: '0x004F3B' },
    { id: '2', name: 'tax_return_2024.pdf', size: 4_200_000, category: 'documents', status: 'intact', integrity: 98, modifiedAt: 1706832000000, path: '/Users/admin/Documents', hash: 'f9e2...8a2b', clusterOffset: '0x11A4C2' },
    { id: '3', name: 'birthday_party.mp4', size: 142_000_000, category: 'videos', status: 'fragmented', integrity: 72, modifiedAt: 1706918400000, path: '/Users/admin/Movies', hash: 'c6d1...f0a3', clusterOffset: '0x99B0F1' },
    { id: '4', name: 'project_backup.zip', size: 234_000_000, category: 'archives', status: 'intact', integrity: 95, modifiedAt: 1707004800000, path: '/Users/admin/Downloads', hash: 'e0f3...d9c1', clusterOffset: '0x77D2E9' },
    { id: '5', name: 'portrait_edit.psd', size: 560_000_000, category: 'images', status: 'intact', integrity: 100, modifiedAt: 1707091200000, path: '/Users/admin/Desktop', hash: 'b4a1...c0e9', clusterOffset: '0x33F8A2' },
    { id: '6', name: 'family_vacation_2023_copy.jpg', size: 8_400_000, category: 'images', status: 'intact', integrity: 100, isDuplicate: true, modifiedAt: 1706745600000, path: '/Users/admin/Pictures/Duplicates', hash: '8a2b...e2f9', clusterOffset: '0x88E1C4' },
    { id: '7', name: 'business_contract.docx', size: 890_000, category: 'documents', status: 'intact', integrity: 100, modifiedAt: 1707177600000, path: '/Users/admin/Documents', hash: '6d9f...a1b2', clusterOffset: '0x22C7D1' },
    { id: '8', name: 'raw_footage_001.mov', size: 2_100_000_000, category: 'videos', status: 'corrupted', integrity: 31, modifiedAt: 1707264000000, path: '/Volumes/External/Footage', hash: 'a1b2...6d9f', clusterOffset: '0xEE4B90' },
    { id: '9', name: 'dissertation_final.pdf', size: 15_000_000, category: 'documents', status: 'fragmented', integrity: 85, modifiedAt: 1707350400000, path: '/Users/admin/Documents/School', hash: 'd9c1...e0f3', clusterOffset: '0x55F1A8' },
    { id: '10', name: 'drone_photo_0012.dng', size: 24_000_000, category: 'images', status: 'intact', integrity: 97, modifiedAt: 1707436800000, path: '/Users/admin/Pictures/RAW', hash: 'f0a3...c6d1', clusterOffset: '0xAA7D2C' },
];

function formatBytes(b: number): string {
    if (b === 0) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
}

function IntegrityBadge({ score, status }: { score: number; status: FileItem['status'] }) {
    if (status === 'intact') return <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-semibold">Intact</span>;
    if (status === 'fragmented') return <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-semibold">{score}% Restored</span>;
    return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-semibold">Corrupted</span>;
}

function FileCategoryIcon({ cat, size = 14 }: { cat: FileCategory; size?: number }) {
    if (cat === 'images') return <ImageIcon size={size} />;
    if (cat === 'videos') return <Film size={size} />;
    if (cat === 'archives') return <Archive size={size} />;
    if (cat === 'documents') return <FileText size={size} />;
    return <Cpu size={size} />;
}

export default function ExtractionBrowser({ totalFiles, files, stats, onRestart, onCheckout, onBack }: ExtractionBrowserProps) {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<FileCategory>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);
    const [repairingFileId, setRepairingFileId] = useState<string | null>(null);

    const selectedFiles = useMemo(() => MOCK_FILES.filter(f => selectedIds.has(f.id)), [selectedIds]);
    const selectedSize = useMemo(() => selectedFiles.reduce((acc, f) => acc + f.size, 0), [selectedFiles]);

    const categories: { key: FileCategory; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: totalFiles },
        { key: 'images', label: 'Images', count: files.media },
        { key: 'documents', label: 'Documents', count: files.documents },
        { key: 'videos', label: 'Videos', count: Math.floor(files.other * 0.4) },
        { key: 'archives', label: 'Archives', count: files.archives },
    ];

    const filtered = useMemo(() => {
        return MOCK_FILES.filter(f => {
            const matchesSearch = search === '' || f.name.toLowerCase().includes(search.toLowerCase()) || f.path.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [search, categoryFilter]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectAll) { setSelectedIds(new Set()); } else { setSelectedIds(new Set(filtered.map(f => f.id))); }
        setSelectAll(prev => !prev);
    };

    const restoreRate = Math.round((MOCK_FILES.filter(f => f.status === 'intact').length / MOCK_FILES.length) * 100);

    if (isReviewing) {
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <button onClick={() => setIsReviewing(false)} className="group flex items-center gap-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-foreground)] transition-colors text-sm font-semibold">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Browser
                    </button>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-widest mb-1">Review</div>
                        <div className="text-xl font-semibold text-[var(--color-foreground)]">Restoration Summary</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-card-hover)] flex items-center justify-between">
                                <span className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">Selected Files ({selectedFiles.length})</span>
                                <span className="text-xs font-mono text-[var(--color-text-secondary)]">{formatBytes(selectedSize)} total</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto divide-y divide-[var(--color-border-subtle)]">
                                {selectedFiles.map(file => (
                                    <div key={file.id} className="px-6 py-4 flex items-center justify-between hover:bg-[var(--color-card-hover)] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--color-card-hover)] text-[var(--color-text-tertiary)] flex items-center justify-center"><FileCategoryIcon cat={file.category} /></div>
                                            <div>
                                                <div className="text-sm font-medium text-[var(--color-foreground)]">{file.name}</div>
                                                <div className="text-[10px] text-[var(--color-text-dim)] font-mono">{file.path}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-mono text-[var(--color-text-secondary)]">{formatBytes(file.size)}</div>
                                            <IntegrityBadge score={file.integrity} status={file.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center shrink-0"><Shield size={20} /></div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold mb-1 uppercase tracking-tight text-[var(--color-foreground)]">Safe Restoration</h4>
                                <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">Files are processed in the cloud. Your local disk stays in read-only mode throughout the process.</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background-elevated)] space-y-6 shadow-xl">
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm"><span className="text-[var(--color-text-tertiary)]">File Count</span><span className="font-mono text-[var(--color-foreground)]">{selectedFiles.length}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-[var(--color-text-tertiary)]">Total Weight</span><span className="font-mono text-[var(--color-foreground)]">{formatBytes(selectedSize)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-[var(--color-text-tertiary)]">restore</span><span className="text-[var(--color-accent)] font-bold uppercase tracking-widest text-[10px] flex items-center gap-1"><Cpu size={10} /> Restoration Tier</span></div>
                            </div>
                            <div className="pt-4 border-t border-[var(--color-border)]">
                                <div className="flex justify-between items-end mb-6"><span className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase">Total Access Fee</span><span className="text-sm font-bold text-[var(--color-text-secondary)]">See pricing</span></div>
                                <button onClick={onCheckout} className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[var(--color-accent)]/25 flex items-center justify-center gap-2 group">Restore Files <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></button>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] flex items-center gap-3"><Lock size={14} className="text-[var(--color-text-dim)]" /><span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-widest font-bold">Encrypted TLS 1.3 Baseline</span></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full space-y-6 relative">
            {repairingFileId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <div className="max-w-4xl w-full border shadow-2xl rounded-[32px] overflow-hidden bg-[var(--color-background)] border-[var(--color-border)]">
                        <div className="p-8 border-b flex items-center justify-between border-[var(--color-border-subtle)]">
                            <div>
                                <div className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-widest mb-1">File Repair</div>
                                <h3 className="text-2xl font-semibold text-[var(--color-foreground)]">Restoring: <span className="font-mono text-[var(--color-accent)]">{MOCK_FILES.find(f => f.id === repairingFileId)?.name}</span></h3>
                            </div>
                            <button onClick={() => setRepairingFileId(null)} className="p-3 hover:bg-[var(--color-accent)]/10 rounded-full transition-all text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]"><X size={24} /></button>
                        </div>
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <div className="aspect-square rounded-3xl flex items-center justify-center border relative group overflow-hidden bg-[var(--color-card)] border-[var(--color-border-subtle)]">
                                    <span className="absolute top-4 left-4 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 uppercase tracking-widest z-10">Initial Fragment</span>
                                    <div className="grid grid-cols-6 gap-2 w-3/4 h-3/4 opacity-20">{[...Array(36)].map((_, i) => (<div key={i} className={`bg-[var(--color-text-dim)] rounded-sm ${i % 4 === 0 ? 'opacity-0' : ''}`} />))}</div>
                                    <AlertCircle size={48} className="text-[var(--color-disabled-text)] absolute opacity-50" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent" />
                                </div>
                                <div><h4 className="text-sm font-bold text-[var(--color-text-tertiary)] uppercase mb-2">Damaged File</h4><p className="text-xs text-[var(--color-text-dim)] leading-relaxed">Detected 42 missing sections in the file. Parts of this file are fragmented and need repair.</p></div>
                            </div>
                            <div className="space-y-4">
                                <div className="aspect-square rounded-3xl flex items-center justify-center border relative overflow-hidden bg-[var(--color-accent)]/5 border-[var(--color-accent)]/30">
                                    <span className="absolute top-4 left-4 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 uppercase tracking-widest z-10">Repaired</span>
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/20 to-transparent animate-pulse" />
                                    <NextImage src="https://images.unsplash.com/photo-1506744626753-140081d4cb43?q=80&w=600&auto=format&fit=crop" width={400} height={400} alt="Repaired visual preview" className="w-full h-full object-cover opacity-90 scale-105" />
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                        <div className="flex items-center gap-3 text-white">
                                            <div className="w-16 h-16 rounded-[24px] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center agent-pulse"><Activity size={12} className="text-[var(--color-accent)]" /></div>
                                            <div><div className="text-[10px] font-bold uppercase tracking-widest text-green-400">Status: Restorable</div><div className="text-sm font-semibold">98.4% Integrity Restored</div></div>
                                        </div>
                                    </div>
                                </div>
                                <div><h4 className="text-sm font-bold text-[var(--color-text-tertiary)] uppercase mb-2">Repair Complete</h4><p className="text-xs text-[var(--color-text-dim)] leading-relaxed">Missing data has been reconstructed. This file is ready for download.</p></div>
                            </div>
                        </div>
                        <div className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[var(--color-card-hover)] border-t border-[var(--color-border-subtle)]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--color-card)] text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)] shadow-inner"><div className="w-6 h-6 rounded bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-sm" /></div></div>
                                <div className="max-w-md"><p className="text-xs font-medium text-[var(--color-text-secondary)] italic">&quot;I&apos;ve cross-referenced the file system journal and mapped the orphaned clusters back to this JPG header. The preview looks stable.&quot;</p></div>
                            </div>
                            <button onClick={() => setRepairingFileId(null)} className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[var(--color-accent)] text-white text-sm font-bold hover:bg-[var(--color-accent-hover)] transition-all shadow-lg shadow-[var(--color-accent)]/20 flex items-center justify-center gap-2 group">Apply Repair <Activity size={16} className="group-hover:animate-pulse" /></button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="animate-in slide-in-from-left-4 duration-500">
                    <div className="text-[var(--color-accent)] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 flex items-center gap-2"><span className="w-8 h-[1px] bg-[var(--color-accent)]"></span> Step 4/5 — Restored Files</div>
                    <div className="flex items-center gap-4 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]"><CheckCircle2 size={24} strokeWidth={2} /></div>
                        <h2 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">Scan Successful</h2>
                        {onBack && (<button onClick={onBack} className="ml-4 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-foreground)]">← Refine Target</button>)}
                    </div>
                    <p className="text-sm ml-14 text-[var(--color-text-secondary)]">Detected <strong className="text-[var(--color-foreground)]">{totalFiles.toLocaleString()} files</strong> matching restore patterns · {restoreRate}% intact</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-xs px-4 py-2.5 rounded-2xl border font-mono font-bold border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-card)]">{formatBytes(stats.dataRestorable)}</div>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(138,43,226,0.1)]"><Shield size={14} /> Restore Verified</div>
                </div>
            </div>
            <div className="bg-orange-500/[0.03] border-orange-500/20 border rounded-2xl p-5 flex items-start gap-4 relative overflow-hidden group">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-orange-500 opacity-40 group-hover:opacity-100 transition-opacity"></div>
                <AlertTriangle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                <div><h4 className="text-sm font-bold mb-1 text-[var(--color-foreground)]">Read-Only Barrier Active</h4><p className="text-xs leading-relaxed max-w-2xl text-[var(--color-text-secondary)]">RestoreIt has locked disk writes to &quot;Macintosh HD&quot; to prevent overwriting. To restore these files, proceed to the next step.</p></div>
            </div>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 w-full min-w-0 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex p-1 rounded-2xl border shrink-0 bg-[var(--color-card)] border-[var(--color-border)]">
                            {categories.map(({ key, label, count }) => (<button key={key} onClick={() => setCategoryFilter(key)} className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${categoryFilter === key ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/30' : 'text-[var(--color-text-dim)] hover:text-[var(--color-foreground)]'}`}>{label} <span className="opacity-40 ml-1.5 font-mono">{count}</span></button>))}
                        </div>
                        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all bg-[var(--color-card)] border-[var(--color-border)] focus-within:border-[var(--color-accent)]/50">
                            <Search size={16} className="text-[var(--color-text-dim)] shrink-0" />
                            <input type="text" placeholder="Lookup by filename, extension, or original volume path..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm outline-none flex-1 placeholder-[var(--color-placeholder)] font-medium" />
                        </div>
                        <div className="flex p-1 rounded-2xl border bg-[var(--color-card)] border-[var(--color-border)]">
                            {([['list', List], ['grid', Grid3X3], ['timeline', Clock]] as const).map(([mode, Icon]) => (<button key={mode} onClick={() => setViewMode(mode as ViewMode)} className={`p-2.5 rounded-xl transition-all ${viewMode === mode ? 'bg-[var(--color-accent)] text-white shadow-md' : 'text-[var(--color-text-dim)] hover:text-[var(--color-foreground)]'}`}><Icon size={16} /></button>))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <label className="group flex items-center gap-3 text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest cursor-pointer hover:text-[var(--color-accent)] transition-colors">
                            <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="w-5 h-5 rounded-lg border-[var(--color-border)] accent-[var(--color-accent)] cursor-pointer" />Select All ({filtered.length})
                        </label>
                        {selectedIds.size > 0 && (<div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" /><span className="text-xs text-[var(--color-accent)] font-black uppercase tracking-tighter">{selectedIds.size} files queued</span></div>)}
                    </div>
                    <div className="rounded-[24px] border overflow-hidden transition-all border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl">
                        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                            {filtered.length === 0 ? (
                                <div className="p-20 text-center space-y-4"><div className="w-16 h-16 rounded-full bg-[var(--color-background)] border border-[var(--color-border-subtle)] flex items-center justify-center mx-auto text-[var(--color-disabled-text)]"><Search size={32} /></div><p className="text-sm text-[var(--color-text-tertiary)] font-medium">Empty results for your current filter query.</p></div>
                            ) : filtered.map((file, i) => (
                                <div key={file.id} onClick={() => toggleSelect(file.id)} className={`flex items-center gap-5 p-5 transition-all cursor-pointer group hover:bg-[var(--color-accent)]/[0.02] ${selectedIds.has(file.id) ? 'bg-[var(--color-accent)]/[0.04]' : ''} ${i > 0 ? 'border-t border-[var(--color-border-subtle)]' : ''}`}>
                                    <input type="checkbox" checked={selectedIds.has(file.id)} onChange={() => toggleSelect(file.id)} className="w-5 h-5 rounded-lg accent-[var(--color-accent)] shrink-0 cursor-pointer" onClick={e => e.stopPropagation()} />
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 bg-[var(--color-card-hover)] text-[var(--color-text-tertiary)] shadow-inner"><FileCategoryIcon cat={file.category} size={20} /></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-sm font-bold tracking-tight text-[var(--color-text-secondary)]">{file.name}</span>
                                            <IntegrityBadge score={file.integrity} status={file.status} />
                                            {file.isDuplicate && (<span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--color-text-tertiary)]/10 border border-[var(--color-text-tertiary)]/20 text-[var(--color-text-tertiary)] font-black uppercase tracking-widest flex items-center gap-1.5"><Copy size={9} /> Clone</span>)}
                                            {(file.status === 'corrupted' || file.status === 'fragmented') && (<button onClick={(e) => { e.stopPropagation(); setRepairingFileId(file.id); }} className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] font-black uppercase tracking-widest hover:bg-[var(--color-accent)]/20 transition-all flex items-center gap-1.5 group/btn shadow-lg shadow-[var(--color-accent)]/5 agent-pulse"><Cpu size={9} className="animate-pulse" /> File Repair</button>)}
                                        </div>
                                        <div className="text-[11px] font-medium flex items-center gap-3 overflow-hidden text-[var(--color-text-dim)]">
                                            <span className="truncate max-w-[150px] font-mono">{file.path}</span><span className="w-1 h-1 rounded-full bg-[var(--color-disabled-text)]" /><span className="shrink-0">{formatBytes(file.size)}</span><span className="w-1 h-1 rounded-full bg-[var(--color-disabled-text)]" /><span className="shrink-0 font-mono text-[9px] text-[var(--color-accent)] opacity-60">SHA-256: {file.hash}</span><span className="w-1 h-1 rounded-full bg-[var(--color-disabled-text)]" /><span className="shrink-0 font-mono text-[9px]">{file.clusterOffset}</span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity"><Download size={16} className="text-[var(--color-disabled-text)]" /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className="rounded-[32px] border overflow-hidden shadow-2xl border-[var(--color-accent)]/30 bg-[var(--color-background)]">
                        <div className="px-6 py-4 border-b border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-accent)]">Proof of Life</span><div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /><span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Active</span></div></div>
                        <div className="p-5">
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                {['https://images.unsplash.com/photo-1506744626753-140081d4cb43?q=80&w=200&auto=format&fit=crop','https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=200&auto=format&fit=crop','https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=200&auto=format&fit=crop','https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=200&auto=format&fit=crop'].map((src, i) => (<div key={i} className="aspect-square relative rounded-2xl overflow-hidden group/thumb"><NextImage src={src} width={200} height={200} alt="Restored thumbnail" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" /><div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-all group-hover:opacity-0"><Lock size={20} className="text-white/20" /></div></div>))}
                            </div>
                            <p className="text-center"><span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-dim)]">+ {(totalFiles - 4).toLocaleString()} files encrypted</span></p>
                        </div>
                        <div className="p-6 border-t border-[var(--color-border-subtle)] bg-[var(--color-card)] space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1"><div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">Est. Retrieval</div><div className="text-xl font-bold text-[var(--color-foreground)]">{selectedIds.size > 0 ? formatBytes(MOCK_FILES.filter(f => selectedIds.has(f.id)).reduce((a, b) => a + b.size, 0)) : formatBytes(stats.dataRestorable)}</div></div>
                                <div className="h-10 w-[1px] bg-[var(--color-border)]" />
                                <div className="space-y-1 text-right"><div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">Selection</div><div className="text-xl font-bold text-[var(--color-accent)]">{selectedIds.size > 0 ? selectedIds.size : totalFiles}</div></div>
                            </div>
                            <button onClick={() => setIsReviewing(true)} className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-4 rounded-2xl text-sm font-black uppercase tracking-[0.1em] transition-all shadow-xl shadow-[var(--color-accent)]/30 flex items-center justify-center gap-3 active:scale-95 group"><Lock size={16} className="group-hover:rotate-12 transition-transform" />{selectedIds.size > 0 ? 'Review Selected' : 'Restore All'}</button>
                            <div className="space-y-3"><button onClick={onRestart} className="w-full text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 text-[var(--color-disabled-text)] hover:text-red-400"><RotateCcw size={12} /> Start Over</button></div>
                        </div>
                    </div>
                    <div className="p-6 rounded-[32px] border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-tertiary)] space-y-4">
                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-[var(--color-card-hover)] flex items-center justify-center text-[var(--color-accent)]"><Shield size={16} /></div><span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Scan-First Model</span></div>
                        <p className="text-[11px] leading-relaxed italic">&quot;You see results before you pay. If no files are detected, you&apos;re not charged. All completed purchases are final.&quot;</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
