import type { DriveInfo, ScanSession, ScanStats, NetworkStatus } from '@/types'

// ============================================================
// Demo data shown to users before their first scan/purchase.
// Once a user initiates a real scan, is_demo flips to false
// and all demo data is replaced with real data from D1.
// Landing page stats are ALWAYS shown (marketing/capability).
// ============================================================

export const DEMO_USER = {
  id: 'demo-user',
  email: 'you@example.com',
  firstName: 'New User',
  isDemo: true,
  createdAt: new Date('2026-03-01'),
}

export const DEMO_DRIVES: DriveInfo[] = [
  {
    id: 'demo-1',
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
    id: 'demo-2',
    name: 'EXTERNAL_USB',
    format: 'ExFAT',
    size: '128.0 GB',
    sizeBytes: 128_000_000_000,
    type: 'External',
    icon: 'usb',
    status: 'available',
    smartStatus: 'unknown',
    health: 0,
  },
]

export const DEMO_SCAN_HISTORY: (Omit<ScanSession, 'dataSize' | 'restoreRate'> & { date: string; duration: string; dataSize: string; restoreRate: string; filesFound: number })[] = [
  {
    id: 'demo-scan-1',
    driveId: 'demo-1',
    driveName: 'Macintosh HD',
    startedAt: Date.now() - 86400 * 1000 * 2,
    completedAt: Date.now() - 86400 * 1000 * 2 + 3600 * 1000,
    mode: 'deep',
    filesFound: 2847,
    dataSize: '12.4 GB',
    status: 'completed',
    restoreRate: '94%',
    date: 'Mar 1, 2026',
    duration: '42m',
  },
  {
    id: 'demo-scan-2',
    driveId: 'demo-2',
    driveName: 'EXTERNAL_USB',
    startedAt: Date.now() - 86400 * 1000 * 7,
    completedAt: Date.now() - 86400 * 1000 * 7 + 1800 * 1000,
    mode: 'quick',
    filesFound: 341,
    dataSize: '850 MB',
    status: 'completed',
    restoreRate: '88%',
    date: 'Feb 24, 2026',
    duration: '12m',
  },
  {
    id: 'demo-scan-3',
    driveId: 'demo-1',
    driveName: 'SD Card (EOS)',
    startedAt: Date.now() - 86400 * 1000 * 14,
    mode: 'deep',
    filesFound: 12,
    dataSize: '4.2 GB',
    status: 'cancelled',
    restoreRate: '0%',
    date: 'Jan 28, 2026',
    duration: '5m',
  },
]

export const DEMO_CLOUD_FILES = [
  { id: 'vf-1', fileName: 'Wedding_001.jpg', fileType: 'image/jpeg', sizeDisplay: '12.4 MB', date: 'Jun 12, 2025', scanId: 'demo-scan-1' },
  { id: 'vf-2', fileName: 'Wedding_002.jpg', fileType: 'image/jpeg', sizeDisplay: '11.8 MB', date: 'Jun 12, 2025', scanId: 'demo-scan-1' },
  { id: 'vf-3', fileName: 'Ceremony_Video.mov', fileType: 'video/quicktime', sizeDisplay: '1.2 GB', date: 'Jun 12, 2025', scanId: 'demo-scan-1' },
  { id: 'vf-4', fileName: 'Tax_Returns_2024.pdf', fileType: 'application/pdf', sizeDisplay: '2.4 MB', date: 'Apr 15, 2025', scanId: 'demo-scan-2' },
  { id: 'vf-5', fileName: 'Contract_Draft.docx', fileType: 'application/docx', sizeDisplay: '450 KB', date: 'Feb 3, 2026', scanId: 'demo-scan-2' },
]

export const DEMO_INVOICES = [
  { id: 'INV-001', date: 'Mar 3, 2026', description: 'restoreit Pro — Restoration', amount: '$249.00', status: 'paid' },
  { id: 'INV-002', date: 'Feb 3, 2026', description: 'restoreit — Restoration', amount: '$89.00', status: 'paid' },
]

// Landing page stats — platform capabilities, always shown
export const PLATFORM_STATS = [
  { label: 'Uptime', value: '99.99%', sub: 'SLA Guaranteed' },
  { label: 'Scan Speed', value: '2GB/min', sub: 'Avg. Throughput' },
  { label: 'Encryption', value: 'AES-256', sub: 'End-to-End' },
  { label: 'Zero Writes', value: '0 bytes', sub: 'Written to Disk' },
]

export const DEMO_PROTECTION_STATS = {
  healthScore: 98,
  temperature: 32,
  reallocatedSectors: 0,
  pendingSectors: 0,
  powerOnHours: 1248,
  thermalHistory: [30, 32, 31, 35, 34, 32, 33, 31, 32, 30, 31, 32, 29, 31, 32],
}
