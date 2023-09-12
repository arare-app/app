import * as yaml from 'js-yaml'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import path from 'node:path'
import pkg from './package.json'
import UnoCSS from 'unocss/vite'
import react from '@vitejs/plugin-react'
import renderer from 'vite-plugin-electron-renderer'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'

function generateTSFromYml() {
  const file = path.join(__dirname, 'src', 'bc-env.yml')
  const content = yaml.load(readFileSync(file, 'utf8'))
  const ts = Object.entries(content).map(([key, value]) => `export const ${key} = '${value}'`)
  writeFileSync(path.join(__dirname, 'src', 'bc-env.ts'), ts.join('\n') + '\n')
}

generateTSFromYml()

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  rmSync('dist-electron', { recursive: true, force: true })

  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG

  return {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 5000,
      rollupOptions: {
        input: {
          main: path.join(__dirname, 'index.html'),
        },
      },
    },
    plugins: [
      UnoCSS(),
      react(),
      electron([
        {
          // Main-Process entry file of the Electron App.
          entry: 'electron/main/index.ts',
          onstart(options) {
            if (process.env.VSCODE_DEBUG) {
              console.log(/* For `.vscode/.debug.script.mjs` */ '[startup] Electron App')
            } else {
              options.startup()
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
          },
        },
        {
          entry: 'electron/preload/index.ts',
          onstart(options) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
            // instead of restarting the entire Electron App.
            options.reload()
          },
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
          },
        },
      ]),
      // Use Node.js API in the Renderer-process
      renderer(),
    ],
    server:
      process.env.VSCODE_DEBUG &&
      (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
        return {
          host: url.hostname,
          port: +url.port,
        }
      })(),
    clearScreen: false,
  }
})
