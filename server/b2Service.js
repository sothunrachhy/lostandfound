const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

/**
 * Uploads image (base64 string) to Backblaze B2 and returns the public Cloudflare CDN URL.
 * Falls back to base64 string if B2 credentials are not configured yet.
 */
async function uploadToB2(imageData) {
  if (!imageData || typeof imageData !== 'string') return imageData;

  // Cloudflare R2 Credentials
  const r2Key = process.env.R2_ACCESS_KEY_ID;
  const r2Secret = process.env.R2_SECRET_ACCESS_KEY;
  const r2Bucket = process.env.R2_BUCKET;
  const r2Account = process.env.R2_ACCOUNT_ID;

  // Backblaze B2 Credentials
  const b2Key = process.env.B2_KEY_ID;
  const b2Secret = process.env.B2_APPLICATION_KEY;
  const b2Bucket = process.env.B2_BUCKET_NAME;
  const b2Endpoint = process.env.B2_ENDPOINT || 's3.us-west-004.backblazeb2.com';

  const cdnUrl = process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_CDN_URL;

  const isR2 = !!(r2Key && r2Secret && r2Bucket && r2Account);
  const isB2 = !!(b2Key && b2Secret && b2Bucket && b2Key !== 'your_b2_key_id');

  // Fallback to base64 data if no cloud storage keys are configured
  if (!isR2 && !isB2) {
    return imageData;
  }

  // If already a full HTTP URL, return as is
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }

  try {
    const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let contentType = 'image/jpeg';
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      contentType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
      if (contentType.includes('png')) ext = 'png';
      else if (contentType.includes('webp')) ext = 'webp';
      else if (contentType.includes('gif')) ext = 'gif';
    } else {
      buffer = Buffer.from(imageData, 'base64');
    }

    const filename = `items/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;

    const endpoint = isR2
      ? `https://${r2Account}.r2.cloudflarestorage.com`
      : `https://${b2Endpoint}`;

    const region = isR2 ? 'auto' : (b2Endpoint.split('.')[1] || 'us-west-004');
    const bucket = isR2 ? r2Bucket : b2Bucket;
    const accessKeyId = isR2 ? r2Key : b2Key;
    const secretAccessKey = isR2 ? r2Secret : b2Secret;

    const s3Client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: buffer,
        ContentType: contentType,
      })
    );

    if (cdnUrl) {
      const cleanCdn = cdnUrl.replace(/\/$/, '');
      return `${cleanCdn}/${filename}`;
    }

    return isR2
      ? `https://${r2Account}.r2.cloudflarestorage.com/${bucket}/${filename}`
      : `https://f000.backblazeb2.com/file/${bucket}/${filename}`;
  } catch (err) {
    console.error('⚠️ Cloud Storage Upload Error (falling back to direct data):', err.message);
    return imageData;
  }
}

module.exports = { uploadToB2 };
