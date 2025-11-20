import os from 'node:os';
import path from 'node:path';
import { extractFile } from './extract-file';
import { downloadFile } from './download-file';
import { detectPlatform } from '../k6path';

/**
 * 
 */
export const installBinary = async () => {
  const platform = detectPlatform();
  const version = '1.4.0';

  if (!platform)
    throw new Error(`The current system "${os.platform()}" is not supported`);

  const binaries = {
    windows: `windows-amd64.zip`,
    macos: `darwin-amd64.zip`,
    linux: `linux-amd64.tar.gz`,
  };
  const extractDir = path.join(__dirname, '../k6', `k6-${platform}-extract`);
  
  // here download from github
  console.log(`Downloading k6 v${version} for ${platform}...`);
  const downloadedPath = await downloadFile(
    `https://github.com/grafana/k6/releases/download/v${version}/k6-v${version}-${binaries[platform]}`,
    path.join(
      __dirname,
      '../k6',
      `k6.${
        platform === 'windows' || platform === 'macos' ? 'zip' : 'tar.gz'
      }`
    )
  );

  //here extract the binary
  const binaryPath = await extractFile(downloadedPath, extractDir, platform);

  console.log(`k6 successfully installed at: ${binaryPath}`);
  return binaryPath;
};
