// AGENT 4 — ExtractionBrowser: File Filter, Search, Selective Restore, Grid/List/Timeline, Proof of Life
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
    darkMode: boolean;
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

export default function ExtractionBrowser({ totalFiles, files, stats, onRestart, onCheckout, darkMode, onBack }: ExtractionBrowserProps) {
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
        if (selectAll) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(f => f.id)));
        }
        setSelectAll(prev => !prev);
    };

    const restoreRate = Math.round((MOCK_FILES.filter(f => f.status === 'intact').length / MOCK_FILES.length) * 100);

    if (isReviewing) {
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <button onClick={() => setIsReviewing(false)} className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-semibold">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Browser
                    </button>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-[#8A2BE2] uppercase tracking-widest mb-1">Final Manifest</div>
                        <div className="text-xl font-semibold text-white">Review & Confirm Extraction</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className={`rounded-2xl border ${darkMode ? 'border-white/10 bg-black/40' : 'border-black/5 bg-zinc-50/50'} overflow-hidden`}>
                            <div className={`px-6 py-4 border-b ${darkMode ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'} flex items-center justify-between`}>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Selected Files ({selectedFiles.length})</span>
                                <span className="text-xs font-mono text-zinc-400">{formatBytes(selectedSize)} total</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
                                {selectedFiles.map(file => (
                                    <div key={file.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg ${darkMode ? 'bg-white/5 text-zinc-500' : 'bg-black/5 text-zinc-400'} flex items-center justify-center`}>
                                                <FileCategoryIcon cat={file.category} />
                                            </div>
                                            <div>
                                                <div className={`text-sm font-medium ${darkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>{file.name}</div>
                                                <div className="text-[10px] text-zinc-600 font-mono">{file.path}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xs font-mono ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{formatBytes(file.size)}</div>
                                            <IntegrityBadge score={file.integrity} status={file.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl border ${darkMode ? 'border-[#8A2BE2]/20 bg-[#8A2BE2]/5' : 'border-[#8A2BE2]/10 bg-[#8A2BE2]/5'} flex items-start gap-4`}>
                            <div className="w-10 h-10 rounded-xl bg-[#8A2BE2]/20 text-[#8A2BE2] flex items-center justify-center shrink-0">
                                <Shield size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-bold mb-1 uppercase tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Zero-Install Extraction Protocol</h4>
                                <p className={`text-xs leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    These files will be extracted from the cloud stream directly. Your local disk remains in read-only mode, guaranteeing no data overwrites during the final restore phase.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className={`p-6 rounded-2xl border ${darkMode ? 'border-white/10 bg-black/40' : 'border-black/10 bg-white'} space-y-6 shadow-xl`}>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">File Count</span>
                                    <span className={`font-mono ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{selectedFiles.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Total Weight</span>
                                    <span className={`font-mono ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{formatBytes(selectedSize)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">restore</span>
                                    <span className="text-[#8A2BE2] font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
                                        <Cpu size={10} /> Forensic Tier
                                    </span>
                                </div>
                            </div>

                            <div className={`pt-4 border-t ${darkMode ? 'border-white/10' : 'border-black/5'}`}>
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-xs font-bold text-zinc-500 uppercase">Total Access Fee</span>
                                    <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>$89.00</span>
                                </div>
                                <button onClick={onCheckout} className="w-full bg-[#8A2BE2] hover:bg-[#7e22ce] text-white py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#8A2BE2]/25 flex items-center justify-center gap-2 group">
                                    Complete Extraction <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
                            <Lock size={14} className="text-zinc-600" />
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Encrypted TLS 1.3 Baseline</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full space-y-6 relative">

            {/* Advanced Repair Workspace Modal */}
            {repairingFileId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <div className={`max-w-4xl w-full border shadow-2xl rounded-[32px] overflow-hidden ${darkMode ? 'bg-[#0D0D0F] border-white/10' : 'bg-white border-black/10'}`}>
                        <div className={`p-8 border-b flex items-center justify-between ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
                            <div>
                                <div className="text-[10px] font-bold text-[#8A2BE2] uppercase tracking-widest mb-1">Advanced Forensic Repair</div>
                                <h3 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                                    Restoring: <span className="font-mono text-[#8A2BE2]">{MOCK_FILES.find(f => f.id === repairingFileId)?.name}</span>
                                </h3>
                            </div>
                            <button onClick={() => setRepairingFileId(null)} className="p-3 hover:bg-[#8A2BE2]/10 rounded-full transition-all text-zinc-500 hover:text-[#8A2BE2]">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <div className={`aspect-square rounded-3xl flex items-center justify-center border relative group overflow-hidden ${darkMode ? 'bg-black/40 border-white/5' : 'bg-zinc-100 border-black/5'}`}>
                                    <span className="absolute top-4 left-4 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 uppercase tracking-widest z-10">Initial Fragment</span>
                                    <div className="grid grid-cols-6 gap-2 w-3/4 h-3/4 opacity-20">
                                        {[...Array(36)].map((_, i) => (
                                            <div key={i} className={`bg-zinc-600 rounded-sm ${i % 4 === 0 ? 'opacity-0' : ''}`} />
                                        ))}
                                    </div>
                                    <AlertCircle size={48} className="text-zinc-800 absolute opacity-50" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-500 uppercase mb-2">Entropy Discontinuity</h4>
                                    <p className="text-xs text-zinc-600 leading-relaxed">Detected 42 missing sectors in the file header. Bitwise pattern matching suggests significant fragmentation.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className={`aspect-square rounded-3xl flex items-center justify-center border relative overflow-hidden ${darkMode ? 'bg-[#8A2BE2]/5 border-[#8A2BE2]/30' : 'bg-[#8A2BE2]/5 border-[#8A2BE2]/20'}`}>
                                    <span className="absolute top-4 left-4 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 uppercase tracking-widest z-10">restoreit restore</span>
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#8A2BE2]/20 to-transparent animate-pulse" />
                                    <NextImage
                                        src="https://images.unsplash.com/photo-1506744626753-140081d4cb43?q=80&w=600&auto=format&fit=crop"
                                        width={400}
                                        height={400}
                                        alt="Repaired visual preview"
                                        className="w-full h-full object-cover opacity-90 scale-105"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                        <div className="flex items-center gap-3 text-white">
                                            <div className="w-16 h-16 rounded-[24px] bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 flex items-center justify-center agent-pulse">
                                                <Activity size={12} className="text-[#8A2BE2]" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-green-400">Status: Restorable</div>
                                                <div className="text-sm font-semibold">98.4% Integrity Restored</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-500 uppercase mb-2">Forensic Intelligence</h4>
                                    <p className="text-xs text-zinc-600 leading-relaxed">Agent has successfully interpolated missing header data. File is ready for high-fidelity extraction.</p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-8 flex flex-col sm:flex-row items-center justify-between gap-6 ${darkMode ? 'bg-white/[0.02] border-t border-white/5' : 'bg-black/[0.02] border-t border-black/5'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-black/40 text-zinc-500' : 'bg-white text-zinc-400'} border border-white/5 shadow-inner`}>
                                    <div className="w-6 h-6 rounded bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-[#8A2BE2] rounded-sm" />
                                    </div>
                                </div>
                                <div className="max-w-md">
                                    <p className="text-xs font-medium text-zinc-400 italic">&quot;I&apos;ve cross-referenced the file system journal and mapped the orphaned clusters back to this JPG header. The preview looks stable.&quot;</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setRepairingFileId(null)}
                                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#8A2BE2] text-white text-sm font-bold hover:bg-[#7e22ce] transition-all shadow-lg shadow-[#8A2BE2]/20 flex items-center justify-center gap-2 group"
                            >
                                Apply Repair <Activity size={16} className="group-hover:animate-pulse" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Browser Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="animate-in slide-in-from-left-4 duration-500">
                    <div className="text-[#8A2BE2] text-[10px] font-bold tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-[#8A2BE2]"></span> Step 5/5 — Forensic Browser
                    </div>
                    <div className="flex items-center gap-4 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                            <CheckCircle2 size={24} strokeWidth={2} />
                        </div>
                        <h2 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Scan Successful</h2>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className={`ml-4 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${darkMode ? 'border-white/10 text-zinc-500 hover:text-white' : 'border-black/5 text-zinc-400 hover:text-zinc-900'
                                    }`}
                            >
                                ← Refine Target
                            </button>
                        )}
                    </div>
                    <p className={`text-sm ml-14 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Detected <strong className={darkMode ? 'text-zinc-200' : 'text-zinc-900'}>{totalFiles.toLocaleString()} files</strong> matching restore patterns · {restoreRate}% restored
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`text-xs px-4 py-2.5 rounded-2xl border font-mono font-bold ${darkMode ? 'border-white/10 text-zinc-400 bg-black/40' : 'border-black/5 text-zinc-600 bg-zinc-50'}`}>
                        {formatBytes(stats.dataRestorable)}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#8A2BE2]/30 bg-[#8A2BE2]/10 text-[#8A2BE2] text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(138,43,226,0.1)]">
                        <Shield size={14} /> Restore Verified
                    </div>
                </div>
            </div>

            {/* Warning Alert */}
            <div className={`${darkMode ? 'bg-orange-500/[0.03] border-orange-500/20' : 'bg-orange-50 border-orange-200'} border rounded-2xl p-5 flex items-start gap-4 relative overflow-hidden group`}>
                <div className="absolute inset-y-0 left-0 w-1.5 bg-orange-500 opacity-40 group-hover:opacity-100 transition-opacity"></div>
                <AlertTriangle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-orange-100' : 'text-orange-900'}`}>Read-Only Barrier Active</h4>
                    <p className={`text-xs leading-relaxed max-w-2xl ${darkMode ? 'text-orange-100/60' : 'text-orange-800/70'}`}>
                        restoreit has locked disk writes to &quot;Macintosh HD&quot; to prevent sector overwriting. To restore these files, you must proceed to the forensic extraction gate.
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Left: File Browser */}
                <div className="flex-1 w-full min-w-0 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className={`flex p-1 rounded-2xl border shrink-0 ${darkMode ? 'bg-black/40 border-white/10' : 'bg-zinc-50 border-black/5'}`}>
                            {categories.map(({ key, label, count }) => (
                                <button key={key} onClick={() => setCategoryFilter(key)}
                                    className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${categoryFilter === key
                                        ? 'bg-[#8A2BE2] text-white shadow-lg shadow-[#8A2BE2]/30'
                                        : darkMode ? 'text-zinc-600 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'
                                        }`}>
                                    {label} <span className="opacity-40 ml-1.5 font-mono">{count}</span>
                                </button>
                            ))}
                        </div>

                        <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${darkMode ? 'bg-black/40 border-white/10 focus-within:border-[#8A2BE2]/50' : 'bg-white border-black/10 focus-within:border-[#8A2BE2]/50'}`}>
                            <Search size={16} className="text-zinc-600 shrink-0" />
                            <input
                                type="text"
                                placeholder="Lookup by filename, extension, or original volume path..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-transparent text-sm outline-none flex-1 placeholder-zinc-700 font-medium"
                            />
                        </div>

                        <div className={`flex p-1 rounded-2xl border ${darkMode ? 'bg-black/40 border-white/10' : 'bg-zinc-50 border-black/10'}`}>
                            {([['list', List], ['grid', Grid3X3], ['timeline', Clock]] as const).map(([mode, Icon]) => (
                                <button key={mode} onClick={() => setViewMode(mode as ViewMode)}
                                    className={`p-2.5 rounded-xl transition-all ${viewMode === mode ? 'bg-[#8A2BE2] text-white shadow-md' : darkMode ? 'text-zinc-600 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}>
                                    <Icon size={16} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <label className="group flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-[#8A2BE2] transition-colors">
                            <input type="checkbox" checked={selectAll} onChange={toggleSelectAll}
                                className="w-5 h-5 rounded-lg border-white/10 accent-[#8A2BE2] cursor-pointer" />
                            Manifest Snapshot ({filtered.length})
                        </label>
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8A2BE2] animate-pulse" />
                                <span className="text-xs text-[#8A2BE2] font-black uppercase tracking-tighter">{selectedIds.size} files queued</span>
                            </div>
                        )}
                    </div>

                    <div className={`rounded-[24px] border overflow-hidden transition-all ${darkMode ? 'border-white/10 bg-black/20 shadow-2xl' : 'border-black/5 bg-white shadow-sm'}`}>
                        <div className={`max-h-[600px] overflow-y-auto custom-scrollbar`}>
                            {filtered.length === 0 ? (
                                <div className="p-20 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto text-zinc-700">
                                        <Search size={32} />
                                    </div>
                                    <p className="text-sm text-zinc-500 font-medium">Empty results for your current filter query.</p>
                                </div>
                            ) : filtered.map((file, i) => (
                                <div key={file.id}
                                    onClick={() => toggleSelect(file.id)}
                                    className={`flex items-center gap-5 p-5 transition-all cursor-pointer group hover:bg-[#8A2BE2]/[0.02]
                    ${selectedIds.has(file.id) ? darkMode ? 'bg-[#8A2BE2]/[0.04]' : 'bg-[#8A2BE2]/[0.03]' : ''}
                    ${i > 0 ? darkMode ? 'border-t border-white/5' : 'border-t border-black/5' : ''}
                  `}
                                >
                                    <input type="checkbox" checked={selectedIds.has(file.id)} onChange={() => toggleSelect(file.id)}
                                        className="w-5 h-5 rounded-lg accent-[#8A2BE2] shrink-0 cursor-pointer" onClick={e => e.stopPropagation()} />

                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${darkMode ? 'bg-white/5 text-zinc-500 shadow-inner' : 'bg-black/5 text-zinc-400'}`}>
                                        <FileCategoryIcon cat={file.category} size={20} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className={`text-sm font-bold tracking-tight ${darkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{file.name}</span>
                                            <IntegrityBadge score={file.integrity} status={file.status} />
                                            {file.isDuplicate && (
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                                                    <Copy size={9} /> Clone
                                                </span>
                                            )}
                                            {(file.status === 'corrupted' || file.status === 'fragmented') && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setRepairingFileId(file.id); }}
                                                    className="text-[9px] px-2 py-0.5 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 text-[#8A2BE2] font-black uppercase tracking-widest hover:bg-[#8A2BE2]/20 transition-all flex items-center gap-1.5 group/btn shadow-lg shadow-[#8A2BE2]/5 agent-pulse"
                                                >
                                                    <Cpu size={9} className="animate-pulse" /> restoreit Repair Mode
                                                </button>
                                            )}
                                        </div>
                                        <div className={`text-[11px] font-medium flex items-center gap-3 overflow-hidden ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                            <span className="truncate max-w-[150px] font-mono">{file.path}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                            <span className="shrink-0">{formatBytes(file.size)}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                            <span className="shrink-0 font-mono text-[9px] text-[#8A2BE2] opacity-60">SHA-256: {file.hash}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                            <span className="shrink-0 font-mono text-[9px]">{file.clusterOffset}</span>
                                        </div>
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Download size={16} className="text-zinc-700" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Insights + Summary */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className={`rounded-[32px] border overflow-hidden shadow-2xl ${darkMode ? 'border-[#8A2BE2]/30 bg-black' : 'border-black/5 bg-white'}`}>
                        <div className="px-6 py-4 border-b border-[#8A2BE2]/20 bg-[#8A2BE2]/5 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A2BE2]">Proof of Life</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                {[
                                    'https://images.unsplash.com/photo-1506744626753-140081d4cb43?q=80&w=200&auto=format&fit=crop',
                                    'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=200&auto=format&fit=crop',
                                    'https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=200&auto=format&fit=crop',
                                    'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=200&auto=format&fit=crop',
                                ].map((src, i) => (
                                    <div key={i} className="aspect-square relative rounded-2xl overflow-hidden group/thumb">
                                        <NextImage src={src} width={200} height={200} alt="Restored thumbnail" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-all group-hover:opacity-0">
                                            <Lock size={20} className="text-white/20" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-center">
                                <span className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                    + {(totalFiles - 4).toLocaleString()} files encrypted
                                </span>
                            </p>
                        </div>

                        <div className={`p-6 border-t ${darkMode ? 'border-white/5 bg-white/[0.01]' : 'border-black/5 bg-black/[0.01]'} space-y-6`}>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Est. Retrieval</div>
                                    <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{selectedIds.size > 0 ? formatBytes(MOCK_FILES.filter(f => selectedIds.has(f.id)).reduce((a, b) => a + b.size, 0)) : formatBytes(stats.dataRestorable)}</div>
                                </div>
                                <div className="h-10 w-[1px] bg-white/10" />
                                <div className="space-y-1 text-right">
                                    <div className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Selection</div>
                                    <div className={`text-xl font-bold ${darkMode ? 'text-[#8A2BE2]' : 'text-[#8A2BE2]'}`}>{selectedIds.size > 0 ? selectedIds.size : totalFiles}</div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsReviewing(true)}
                                className="w-full bg-[#8A2BE2] hover:bg-[#7e22ce] text-white py-4 rounded-2xl text-sm font-black uppercase tracking-[0.1em] transition-all shadow-xl shadow-[#8A2BE2]/30 flex items-center justify-center gap-3 active:scale-95 group"
                            >
                                <Lock size={16} className="group-hover:rotate-12 transition-transform" />
                                {selectedIds.size > 0 ? 'Review Selected' : 'Extract All'}
                            </button>

                            <div className="space-y-3">
                                <button onClick={onRestart} className={`w-full text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${darkMode ? 'text-zinc-700 hover:text-red-400' : 'text-zinc-400 hover:text-red-500'}`}>
                                    <RotateCcw size={12} /> Purge Scan & Restart
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-[32px] border ${darkMode ? 'border-white/10 bg-black/20 text-zinc-500' : 'border-black/5 bg-zinc-50 text-zinc-500'} space-y-4`}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#8A2BE2]">
                                <Shield size={16} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-zinc-400' : 'text-zinc-700'}`}>Client Integrity Lock</span>
                        </div>
                        <p className="text-[11px] leading-relaxed italic">
                            &quot;We guarantee the absolute structural integrity of the detected file headers. If your files cannot be restored in our forensic cloud, a full credit will be issued.&quot;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
