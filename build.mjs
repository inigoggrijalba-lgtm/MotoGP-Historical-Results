import esbuild from 'esbuild';
import fs from 'fs/promises';
import path from 'path';
// Fix: Import `exit` from `process` to resolve the TypeScript error "Property 'exit' does not exist on type 'Process'".
import { exit } from 'process';

const outdir = 'dist';

async function build() {
  // 1. Clean up and create the output directory
  await fs.rm(outdir, { recursive: true, force: true });
  await fs.mkdir(outdir, { recursive: true });

  // 2. Compile TypeScript/JSX into a single JavaScript file
  await esbuild.build({
    entryPoints: ['index.tsx'],
    bundle: true,
    outfile: path.join(outdir, 'bundle.js'),
    loader: { '.tsx': 'tsx' },
    define: { 'process.env.NODE_ENV': '"production"' },
    minify: true,
  });

  // 3. Prepare index.html for production
  let html = await fs.readFile('index.html', 'utf-8');
  // Replace the original module script with the compiled bundle
  html = html.replace(
    '<script type="module" src="/index.tsx"></script>',
    '<script src="./bundle.js"></script>'
  );
  await fs.writeFile(path.join(outdir, 'index.html'), html);
  
  console.log('Build finished successfully!');
}

build().catch((e) => {
  console.error(e);
  exit(1);
});