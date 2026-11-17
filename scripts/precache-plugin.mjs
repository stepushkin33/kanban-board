import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const workerSource = fileURLToPath(new URL('../public/service-worker.js', import.meta.url))

export class PrecachePlugin {
  apply(compiler) {
    const pluginName = 'PrecachePlugin'
    const { Compilation, sources } = compiler.webpack

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.fileDependencies.add(workerSource)
      compilation.hooks.processAssets.tap({ name: pluginName, stage: Compilation.PROCESS_ASSETS_STAGE_REPORT }, () => {
        const script = readFileSync(workerSource, 'utf8')
        const assets = compilation
          .getAssets()
          .filter(
            ({ name }) =>
              name === 'index.html' || name === 'favicon.svg' || (name.startsWith('assets/') && !name.endsWith('.txt')),
          )
          .sort((first, second) => first.name.localeCompare(second.name))
        const hash = createHash('sha256').update(script)

        for (const { name, source } of assets) {
          hash.update(name).update(source.buffer())
        }

        const precache = {
          revision: hash.digest('hex').slice(0, 16),
          files: assets.map(({ name }) => name),
        }

        compilation.emitAsset(
          'service-worker.js',
          new sources.RawSource(`const precache = ${JSON.stringify(precache)}\n${script}`),
        )
      })
    })
  }
}
