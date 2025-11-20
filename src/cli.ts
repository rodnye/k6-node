import { getK6BinaryPath } from './k6path';
import { spawn } from 'child_process';

{
  let d = console["debug"];
  console["debug"] = (...a) => process.env.DEBUG && d("[DEBUG]: ", ...a);
}

const main = async () => {
  try {
    const bin = await getK6BinaryPath();

    let args;
    if (process.argv0 === 'node') {
      args = process.argv.slice(2);
    } else {
      args = process.argv.slice(1);
    }

    console.debug(`-> Command: ${bin} ${args.join(' ')}`);

    const childProcess = spawn(bin, args, {
      stdio: 'inherit',
    });

    childProcess.on('close', (code) => {
      process.exit(code);
    });

    childProcess.on('error', (error) => {
      console.error('Error ejecutando k6:', error);
      process.exit(1);
    });
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
      process.exit(1);
    }
    throw e;
  }
};

main();
