import fs from 'node:fs';
import path from 'node:path';

export const extractFile = async (
  filePath: string,
  outputDir: string,
  platform: string
) => {
  try {
    console.log('Extracting artifact...');
    
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    if (filePath.endsWith('.zip')) {
      await (await import('zip-lib')).extract(filePath, outputDir);
    } else if (filePath.endsWith('.tar.gz')) {
      (await import('tar')).extract({
        sync: true,
        file: filePath,
        cwd: outputDir,
      });
    }

    // Find k6 binary in the extracted directory
    const findBinary = (dir: string) => {
      const files = fs.readdirSync(dir, { recursive: true }) as string[];
      console.log(files)
      const binaryName = platform === 'windows' ? 'k6.exe' : 'k6';
      const binaryPath = files.find(
        (file) => typeof file === 'string' && file.endsWith(binaryName)
      );
      if (!binaryPath)
        throw new Error('k6 executable not found! Try reinstall');

      return path.join(dir, binaryPath);
    };

    const binaryPath = findBinary(outputDir);

    if (platform !== 'windows') {
      fs.chmodSync(binaryPath, 0o755);
    }

    // move binary to the correct path
    const finalPath = path.join(
      path.dirname(outputDir),
      platform === 'windows' ? 'k6.exe' : 'k6'
    );
    fs.renameSync(binaryPath, finalPath);

    //clear temp
    fs.unlinkSync(filePath);
    fs.rmSync(outputDir, { recursive: true, force: true });

    return finalPath;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Extraction error: ${error.message}`);
    }
    throw error;
  }
};
