// ============================================================
// RestoreIt — Master Type Definitions
// ============================================================

export type StepType = 1 | 2 | 3 | 4;
export type ScanMode = 'quick' | 'deep';
export type ViewMode = 'list' | 'grid' | 'timeline';
export type FileCategory = 'all' | 'images' | 'documents' | 'videos' | 'archives' | 'system';
export type DriveStatus = 'available' | 'offline' | 'scanning' | 'scanned';
export type RecoverabilityStatus = 'intact' | 'fragmented' | 'corrupted' | 'duplicate';
export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface DriveInfo {
    id: string;
    name: string;
    format: string;
    size: string;
    sizeBytes: number;
    type: 'Internal' | 'External';
    icon: 'hard-drive' | 'usb';
    status: DriveStatus;
    smartStatus: 'good' | 'warning' | 'critical' | 'unknown';
    health: number; // 0-100
    temperature?: number; // Celsius
    reallocatedSectors?: number;
    pendingSectors?: number;
}

export interface FileData {
    id: string;
    name: string;
    size: number;
    type: 'document' | 'media' | 'archive' | 'system' | 'video' | 'image';
    category: FileCategory;
    path: string;
    recoveredAt: number;
    modifiedAt?: number;
    status: RecoverabilityStatus;
    integrityScore: number; // 0-100
    isDuplicate?: boolean;
    extension: string;
    previewUrl?: string;
    selected?: boolean;
}

export interface ScanStats {
    sectorsScanned: number;
    totalSectors: number;
    filesDetected: number;
    dataRecoverable: number; // bytes
    elapsedSeconds: number;
    estimatedRemainingSeconds: number;
    uploadSpeedBps: number;
    dataTransferred: number; // bytes
    networkStatus: 'connected' | 'connecting' | 'disconnected' | 'slow';
}

export interface ScanSession {
    id: string;
    driveId: string;
    driveName: string;
    startedAt: number;
    completedAt?: number;
    mode: ScanMode;
    filesFound: number;
    dataSize: number;
    status: 'completed' | 'cancelled' | 'in-progress' | 'paused';
    recoveryRate: number; // 0-100
}

export interface CheckoutTier {
    id: 'standard' | 'pro';
    name: string;
    price: number;
    vaultStorage: string;
    scanLimit: string;
    retention: string;
    requiresExternalDrive: boolean;
    features: string[];
    excluded: string[];
}

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: number;
    read: boolean;
}

export interface ProDashboard {
    healthScore: number; // 0-100
    devices: DeviceHealth[];
    alerts: HealthAlert[];
    subscriptionStatus: 'active' | 'inactive' | 'trialing';
    vaultUsed: number; // bytes
    vaultTotal: number; // bytes
    nextRenewal: number; // timestamp
    priorityQueueStatus: 'enabled' | 'disabled';
}

export interface DeviceHealth {
    id: string;
    name: string;
    type: 'macbook' | 'imac' | 'external' | 'usb';
    healthScore: number;
    lastScanned: number;
    status: 'protected' | 'warning' | 'critical' | 'unmonitored';
    format: string;
    capacity: string;
}

export interface HealthAlert {
    id: string;
    deviceId: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: number;
    resolved: boolean;
}
