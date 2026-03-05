"use client";

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import DriveSelector from '@/components/DriveSelector';
import Scanner from '@/components/Scanner';
import ExtractionBrowser from '@/components/ExtractionBrowser';
import CheckoutModal from '@/components/CheckoutModal';
import ProUpsell from '@/components/ProUpsell';
import OnboardingOverlay from '@/components/OnboardingOverlay';
import { Notifications } from '@/components/Notifications';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import { AgentChat } from '@/components/AgentChat';
import { ScanHistory } from '@/components/ScanHistory';
import DiagnosticBriefing from '@/components/DiagnosticBriefing';
import HorizontalStepper from '@/components/HorizontalStepper';
import { useEngine } from '@/hooks/useEngine';
import {
  StepType, DriveInfo, ScanStats, ScanSession, Notification, ScanMode, FileCategory, NetworkStatus
} from '@/types';
import { AlertCircle, Moon, Sun } from 'lucide-react';
import Link from 'next/link';

// Static timestamps — defined outside component to avoid impure render calls
const NOW = 1741046400000;
const SCAN_HISTORY_INIT = [
  {
    id: 'prev-1', driveId: '1', driveName: 'Macintosh HD',
    startedAt: NOW - 86400 * 1000 * 2,
    completedAt: NOW - 86400 * 1000 * 2 + 3600 * 1000,
    mode: 'deep' as const, filesFound: 2847, dataSize: 8_500_000_000,
    status: 'completed' as const, restoreRate: 94,
  },
  {
    id: 'prev-2', driveId: '2', driveName: 'EXTERNAL_USB',
    startedAt: NOW - 86400 * 1000 * 7,
    completedAt: NOW - 86400 * 1000 * 7 + 1800 * 1000,
    mode: 'quick' as const, filesFound: 341, dataSize: 920_000_000,
    status: 'completed' as const, restoreRate: 88,
  },
];

const mockDrives: DriveInfo[] = [
  {
    id: '1',
    name: 'Macintosh HD',
    format: 'APFS Volume',
    size: '994.7 GB',
    sizeBytes: 994_700_000_000,
    type: 'Internal',
    icon: 'hard-drive',
    status: 'available',
    smartStatus: 'good',
    health: 94,
    temperature: 38,
    reallocatedSectors: 0,
    pendingSectors: 0,
  },
  {
    id: '2',
    name: 'EXTERNAL_USB',
    format: 'ExFAT',
    size: '128.0 GB',
    sizeBytes: 128_000_000_000,
    type: 'External',
    icon: 'usb',
    status: 'offline',
    smartStatus: 'unknown',
    health: 0,
  },
];

