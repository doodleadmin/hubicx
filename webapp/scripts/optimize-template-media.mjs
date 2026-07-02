import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'app', 'assets', 'templates');

function findCoverVideos(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return findCoverVideos(path);
    return entry.name === 'cover.mp4' ? [path] : [];
  });
}

for (const source of findCoverVideos(root)) {
  const output = join(dirname(source), 'cover.optimized.mp4');
  const poster = join(dirname(source), 'cover.webp');
  if (existsSync(poster)) continue;
  if (existsSync(output)) rmSync(output);
  const before = statSync(source).size;

  execFileSync(ffmpegPath, [
    '-y', '-i', source,
    '-an', '-vf', 'scale=w=min(720\\,iw):h=-2,fps=24',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '29', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', output,
  ], { stdio: 'ignore' });

  execFileSync(ffmpegPath, [
    '-y', '-ss', '0.15', '-i', output, '-frames:v', '1',
    '-vf', 'scale=w=min(480\\,iw):h=-2',
    '-c:v', 'libwebp', '-quality', '76', poster,
  ], { stdio: 'ignore' });

  rmSync(source);
  renameSync(output, source);
  const after = statSync(source).size;
  console.log(`${relative(root, source)}: ${(before / 1048576).toFixed(2)} MB -> ${(after / 1048576).toFixed(2)} MB`);
}
