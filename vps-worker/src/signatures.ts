// File Signatures Database — magic bytes for file carving
// Sources: Gary Kessler's File Signatures Table (public domain), common format specs

export interface FileSignature {
  name: string
  extension: string
  header: number[]           // Magic bytes at start of file
  headerOffset?: number      // Offset from start where header appears (default 0)
  footer?: number[]          // End-of-file marker (if known)
  maxSize?: number           // Maximum expected file size in bytes
  category: 'images' | 'documents' | 'videos' | 'audio' | 'archives' | 'other'
}

export const SIGNATURES: FileSignature[] = [
  // ─── Images ─────────────────────────────────────────────
  {
    name: 'JPEG',
    extension: 'jpg',
    header: [0xFF, 0xD8, 0xFF],
    footer: [0xFF, 0xD9],
    maxSize: 50 * 1024 * 1024, // 50MB
    category: 'images',
  },
  {
    name: 'PNG',
    extension: 'png',
    header: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    footer: [0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82],
    maxSize: 100 * 1024 * 1024,
    category: 'images',
  },
  {
    name: 'GIF',
    extension: 'gif',
    header: [0x47, 0x49, 0x46, 0x38], // GIF8 (covers GIF87a and GIF89a)
    footer: [0x00, 0x3B],
    maxSize: 50 * 1024 * 1024,
    category: 'images',
  },
  {
    name: 'BMP',
    extension: 'bmp',
    header: [0x42, 0x4D], // BM
    maxSize: 100 * 1024 * 1024,
    category: 'images',
  },
  {
    name: 'TIFF (LE)',
    extension: 'tif',
    header: [0x49, 0x49, 0x2A, 0x00], // II*\0
    maxSize: 500 * 1024 * 1024,
    category: 'images',
  },
  {
    name: 'TIFF (BE)',
    extension: 'tif',
    header: [0x4D, 0x4D, 0x00, 0x2A], // MM\0*
    maxSize: 500 * 1024 * 1024,
    category: 'images',
  },
  {
    name: 'WebP',
    extension: 'webp',
    header: [0x52, 0x49, 0x46, 0x46], // RIFF (needs secondary check for WEBP at offset 8)
    maxSize: 50 * 1024 * 1024,
    category: 'images',
  },
  {
    name: 'HEIF/HEIC',
    extension: 'heic',
    header: [0x00, 0x00, 0x00], // ftyp box — needs secondary check at offset 4 for 'ftyp'
    headerOffset: 0,
    maxSize: 100 * 1024 * 1024,
    category: 'images',
  },
  {
    name: 'Canon RAW',
    extension: 'cr2',
    header: [0x49, 0x49, 0x2A, 0x00, 0x10, 0x00, 0x00, 0x00, 0x43, 0x52],
    maxSize: 100 * 1024 * 1024,
    category: 'images',
  },

  // ─── Documents ──────────────────────────────────────────
  {
    name: 'PDF',
    extension: 'pdf',
    header: [0x25, 0x50, 0x44, 0x46], // %PDF
    footer: [0x25, 0x25, 0x45, 0x4F, 0x46], // %%EOF
    maxSize: 500 * 1024 * 1024,
    category: 'documents',
  },
  {
    name: 'Microsoft Office (OOXML)',
    extension: 'docx', // Could be docx/xlsx/pptx — needs secondary check
    header: [0x50, 0x4B, 0x03, 0x04], // PK (ZIP-based)
    maxSize: 200 * 1024 * 1024,
    category: 'documents',
  },
  {
    name: 'Microsoft Office (OLE)',
    extension: 'doc',
    header: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1],
    maxSize: 200 * 1024 * 1024,
    category: 'documents',
  },
  {
    name: 'Rich Text Format',
    extension: 'rtf',
    header: [0x7B, 0x5C, 0x72, 0x74, 0x66], // {\rtf
    maxSize: 50 * 1024 * 1024,
    category: 'documents',
  },

  // ─── Videos ─────────────────────────────────────────────
  {
    name: 'MP4/M4V',
    extension: 'mp4',
    // ftyp box: bytes 4-7 should be 'ftyp' — variable first 4 bytes (box size)
    header: [0x66, 0x74, 0x79, 0x70], // 'ftyp' at offset 4
    headerOffset: 4,
    maxSize: 10 * 1024 * 1024 * 1024, // 10GB
    category: 'videos',
  },
  {
    name: 'AVI',
    extension: 'avi',
    header: [0x52, 0x49, 0x46, 0x46], // RIFF (needs secondary check for AVI at offset 8)
    maxSize: 4 * 1024 * 1024 * 1024,
    category: 'videos',
  },
  {
    name: 'MKV',
    extension: 'mkv',
    header: [0x1A, 0x45, 0xDF, 0xA3], // EBML
    maxSize: 10 * 1024 * 1024 * 1024,
    category: 'videos',
  },
  {
    name: 'MOV',
    extension: 'mov',
    header: [0x6D, 0x6F, 0x6F, 0x76], // 'moov' — also uses ftyp like MP4
    headerOffset: 4,
    maxSize: 10 * 1024 * 1024 * 1024,
    category: 'videos',
  },

  // ─── Audio ──────────────────────────────────────────────
  {
    name: 'MP3 (ID3)',
    extension: 'mp3',
    header: [0x49, 0x44, 0x33], // ID3
    maxSize: 50 * 1024 * 1024,
    category: 'audio',
  },
  {
    name: 'MP3 (sync)',
    extension: 'mp3',
    header: [0xFF, 0xFB], // MPEG sync
    maxSize: 50 * 1024 * 1024,
    category: 'audio',
  },
  {
    name: 'WAV',
    extension: 'wav',
    header: [0x52, 0x49, 0x46, 0x46], // RIFF (needs check for WAVE at offset 8)
    maxSize: 2 * 1024 * 1024 * 1024,
    category: 'audio',
  },
  {
    name: 'FLAC',
    extension: 'flac',
    header: [0x66, 0x4C, 0x61, 0x43], // fLaC
    maxSize: 500 * 1024 * 1024,
    category: 'audio',
  },
  {
    name: 'OGG',
    extension: 'ogg',
    header: [0x4F, 0x67, 0x67, 0x53], // OggS
    maxSize: 500 * 1024 * 1024,
    category: 'audio',
  },
  {
    name: 'AAC (ADTS)',
    extension: 'aac',
    header: [0xFF, 0xF1], // ADTS sync
    maxSize: 50 * 1024 * 1024,
    category: 'audio',
  },

  // ─── Archives ───────────────────────────────────────────
  {
    name: 'ZIP',
    extension: 'zip',
    header: [0x50, 0x4B, 0x03, 0x04], // PK\x03\x04
    maxSize: 4 * 1024 * 1024 * 1024,
    category: 'archives',
  },
  {
    name: 'RAR',
    extension: 'rar',
    header: [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07], // Rar!
    maxSize: 4 * 1024 * 1024 * 1024,
    category: 'archives',
  },
  {
    name: '7-Zip',
    extension: '7z',
    header: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C], // 7z signature
    maxSize: 4 * 1024 * 1024 * 1024,
    category: 'archives',
  },
  {
    name: 'GZIP',
    extension: 'gz',
    header: [0x1F, 0x8B], // gzip magic
    maxSize: 4 * 1024 * 1024 * 1024,
    category: 'archives',
  },
  {
    name: 'TAR',
    extension: 'tar',
    header: [0x75, 0x73, 0x74, 0x61, 0x72], // 'ustar' at offset 257
    headerOffset: 257,
    maxSize: 4 * 1024 * 1024 * 1024,
    category: 'archives',
  },

  // ─── Other ──────────────────────────────────────────────
  {
    name: 'SQLite',
    extension: 'sqlite',
    header: [0x53, 0x51, 0x4C, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6F, 0x72, 0x6D, 0x61, 0x74], // "SQLite format"
    maxSize: 1 * 1024 * 1024 * 1024,
    category: 'other',
  },
  {
    name: 'ELF',
    extension: 'elf',
    header: [0x7F, 0x45, 0x4C, 0x46], // \x7FELF
    maxSize: 500 * 1024 * 1024,
    category: 'other',
  },
  {
    name: 'Mach-O (64-bit)',
    extension: 'macho',
    header: [0xCF, 0xFA, 0xED, 0xFE],
    maxSize: 500 * 1024 * 1024,
    category: 'other',
  },
]

/**
 * Search for a signature match at a given buffer position.
 * Returns the matching signature or null.
 */
export function matchSignature(buffer: Uint8Array, position: number): FileSignature | null {
  for (const sig of SIGNATURES) {
    const offset = position + (sig.headerOffset ?? 0)
    if (offset + sig.header.length > buffer.length) continue

    let match = true
    for (let i = 0; i < sig.header.length; i++) {
      if (buffer[offset + i] !== sig.header[i]) {
        match = false
        break
      }
    }

    if (match) return sig
  }
  return null
}

/**
 * Search for a footer pattern in the buffer starting from a given position.
 * Returns the position of the last byte of the footer, or -1 if not found.
 */
export function findFooter(buffer: Uint8Array, startPos: number, footer: number[], maxSearch?: number): number {
  const searchEnd = maxSearch
    ? Math.min(buffer.length, startPos + maxSearch)
    : buffer.length

  for (let i = startPos; i <= searchEnd - footer.length; i++) {
    let match = true
    for (let j = 0; j < footer.length; j++) {
      if (buffer[i + j] !== footer[j]) {
        match = false
        break
      }
    }
    if (match) return i + footer.length
  }

  return -1
}
