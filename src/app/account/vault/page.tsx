"use client";
// /account/vault — Cloud Vault browser
import { useState } from 'react';
import { Cloud, Search, Filter, Download, File, Image, Film, FileText, ChevronRight, Clock, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const mockVaultFiles = [
    { name: 'Wedding_001.jpg', type: 'image', size: '12.4 MB', date: 'Jun 12, 2025', session: 'SESS-001' },
    { name: 'Wedding_002.jpg', type: 'image', size: '11.8 MB', date: 'Jun 12, 2025', session: 'SESS-001' },
    { name: 'Ceremony_Video.mov', type: 'video', size: '1.2 GB', date: 'Jun 12, 2025', session: 'SESS-001' },
    { name: 'Tax_Returns_2024.pdf', type: 'document', size: '2.4 MB', date: 'Apr 15, 2025', session: 'SESS-002' },
    { name: 'Contract_Draft.docx', type: 'document', size: '450 KB', date: 'Feb 3, 2026', session: 'SESS-002' },
];

export default function VaultPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-8 max-w-5xl">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white mb-1">Cloud Vault</h1>
                    <p className="text-sm text-zinc-500">Secure cloud-side storage for your recovered data.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1 / 2 -translate-y-1 / 2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search vault..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#8A2BE2]/50 transition-all w-64"
                        />
                    </div>
                    <button className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 transition-all">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {/* Vault Stats */}
                <div className="col-span-1 space-y-4">
                    <div className="p-5 rounded-2xl border border-[#8A2BE2]/20 bg-[#8A2BE2]/5 space-y-4">
                        <div className="flex items-center gap-2 text-[#8A2BE2]">
                            <Cloud size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Storage Usage</span>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-zinc-400">14.2 GB of 100 GB</span>
                                <span className="text-white font-mono">14%</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                <div className="w-[14%] h-full bg-[#8A2BE2] rounded-full shadow-[0_0_8px_rgba(138,43,226,0.5)]" />
                            </div>
                        </div>
                        <div className="pt-2 border-t border-[#8A2BE2]/10 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-zinc-500">Retention Plan</span>
                                <span className="text-white font-medium">Monthly Protection</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-zinc-500">Auto-Expiry</span>
                                <span className="text-white font-medium">90 Days</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/10 bg-black/20 space-y-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Shield size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Vault Security</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                            "Data is stored with AES-256 cloud-side encryption. Only your authenticated session can generate retrieval keys."
                        </p>
                        <button className="w-full py-2 rounded-xl border border-white/10 text-xs font-semibold text-white hover:bg-white/5 transition-all">Manage Keys</button>
                    </div>
                </div>

                {/* File Browser */}
                <div className="col-span-3 space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
                        <div className="grid grid-cols-12 px-5 py-3 border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                            <div className="col-span-6">Name</div>
                            <div className="col-span-2">Size</div>
                            <div className="col-span-2">Session</div>
                            <div className="col-span-2 text-right">Action</div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {mockVaultFiles.map((file, i) => (
                                <div key={i} className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-white/[0.01] transition-all group">
                                    <div className="col-span-6 flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${file.type === 'image' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                file.type === 'video' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                                    'bg-zinc-800 border-zinc-700 text-zinc-500'
                                            }`}>
                                            {file.type === 'image' ? <Image size={14} /> : file.type === 'video' ? <Film size={14} /> : <FileText size={14} />}
                                        </div>
                                        <div>
                                            <div className="text-white text-sm font-medium truncate max-w-[200px]">{file.name}</div>
                                            <div className="text-zinc-600 text-[10px]">{file.date}</div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-zinc-400 text-xs">{file.size}</div>
                                    <div className="col-span-2 text-zinc-500 text-xs">{file.session}</div>
                                    <div className="col-span-2 flex justify-end gap-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 rounded-lg border border-white/10 hover:border-[#8A2BE2]/40 hover:bg-[#8A2BE2]/5 text-zinc-400 hover:text-white transition-all">
                                            <Download size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                        <div className="flex items-center gap-3">
                            <Clock size={16} className="text-yellow-500/60" />
                            <span className="text-xs text-zinc-400">Vault files from <span className="text-zinc-300 font-medium">SESS-001</span> will begin expiration in 14 days.</span>
                        </div>
                        <Link href="/account/protection" className="text-[10px] font-bold text-yellow-500/80 hover:text-yellow-500 uppercase tracking-widest">Extend Now →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
