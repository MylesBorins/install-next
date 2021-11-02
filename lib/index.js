import { spawn } from 'child_process';
import { once } from 'events';

import which from 'which';

// From CITGM
function spawnWrap(cmd, args, options) {
  if (process.platform === 'win32') {
    if (cmd === 'node') {
      cmd = args[0];
      args = args.slice(1);
    }
    if (cmd.endsWith('js')) {
      args = [cmd].concat(args);
      cmd = process.execPath;
    } else {
      // The /C option is capitalized to make tests work. Specifically, this
      // allows to bypass an issue in https://github.com/tapjs/spawn-wrap used
      // by https://github.com/istanbuljs/nyc to track code coverage.
      // The problem is that `mungeCmd()` (
      // https://github.com/tapjs/spawn-wrap/blob/7931ab5c/index.js#L143)
      // incorrectly replaces `spawn()` args.
      args = ['/C', cmd].concat(args).map((arg) => {
        return arg.replace(/\^/g, '^^^^');
      });
      cmd = 'cmd';
    }
  }
  return spawn(cmd, args, options);
}

async function install(args) {
  const packageManagerBin = await which('npm');

  let cmd = [
    'install',
    '--no-audit',
    '--no-fund',
    '--loglevel=error',
    ...args
  ];

  const proc = spawnWrap(packageManagerBin, cmd, {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  await Promise.race([
    once(proc, 'close'),
    once(proc, 'error')
  ]);
}

export {
  install
}
