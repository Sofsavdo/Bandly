import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { offsiteConfigFromEnv, signPut, uploadBackup, type OffsiteConfig } from './offsite';

// Sozlanmagan — o'chiq; noto'g'ri endpoint — aniq xato
assert.equal(offsiteConfigFromEnv({}), null);
assert.throws(() => offsiteConfigFromEnv({ BACKUP_S3_ENDPOINT: 'https://x', BACKUP_S3_BUCKET: 'b' }), /BACKUP_S3_ACCESS_KEY_ID, BACKUP_S3_SECRET_ACCESS_KEY/, 'yarim sozlangan — jim o‘chiq emas, xato');
assert.throws(() => offsiteConfigFromEnv({ BACKUP_S3_ENDPOINT: 'x.com/path', BACKUP_S3_BUCKET: 'b', BACKUP_S3_ACCESS_KEY_ID: 'a', BACKUP_S3_SECRET_ACCESS_KEY: 's' }));
const env = { BACKUP_S3_ENDPOINT: 'https://t3.storageapi.dev/', BACKUP_S3_BUCKET: 'sellzen-bk', BACKUP_S3_ACCESS_KEY_ID: 'AKIDEXAMPLE', BACKUP_S3_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY' };
const cfg = offsiteConfigFromEnv(env)!;
assert.deepEqual([cfg.endpoint, cfg.region, cfg.prefix, cfg.urlStyle], ['https://t3.storageapi.dev', 'auto', 'sellzen-backups/', 'virtual'], 'Railway Bucket standartlari');

// Oltin vektor: AWS botocore (S3SigV4Auth) bilan aynan shu so'rov uchun hisoblangan imzo (2026-11-21 da yaratilgan)
const golden = signPut(cfg, 'sellzen-backups/bandly-20261121T030405Z.sqlite.gz', Buffer.from('sellzen-backup-golden'), 'application/gzip', new Date(Date.UTC(2026, 10, 21, 3, 4, 5)));
assert.equal(golden.url, 'https://sellzen-bk.t3.storageapi.dev/sellzen-backups/bandly-20261121T030405Z.sqlite.gz');
assert.equal(golden.headers.authorization, 'AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20261121/auto/s3/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=eaa2bfb323b80b8b01a653b61e24a71b5c27cac58c4ad81c9cafcf1113c47b46');
// Path uslubi (MinIO va boshqalar)
assert.equal(signPut({ ...cfg, urlStyle: 'path' }, 'a b/c.gz', Buffer.from('x'), 'application/gzip').url, 'https://t3.storageapi.dev/sellzen-bk/a%20b/c.gz');

// Haqiqiy yuklash soxta S3 serverga: PUT, gzip'langan SQLite, to'g'ri hash va kalit; xato holati aniq xabar beradi
const dir = mkdtempSync(join(tmpdir(), 'offsite-'));
const file = join(dir, 'bandly-20261121T030405Z.sqlite');
writeFileSync(file, Buffer.concat([Buffer.from('SQLite format 3\0'), Buffer.alloc(4096, 7)]));
let got: { method?: string; url?: string; headers?: Record<string, unknown>; body?: Buffer } = {};
let fail = false;
const srv = createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on('data', (c: Buffer) => chunks.push(c));
  req.on('end', () => { got = { method: req.method, url: req.url, headers: req.headers, body: Buffer.concat(chunks) }; res.statusCode = fail ? 403 : 200; res.end(fail ? '<Error><Code>AccessDenied</Code></Error>' : ''); });
});
await new Promise<void>((r) => srv.listen(0, '127.0.0.1', () => r()));
const port = (srv.address() as { port: number }).port;
const local: OffsiteConfig = { ...cfg, endpoint: `http://127.0.0.1:${port}`, urlStyle: 'path' };
const r = await uploadBackup(local, file);
assert.equal(got.method, 'PUT');
assert.equal(got.url, '/sellzen-bk/sellzen-backups/bandly-20261121T030405Z.sqlite.gz');
assert.equal(r.key, 'sellzen-backups/bandly-20261121T030405Z.sqlite.gz');
assert.ok(gunzipSync(got.body!).subarray(0, 15).toString() === 'SQLite format 3', 'tarkib: gzip ichida SQLite');
assert.equal(got.headers!['x-amz-content-sha256'], createHash('sha256').update(got.body!).digest('hex'));
assert.ok(r.bytes < 4096, 'siqilgan');
fail = true;
await assert.rejects(uploadBackup(local, file), /HTTP 403: <Error><Code>AccessDenied/);
srv.close();
console.log('offsite: OK');
