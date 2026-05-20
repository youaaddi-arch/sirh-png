import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

/**
 * Service de stockage des fichiers — Sprint 2 (MVP).
 *
 * Implémentation actuelle : filesystem local sous `storage/`.
 * À remplacer en prod par un client MinIO/S3 réel — l'interface publique
 * reste identique.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly basePath: string;

  constructor(private config: ConfigService) {
    this.basePath = process.env.STORAGE_LOCAL_PATH || './storage';
  }

  async upload(bucket: string, filename: string, buffer: Buffer, mimeType?: string): Promise<{ path: string; size: number }> {
    const safeBucket = bucket.replace(/[^a-z0-9-]/gi, '');
    const dir = path.join(this.basePath, safeBucket);
    await fs.mkdir(dir, { recursive: true });
    const ext = path.extname(filename) || '';
    const id = randomBytes(8).toString('hex');
    const safeName = `${Date.now()}-${id}${ext}`;
    const fullPath = path.join(dir, safeName);
    await fs.writeFile(fullPath, buffer);
    const stat = await fs.stat(fullPath);
    this.logger.log(`Uploaded ${safeName} (${stat.size} bytes) to ${safeBucket}`);
    return { path: `${safeBucket}/${safeName}`, size: stat.size };
  }

  async download(storagePath: string): Promise<Buffer> {
    const fullPath = path.join(this.basePath, storagePath);
    return fs.readFile(fullPath);
  }

  async delete(storagePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, storagePath);
    await fs.unlink(fullPath).catch(() => {/* ignore */});
  }

  getDownloadUrl(storagePath: string): string {
    // En prod : génère une URL S3 présignée (TTL 5 min). MVP : URL relative.
    return `/api/files/${encodeURIComponent(storagePath)}`;
  }
}
