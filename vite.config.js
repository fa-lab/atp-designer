import vue from '@vitejs/plugin-vue';
import * as child from 'child_process';
import path from 'path';
import { defineConfig } from 'vite';

const commitHash = child.execSync('git rev-parse --short HEAD').toString().trim();

export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash)
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
