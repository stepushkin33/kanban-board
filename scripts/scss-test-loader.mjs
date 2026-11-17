import { fileURLToPath } from 'node:url'
import { compile } from 'sass'

export async function load(url, context, nextLoad) {
  if (!url.endsWith('.module.scss')) return nextLoad(url, context)

  // DOM tests need the local class names. The browser renders the compiled styles.
  const { css } = compile(fileURLToPath(url))
  const names = [...css.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((match) => match[1])
  const classes = Object.fromEntries(names.map((name) => [name, name]))
  return { format: 'module', source: `export default ${JSON.stringify(classes)}`, shortCircuit: true }
}
