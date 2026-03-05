import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Guides and insights on file recovery, data protection, and cloud restoration from the restoreit team.',
    openGraph: {
        title: 'Blog — restoreit',
        description: 'Guides and insights on file recovery, data protection, and cloud restoration.',
    },
};

const posts = [
    {
        slug: 'recover-deleted-files-without-installing-software',
        title: 'How to Recover Deleted Files Without Installing Software',
        excerpt: 'Installing recovery software on the same drive you\'re trying to recover is the single biggest mistake people make. Here\'s what to do instead.',
        date: '2026-03-05',
        readTime: '5 min',
    },
    {
        slug: 'cloud-vs-traditional-data-recovery',
        title: 'Cloud Data Recovery vs. Traditional Recovery Software',
        excerpt: 'A side-by-side breakdown of cloud-based file recovery versus installed desktop tools — speed, safety, cost, and results.',
        date: '2026-03-04',
        readTime: '6 min',
    },
    {
        slug: 'accidentally-formatted-drive',
        title: 'What To Do When You Accidentally Format a Drive',
        excerpt: 'You formatted the wrong drive. Your files look gone. They\'re probably not. Here\'s exactly what to do in the first 60 seconds and after.',
        date: '2026-03-03',
        readTime: '4 min',
    },
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col transition-colors duration-300">
            <SiteHeader />

            <main className="flex-1 pt-28 pb-20">
                <section className="px-5 sm:px-6 md:px-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-16 space-y-4">
                            <div className="text-[var(--color-accent)] text-[10px] font-black uppercase tracking-[0.3em]">Blog</div>
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter">
                                File recovery, explained.
                            </h1>
                            <p className="text-[var(--color-text-tertiary)] text-lg max-w-xl leading-relaxed">
                                Guides and technical breakdowns from the restoreit team.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {posts.map((post) => (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className="group block p-6 sm:p-8 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-card)] hover:bg-[var(--color-card-hover)] hover:border-[var(--color-accent)]/30 transition-all"
                                >
                                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-dim)] mb-3">
                                        <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                                        <span>·</span>
                                        <span>{post.readTime} read</span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-[var(--color-text-tertiary)] text-sm leading-relaxed mb-4">
                                        {post.excerpt}
                                    </p>
                                    <div className="text-[var(--color-accent)] text-xs font-black uppercase tracking-[0.15em] flex items-center gap-1.5 group-hover:gap-3 transition-all">
                                        Read more <ArrowRight size={12} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
