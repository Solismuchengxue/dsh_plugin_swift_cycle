import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repositoryRoot, relativePath), 'utf8'))
}

test('package manifest exposes the minimal DeepSeek Harness bundle contract', async () => {
  const manifest = await readJson('package.json')

  assert.equal(manifest.name, 'dsh-plugin-swift-cycle')
  assert.equal(manifest.version, '0.1.4')
  assert.equal(manifest.private, false)
  assert.equal(manifest.type, 'module')
  assert.equal(manifest.main, 'index.js')
  assert.deepEqual(manifest.files, [
    'index.js',
    'cordis.patch.yml',
    'vendor',
    'upstream.lock.json',
    'README.md',
    'LICENSE',
  ])
  assert.deepEqual(manifest.engines, { node: '>=20' })
  assert.deepEqual(manifest.dsh, { bundle: { patch: './cordis.patch.yml' } })
  assert.deepEqual(manifest.scripts, {
    test: 'node --test tests/*.test.mjs',
    'verify:upstream': 'node scripts/verify-upstream.mjs',
    'pack:dry-run': 'npm pack --json --dry-run',
  })
})

test('package manifest has no runtime dependencies or install lifecycle scripts', async () => {
  const manifest = await readJson('package.json')
  const prohibitedScripts = ['preinstall', 'install', 'postinstall', 'prepare']

  assert.equal(manifest.dependencies, undefined)
  for (const script of prohibitedScripts) {
    assert.equal(manifest.scripts?.[script], undefined, `${script} must not be defined`)
  }
})

test('Cordis patch inserts only the Swift Cycle adapter plugin', async () => {
  const patch = await readFile(path.join(repositoryRoot, 'cordis.patch.yml'), 'utf8')

  assert.equal(
    patch.replaceAll('\r\n', '\n'),
    '- insert:\n    - id: swift-cycle\n      name: dsh-plugin-swift-cycle\n',
  )
})
