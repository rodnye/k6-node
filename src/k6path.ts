import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { installBinary } from './install/installer';

/**
 * Gets the k6 binary based on:
 * - configuration (.k6path file)
 * - or installed binary
 */
export const getK6BinaryPath = async (): Promise<string> => {
  const moduleDir = process.cwd();
  const k6PathFile = path.join(moduleDir, '.k6path');

  // use binary from .k6path file
  if (fs.existsSync(k6PathFile)) {
    try {
      const customPath = fs.readFileSync(k6PathFile, 'utf8').trim();

      if (fs.existsSync(customPath)) {
        console.debug(`Using k6 from custom path: ${customPath}`);
        return customPath;
      } else {
        throw new Error(
          `k6 binary not found at custom path specified in .k6path: ${customPath}`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error reading .k6path file: ${error.message}`);
      }
      throw error;
    }
  }

  // use the internally downloaded binary
  const platform = detectPlatform();
  const internalBinaryPath = path.join(
    __dirname,
    'k6',
    platform === 'windows' ? 'k6.exe' : 'k6'
  );

  if (fs.existsSync(internalBinaryPath)) {
    console.debug(`Using internally installed k6: ${internalBinaryPath}`);
    return internalBinaryPath;
  }

  console.log('k6 binary not found. Installing...');
  return await installBinary();
};

/**
 *
 */
export const detectPlatform = () => {
  switch (os.platform()) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'macos';
    case 'linux':
      return 'linux';
    default:
      throw new Error(
        `The current system "${require('node:os').platform()}" is not supported`
      );
  }
};