const defaultScanStats: ScanStats = {
  sectorsScanned: 0, totalSectors: 1_953_525, filesDetected: 0, dataRestorable: 0,
  elapsedSeconds: 0, estimatedRemainingSeconds: 0, uploadSpeedBps: 0, dataTransferred: 0,
  networkStatus: NetworkStatus.CONNECTING,
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const engine = useEngine();
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [selectedDrive, setSelectedDrive] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('deep');
  const [scanProgress, setScanProgress] = useState(0);
  const [filesFound, setFilesFound] = useState({ documents: 0, media: 0, archives: 0, other: 0, images: 0, video: 0, system: 0, archive: 0 });
  const [scanStats, setScanStats] = useState<ScanStats>(defaultScanStats);
  const [scanPaused, setScanPaused] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Persist dark mode preference and toggle html class
  useEffect(() => {
    const stored = localStorage.getItem('restoreit-theme');
    if (stored === 'light') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDarkMode(false);
      document.documentElement.classList.add('light-mode');
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('restoreit-theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [darkMode]);
  const [showHistory, setShowHistory] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showAgentChat, setShowAgentChat] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanSession[]>(SCAN_HISTORY_INIT);
  const [diagnosticData, setDiagnosticData] = useState<{ scenario: string; priorities: FileCategory[] }>({ scenario: '', priorities: [] });

  // Handle mounting for hydration-safe rendering
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);



  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k': e.preventDefault(); setShowKeyboardShortcuts(prev => !prev); break;
          case 'd': e.preventDefault(); setDarkMode(prev => !prev); break;
          case 'h': e.preventDefault(); setShowHistory(prev => !prev); break;
        }
      }
      if (e.key === 'Escape') {
        setShowKeyboardShortcuts(false);
        setShowHistory(false);
        setShowCancelConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const n: Notification = { id: crypto.randomUUID(), type, message, timestamp: Date.now(), read: false };
    setNotifications(prev => [n, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 5000);
  }, []);

  const handleDiagnosticComplete = (data: { scenario: string; priorities: FileCategory[] }) => {
    setDiagnosticData(data);
    setCurrentStep(2);
    addNotification('success', 'Got it. We\'ll prioritize those file types during the scan.');
  };

  const startScan = () => {
    setCurrentStep(3);
    setScanProgress(0);
    setScanPaused(false);
    setScanStats({ ...defaultScanStats, networkStatus: NetworkStatus.CONNECTING });
    addNotification('info', 'Connected. Cloud scan started.');

    let progress = 0;
    let elapsed = 0;
    const estimatedDuration = scanMode === 'quick' ? 30 : 90;

    const timer = setInterval(() => {
      if (scanPaused) return;
      progress += scanMode === 'quick' ? Math.random() * 12 : Math.random() * 5;
      elapsed += 0.4;

      if (progress >= 100) {
        clearInterval(timer);
        setScanProgress(100);
        setScanStats(prev => ({
          ...prev, sectorsScanned: prev.totalSectors, networkStatus: NetworkStatus.CONNECTED,
          elapsedSeconds: elapsed, estimatedRemainingSeconds: 0,
        }));
        addNotification('success', 'Scan complete. Restorable files detected.');
        setTimeout(() => setCurrentStep(4), 800);
      } else {
        setScanProgress(progress);
        setScanStats(prev => ({
          ...prev,
          sectorsScanned: Math.floor((progress / 100) * prev.totalSectors),
          filesDetected: prev.filesDetected + Math.floor(Math.random() * 20),
          dataRestorable: prev.dataRestorable + Math.floor(Math.random() * 5_000_000),
          elapsedSeconds: elapsed,
          estimatedRemainingSeconds: Math.max(0, estimatedDuration - elapsed),
          uploadSpeedBps: 2_000_000 + Math.random() * 8_000_000,
          dataTransferred: prev.dataTransferred + Math.floor(Math.random() * 2_000_000),
          networkStatus: NetworkStatus.CONNECTED,
        }));

        // Mock file discovery based on priorities
        setFilesFound(prev => ({
          ...prev,
          media: prev.media + (diagnosticData.priorities.includes('images') ? 2 : 1),
          documents: prev.documents + (diagnosticData.priorities.includes('documents') ? 2 : 1),
          other: prev.other + 1
        }));
      }
    }, 400);
  };

  const handlePauseScan = () => {
    setScanPaused(prev => {
      addNotification(prev ? 'info' : 'warning', prev ? 'Scan resumed.' : 'Scan paused. Background processes may overwrite data.');
      return !prev;
    });
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setDiagnosticData({ scenario: '', priorities: [] });
    setSelectedDrive(null);
    setScanProgress(0);
    setScanStats(defaultScanStats);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setTimeout(() => {
      const session: ScanSession = {
        id: crypto.randomUUID(),
        driveId: selectedDrive || '1',
        driveName: mockDrives.find(d => d.id === selectedDrive)?.name || 'Unknown Drive',
        startedAt: Date.now() - 90000,
        completedAt: Date.now(),
        mode: scanMode,
        filesFound: scanStats.filesDetected,
        dataSize: scanStats.dataRestorable,
        status: 'completed' as const,
        restoreRate: 94,
      };
      setScanHistory(prev => [session, ...prev]);
      setCurrentStep(5);
    }, 4000);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-text-secondary)] font-sans selection:bg-[var(--color-accent)]/20 overflow-auto transition-colors duration-300">
      <header className="flex items-center justify-between px-8 lg:px-12 py-6 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-background)] sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-md bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20 group-hover:scale-105 transition-all">
              <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-base font-semibold tracking-wide">restoreit</h1>
          </Link>
          <nav className="hidden xl:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-text-dim)]">
            <Link href="/" className="hover:text-[var(--color-foreground)] transition-colors">Home</Link>
            <Link href="/#about" className="hover:text-[var(--color-foreground)] transition-colors">About</Link>
            <Link href="/#how-it-works" className="hover:text-[var(--color-foreground)] transition-colors">How It Works</Link>
            <Link href="/#pricing" className="hover:text-[var(--color-foreground)] transition-colors">Pricing</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-tertiary)] hover:text-[var(--color-foreground)] transition-colors mr-4 px-4 py-2">Log In</Link>
          <button onClick={() => setDarkMode(prev => !prev)} className="p-2.5 rounded-lg border transition-all border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)]">{darkMode ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
      </header>

      <main className="flex-1 flex max-w-[1400px] w-full mx-auto pb-16">
        <Sidebar currentStep={currentStep} onRestart={handleRestart} />
        <section className="flex-1 flex flex-col px-8 lg:px-16 pt-6">
          <HorizontalStepper currentStep={currentStep} />

          {currentStep === 1 && <DiagnosticBriefing onComplete={handleDiagnosticComplete} />}
          {currentStep === 2 && (
            <DriveSelector
              drives={mockDrives}
              selectedDrive={selectedDrive}
              onSelectDrive={setSelectedDrive}
              onStartScan={startScan}
              scanMode={scanMode}
              onScanModeChange={setScanMode}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <Scanner
              progress={scanProgress}
              stats={scanStats}
              files={filesFound}
              onPause={handlePauseScan}
              onCancel={() => setShowCancelConfirm(true)}
              paused={scanPaused}
              onBack={() => {
                setScanProgress(0);
                setCurrentStep(2);
              }}
            />
          )}
          {currentStep === 4 && (
            <ExtractionBrowser
              totalFiles={scanStats.filesDetected}
              files={filesFound}
              stats={scanStats}
              onRestart={handleRestart}
              onCheckout={() => setShowCheckout(true)}
              onBack={() => {
                setScanProgress(0);
                setCurrentStep(2);
              }}
            />
          )}
          {currentStep === 5 && (
            <ProUpsell
              sessionStats={scanHistory[0]}
              onAccept={() => addNotification('success', 'Pro subscription activated.')}
              onRestart={() => handleRestart()}
              onBack={() => setCurrentStep(4)}
            />
          )}
        </section>
      </main>

      {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} onSuccess={handlePaymentSuccess} totalFiles={scanStats.filesDetected} dataSize={scanStats.dataRestorable} />}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--color-background-elevated)] border-[var(--color-border)] border rounded-2xl p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-6"><AlertCircle size={24} /></div>
            <h3 className="text-lg font-semibold mb-2 text-[var(--color-foreground)]">Cancel this scan?</h3>
            <p className="text-sm mb-8 leading-relaxed text-[var(--color-text-secondary)]">Stopping the scan now will discard all detected file data. Fragments located so far will be lost.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 py-3 rounded-xl text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)]">Continue Scanning</button>
              <button onClick={() => { setShowCancelConfirm(false); handleRestart(); }} className="flex-1 py-3 rounded-xl text-sm font-medium bg-red-600 text-white">Cancel Scan</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setShowAgentChat(prev => !prev)} className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${showAgentChat ? 'bg-[var(--color-disabled-bg)] rotate-45' : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]'}`}>
        <div className="w-3 h-3 bg-white rounded-sm" />
      </button>
      {showAgentChat && <AgentChat onClose={() => setShowAgentChat(false)} messages={engine.messages} isStreaming={engine.isStreaming} onSend={engine.send} />}
      <Notifications notifications={notifications} />
      {showOnboarding && <OnboardingOverlay onComplete={() => setShowOnboarding(false)} />}
      {showKeyboardShortcuts && <KeyboardShortcutsModal isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />}
      {showHistory && <ScanHistory sessions={scanHistory} onClose={() => setShowHistory(false)} />}
    </div>
  );
}
