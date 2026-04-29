import { Command } from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import { findProjectRoot } from '../core/paths'
import { loadJson, looksLikeLocalPath, discoverJsonFiles } from '../core/loader'

const GREEN = '\x1b[92m'
const DIM = '\x1b[2m'
const RESET = '\x1b[0m'
const RED = '\x1b[91m'

function inlineRefs(rootObj: any, depth: number = 0, stack: string[] = [], projectRoot: string): any {
  if (rootObj === null || typeof rootObj !== 'object') {
    return rootObj
  }

  if (Array.isArray(rootObj)) {
    return rootObj.map((item) => inlineRefs(item, depth + 1, stack, projectRoot))
  }

  if ('$missing' in rootObj || '$circular_ref' in rootObj) {
    return rootObj
  }

  if ('$ref' in rootObj && Object.keys(rootObj).length === 1) {
    const refPath = rootObj.$ref
    if (!looksLikeLocalPath(refPath)) {
      return rootObj
    }
    if (stack.includes(refPath)) {
      return { $circular_ref: refPath }
    }

    console.log(`${'  '.repeat(depth)}→ ${refPath}`)
    const loaded = loadJson(refPath, projectRoot)
    if (loaded === null) {
      return { $missing: refPath }
    }
    return inlineRefs(loaded, depth, [...stack, refPath], projectRoot)
  }

  const result: any = {}
  for (const [k, v] of Object.entries(rootObj)) {
    result[k] = inlineRefs(v, depth + 1, stack, projectRoot)
  }
  return result
}

function injectData(skeleton: any, projectRoot: string): any {
  const collections = {
    factor_paradigms: discoverJsonFiles(path.join(projectRoot, 'data', 'factor_paradigms'), 'data/factor_paradigms'),
    probability_matrix: discoverJsonFiles(path.join(projectRoot, 'data', 'probability_matrix'), 'data/probability_matrix'),
  }

  const acu = (skeleton.acu = skeleton.acu || {})
  const dataSection = (acu.data = acu.data || {})

  for (const [collName, entries] of Object.entries(collections)) {
    if (Object.keys(entries).length > 0) {
      const existing = dataSection[collName] || {}
      Object.assign(existing, entries)
      dataSection[collName] = existing
    }
  }

  return skeleton
}

export function createComposeCommand(): Command {
  const command = new Command('compose')

  command
    .description('compose the modular ACU spec into a single acu.json')
    .option('--skeleton <path>', 'Path to the skeleton JSON (default: acu.json)')
    .option('--output <path>', 'Path for composed output (default: dist/acu.json)')
    .option('--write', 'Write the composed output to file')
    .action(async (options: any) => {
      const projectRoot = findProjectRoot()
      const defaultSkel = 'acu.json'
      const defaultOut = 'dist/acu.json'

      const skelPath = options.skeleton || path.join(projectRoot, defaultSkel)
      const outPath = options.output || path.join(projectRoot, defaultOut)

      if (!fs.existsSync(skelPath)) {
        console.error(`${RED}Error:${RESET} skeleton not found: ${skelPath}`)
        process.exit(1)
      }

      console.log(`${DIM}Loading skeleton:${RESET} ${path.relative(projectRoot, skelPath)}`)
      const skeleton = loadJson(skelPath)

      const skeletonWithData = injectData(skeleton, projectRoot)
      const composed = inlineRefs(skeletonWithData, 0, [], projectRoot)

      if (options.write) {
        const outDir = path.dirname(outPath)
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true })
        }
        fs.writeFileSync(outPath, JSON.stringify(composed, null, 2) + '\n')
        const stats = fs.statSync(outPath)
        console.log(`\n${GREEN}✓${RESET} Wrote ${path.relative(projectRoot, outPath)} (${stats.size} bytes)`)
      } else {
        console.log(JSON.stringify(composed, null, 2))
        console.log(`\n${DIM}(Dry run — use --write to save)${RESET}`)
      }
    })

  return command
}
