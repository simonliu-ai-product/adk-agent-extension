
import archiver from 'archiver';
import { createWriteStream, existsSync, mkdirSync, lstatSync } from 'fs';
import minimist from 'minimist';
import path from 'path';

const argv = minimist(process.argv.slice(2));
const platform = argv.platform;
const arch = argv.arch;
const name = 'adk-agent-extension';
const extension = platform === 'win32' ? 'zip' : 'tar.gz';
const archiveName = `${platform}.${arch}.${name}.${extension}`;
const releaseDir = 'release';

if (!existsSync(releaseDir)) {
  mkdirSync(releaseDir);
}

const output = createWriteStream(path.join(releaseDir, archiveName));
const archive = archiver(platform === 'win32' ? 'zip' : 'tar', {
  gzip: platform !== 'win32',
  zlib: { level: 9 }
});

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

const filesToPackage = [
  'dist',
  'gemini-extension.json',
  'GEMINI.md',
  'LICENSE',
  'package.json',
  'package-lock.json',
  'README_zhtw.md',
  'README.md',
  'commands',
  'node_modules'
];

for (const fileOrDir of filesToPackage) {
    if (existsSync(fileOrDir)) {
        if (lstatSync(fileOrDir).isDirectory()) {
            archive.directory(fileOrDir, fileOrDir);
        } else {
            archive.file(fileOrDir, { name: fileOrDir });
        }
    }
}

archive.finalize();
