"use client";

import { useState, useEffect, useCallback } from 'react';

// Static timestamps — defined outside component to avoid impure render calls
const NOW = 1741046400000; // 2026-03-04T00:00:00Z — fixed reference
const SCAN_HISTORY_INIT = [
  {
    id: 'prev-1', driveId: '1', driveName: 'Macintosh HD',
    startedAt: NOW - 86400 * 1000 * 2,
    completedAt: NOW - 86400 * 1000 * 2 + 3600 * 1000,
    mode: 'deep' as const, filesFound: 2847, dataSize: 8_500_000_000,
    status: 'completed' as const, recoveryRate: 94,
  },
  {
    id: 'prev-2', driveId: '2', driveName: 'EXTERNAL_USB',
    startedAt: NOW - 86400 * 1000 * 7,
    completedAt: NOW - 86400 * 1000 * 7 + 1800 * 1000,
    mode: 'quick' as const, filesFound: 341, dataSize: 920_000_000,
    status: 'completed' as const, recoveryRate: 88,
  },
];
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
import {
  StepType, DriveInfo, ScanStats, ScanSession, Notification, ScanMode
} from '@/types';
import { AlertCircle, History, Keyboard, Moon, Sun, HelpCircle } from 'lucide-react';
import Link from 'next/link';

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
  sectorsScanned: 0,
  totalSectors: 1_953_525,
  filesDetected: 0,
  dataRecoverable: 0,
  elapsedSeconds: 0,
  estimatedRemainingSeconds: 0,
  uploadSpeedBps: 0,
  dataTransferred: 0,
  networkStatus: 'connecting',
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [selectedDrive, setSelectedDrive] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('deep');
  const [scanProgress, setScanProgress] = useState(0);
  const [filesFound, setFilesFound] = useState({ documents: 0, media: 0, archives: 0, other: 0 });
  const [scanStats, setScanStats] = useState<ScanStats>(defaultScanStats);
  const [scanPaused, setScanPaused] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true); // Default to true for presentation
  const [showAgentChat, setShowAgentChat] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanSession[]>(SCAN_HISTORY_INIT);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setShowKeyboardShortcuts(prev => !prev);
            break;
          case 'd':
            e.preventDefault();
            setDarkMode(prev => !prev);
            break;
          case 'h':
            e.preventDefault();
            setShowHistory(prev => !prev);
            break;
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
    setTimeout(() => {
      setNotifications(prev => prev.filter(x => x.id !== n.id));
    }, 5000);
  }, []);

  const startScan = () => {
    setCurrentStep(2);
    setScanProgress(0);
    setScanPaused(false);
    setFilesFound({ documents: 0, media: 0, archives: 0, other: 0 });
    setScanStats({ ...defaultScanStats, networkStatus: 'connecting' });
    addNotification('info', 'Relay connected. Cloud sweep initiated.');

    let progress = 0;
    let elapsed = 0;
    const totalSectors = 1_953_525;
    const estimatedDuration = scanMode === 'quick' ? 30 : 90; // seconds simulated

    const timer = setInterval(() => {
      if (scanPaused) return;
      const increment = scanMode === 'quick'
        ? Math.random() * 12
        : Math.random() * 5;
      progress += increment;
      elapsed += 0.4;

      if (progress >= 100) {
        clearInterval(timer);
        setScanProgress(100);
        setScanStats(prev => ({
          ...prev,
          sectorsScanned: totalSectors,
          networkStatus: 'connected',
          elapsedSeconds: elapsed,
          estimatedRemainingSeconds: 0,
          uploadSpeedBps: 0,
        }));
        addNotification('success', 'Scan complete. Recoverable files detected.');
        setTimeout(() => setCurrentStep(3), 800);
      } else {
        const frac = progress / 100;
        setScanProgress(progress);
        setFilesFound(prev => ({
          documents: prev.documents + Math.floor(Math.random() * 5),
          media: prev.media + Math.floor(Math.random() * 4),
          archives: prev.archives + Math.floor(Math.random() * 1),
          other: prev.other + Math.floor(Math.random() * 10),
        }));
        setScanStats(prev => ({
          ...prev,
          sectorsScanned: Math.floor(frac * totalSectors),
          filesDetected: prev.filesDetected + Math.floor(Math.random() * 20),
          dataRecoverable: prev.dataRecoverable + Math.floor(Math.random() * 5_000_000),
          elapsedSeconds: elapsed,
          estimatedRemainingSeconds: Math.max(0, estimatedDuration - elapsed),
          uploadSpeedBps: 2_000_000 + Math.random() * 8_000_000,
          dataTransferred: prev.dataTransferred + Math.floor(Math.random() * 2_000_000),
          networkStatus: 'connected',
        }));
      }
    }, 400);
  };

  const handlePauseScan = () => {
    setScanPaused(prev => {
      if (!prev) addNotification('warning', 'Scan paused. Background processes may overwrite data. Resume soon.');
      else addNotification('info', 'Scan resumed.');
      return !prev;
    });
  };

  const handleCancelScan = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    handleRestart();
    addNotification('warning', 'Scan cancelled. Unsaved recovery data has been discarded.');
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedDrive(null);
    setScanProgress(0);
    setScanPaused(false);
    setIsPaid(false);
    setScanStats(defaultScanStats);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setIsPaid(true);
    addNotification('success', 'Payment authorized. Extracting files to Cloud Vault...');
    setTimeout(() => {
      setIsPaid(false);
      const session: ScanSession = {
        id: crypto.randomUUID(),
        driveId: selectedDrive || '1',
        driveName: mockDrives.find(d => d.id === selectedDrive)?.name || 'Unknown Drive',
        startedAt: Date.now() - 90000,
        completedAt: Date.now(),
        mode: scanMode,
        filesFound: filesFound.documents + filesFound.media + filesFound.archives + filesFound.other,
        dataSize: scanStats.dataRecoverable,
        status: 'completed',
        recoveryRate: 94,
      };
      setScanHistory(prev => [session, ...prev]);
      setCurrentStep(4);
    }, 4000);
  };

  const totalFiles = filesFound.documents + filesFound.media + filesFound.archives + filesFound.other;

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-[#0A0A0B] text-zinc-300' : 'bg-[#F5F5F7] text-zinc-800'} font-sans selection:bg-[#8A2BE2]/20 overflow-auto transition-colors duration-300`}>

      {/* Top Header */}
      <header className={`flex items-center justify-between px-8 lg:px-12 py-6 shrink-0 border-b ${darkMode ? 'border-[#ffffff08] bg-[#0A0A0B]' : 'border-black/10 bg-white'} sticky top-0 z-40 transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#8A2BE2] flex items-center justify-center shadow-lg shadow-[#8A2BE2]/20">
            <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
          </div>
          <h1 className="text-base font-semibold tracking-wide">RESTOREIT</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Scan History */}
          <button
            onClick={() => setShowHistory(true)}
            title="Scan History (⌘H)"
            aria-label="View scan history"
            className={`p-2.5 rounded-lg border transition-all ${darkMode ? 'border-white/10 hover:border-white/20 text-zinc-400 hover:text-white' : 'border-black/10 hover:border-black/20 text-zinc-500 hover:text-zinc-900'}`}
          >
            <History size={16} />
          </button>

          {/* Support */}
          <Link
            href="/support"
            title="Help & Support"
            aria-label="Help and support"
            className={`p-2.5 rounded-lg border transition-all ${darkMode ? 'border-white/10 hover:border-white/20 text-zinc-400 hover:text-white' : 'border-black/10 hover:border-black/20 text-zinc-500 hover:text-zinc-900'}`}
          >
            <HelpCircle size={16} />
          </Link>

          {/* Keyboard Shortcuts */}
          <button
            onClick={() => setShowKeyboardShortcuts(true)}
            title="Keyboard Shortcuts (⌘K)"
            aria-label="Show keyboard shortcuts"
            className={`p-2.5 rounded-lg border transition-all ${darkMode ? 'border-white/10 hover:border-white/20 text-zinc-400 hover:text-white' : 'border-black/10 hover:border-black/20 text-zinc-500 hover:text-zinc-900'}`}
          >
            <Keyboard size={16} />
          </button>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(prev => !prev)}
            title="Toggle dark/light mode (⌘D)"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`p-2.5 rounded-lg border transition-all ${darkMode ? 'border-white/10 hover:border-white/20 text-zinc-400 hover:text-white' : 'border-black/10 hover:border-black/20 text-zinc-500 hover:text-zinc-900'}`}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex max-w-[1400px] w-full mx-auto pb-16">
        <Sidebar currentStep={currentStep} darkMode={darkMode} />

        <section className="flex-1 flex flex-col justify-center px-8 lg:px-16 h-full min-h-[600px]">

          {/* STEP 1: Drive Selector & Relay Setup */}
          {currentStep === 1 && (
            <DriveSelector
              drives={mockDrives}
              selectedDrive={selectedDrive}
              onSelectDrive={setSelectedDrive}
              onStartScan={startScan}
              scanMode={scanMode}
              onScanModeChange={setScanMode}
              darkMode={darkMode}
            />
          )}

          {/* STEP 2: Active Scanner */}
          {currentStep === 2 && (
            <Scanner
              progress={scanProgress}
              files={filesFound}
              stats={scanStats}
              paused={scanPaused}
              onPause={handlePauseScan}
              onCancel={handleCancelScan}
              darkMode={darkMode}
            />
          )}

          {/* STEP 3: Extraction Browser — Proof of Life */}
          {currentStep === 3 && !isPaid && (
            <ExtractionBrowser
              totalFiles={totalFiles}
              files={filesFound}
              stats={scanStats}
              onRestart={handleRestart}
              onCheckout={() => setShowCheckout(true)}
              darkMode={darkMode}
            />
          )}

          {/* STEP 3 — Paid: Extracting to Vault */}
          {currentStep === 3 && isPaid && (
            <div className="animate-in fade-in zoom-in-95 duration-700 w-full flex flex-col items-center justify-center gap-6 h-full text-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-[#8A2BE2]/20 animate-ping"></div>
                <div className="w-24 h-24 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 flex items-center justify-center">
                  <svg className="animate-spin h-10 w-10 text-[#8A2BE2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-medium text-white">Extracting to Cloud Vault</h2>
              <p className={`max-w-md ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Your files are being securely transferred to your private Cloud Vault. This may take a few minutes depending on your network speed.
              </p>
              <div className={`w-full max-w-lg ${darkMode ? 'bg-black/40 border-[#8A2BE2]/30' : 'bg-[#8A2BE2]/5 border-[#8A2BE2]/20'} border p-6 rounded-2xl flex items-start gap-4 text-left`}>
                <AlertCircle className="text-[#8A2BE2] shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Keep this page open</h4>
                  <p className={`text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
                    RestoreIt requires this window to remain active to maintain the secure relay session. You will receive a notification and download link when extraction completes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Recovery Success + Pro Protection Upsell */}
          {currentStep === 4 && (
            <ProUpsell
              sessionStats={scanHistory[0]}
              darkMode={darkMode}
              onRestart={handleRestart}
            />
          )}

        </section>
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={handlePaymentSuccess}
          totalFiles={totalFiles}
          dataSize={scanStats.dataRecoverable}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="cancel-title">
          <div className={`w-full max-w-md ${darkMode ? 'bg-[#111113] border-white/10' : 'bg-white border-black/10'} border rounded-2xl p-8 shadow-2xl`}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-6">
              <AlertCircle size={24} />
            </div>
            <h3 id="cancel-title" className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Cancel this scan?</h3>
            <p className={`text-sm mb-8 leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Stopping the scan now will discard all detected file data. Any fragments located so far will be lost. Your disk has not been modified, so you can restart safely — but you will need to wait for a full new scan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                autoFocus
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${darkMode ? 'border-white/10 text-zinc-300 hover:border-white/20 hover:text-white' : 'border-black/10 text-zinc-700 hover:border-black/20'}`}
              >
                Continue Scanning
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-all"
              >
                Cancel Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Agent Chat Button */}
      <button
        onClick={() => setShowAgentChat(prev => !prev)}
        aria-label="Open recovery assistant"
        title="Recovery Assistant"
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${showAgentChat ? 'bg-zinc-700 rotate-45' : 'bg-[#8A2BE2] hover:bg-[#7e22ce] shadow-[#8A2BE2]/40'}`}
      >
        <div className="w-3 h-3 bg-white rounded-sm" />
      </button>

      {/* Agent Chat */}
      {showAgentChat && (
        <AgentChat
          onClose={() => setShowAgentChat(false)}
          darkMode={darkMode}
        />
      )}

      {/* Toast Notifications */}
      <Notifications notifications={notifications} darkMode={darkMode} />

      {/* Onboarding Overlay */}
      {showOnboarding && (
        <OnboardingOverlay
          onComplete={() => setShowOnboarding(false)}
          darkMode={darkMode}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsModal
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
          darkMode={darkMode}
        />
      )}

      {/* Scan History Drawer */}
      {showHistory && (
        <ScanHistory
          sessions={scanHistory}
          onClose={() => setShowHistory(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
