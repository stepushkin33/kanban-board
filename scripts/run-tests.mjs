import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import * as nodeModule from 'node:module'
import { join } from 'node:path'

const testFiles = readdirSync('src', { recursive: true })
  .filter((path) => /\.test\.tsx?$/.test(path))
  .map((path) => join('src', path))
  .sort()

if (testFiles.length === 0) throw new Error('No test files found')

// Node 18.18 uses the loader flag, while newer runtimes register the loader during import.
const loaderFlag = typeof nodeModule.register === 'function' ? '--import' : '--loader'
const run = spawnSync(process.execPath, [loaderFlag, 'tsx', '--test', ...testFiles], { stdio: 'inherit' })
if (run.error) throw run.error
process.exitCode = run.status ?? 1
