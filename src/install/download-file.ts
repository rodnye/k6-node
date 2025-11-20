import path from 'node:path';
import fs from 'node:fs';
import { formatBytes } from '../utils/pipes';
import http from 'node:http';
import https from 'node:https';

/**
 * Download a file with progress bar
 */
export const downloadFile = async (url: string, outputPath: string) => {
  return new Promise<string>((resolve, reject) => {
    const tmpPath = outputPath + '.download';
    const protocol = url.startsWith('https') ? https : http;

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    protocol
      .get(url, (response) => {
        if (response.statusCode === 302) {
          // handle github redirect ;)
          downloadFile(response.headers.location!, outputPath)
            .then(resolve)
            .catch(reject);
          return;
        }
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download: ${response.statusCode} ${response.statusMessage}`
            )
          );
          return;
        }

        const totalSize = parseInt(response.headers['content-length']!, 10);
        let downloadedSize = 0;
        let lastProgress = 0;

        const fileStream = fs.createWriteStream(tmpPath);
        const updateProgress = () => {
          const progress = totalSize ? (downloadedSize / totalSize) * 100 : 0;
          const progressBarLength = 30;
          const filledLength = Math.round((progressBarLength * progress) / 100);
          const bar =
            '#'.repeat(filledLength) +
            '-'.repeat(progressBarLength - filledLength);

          if (progress - lastProgress >= 1 || Date.now() - lastProgress > 100) {
            process.stdout.write(
              `\r-> Downloading: [${bar}] ${progress.toFixed(
                1
              )}% | ${formatBytes(downloadedSize)}/${formatBytes(totalSize)}`
            );
            lastProgress = progress;
          }
        };

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          updateProgress();
        });

        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          fs.renameSync(tmpPath, outputPath);
          process.stdout.write('\n');
          resolve(outputPath);
        });

        fileStream.on('error', (err) => {
          fs.unlink(tmpPath, () => {});
          reject(err);
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};
