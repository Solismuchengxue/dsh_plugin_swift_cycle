import assert from 'node:assert/strict'
import { cp, mkdtemp, readFile, rm, unlink, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const implementationPath = path.join(repositoryRoot, 'index.js')

async function loadImplementation() {
  assert.ok(existsSync(implementationPath), 'index.js must implement snapshot verification')
  return import(pathToFileURL(implementationPath).href)
}

async function copyPackagedSnapshot() {
  const packageRoot = await mkdtemp(path.join(os.tmpdir(), 'dsh-swift-cycle-integrity-'))
  await cp(
    path.join(repositoryRoot, 'vendor'),
    path.join(packageRoot, 'vendor'),
    { recursive: true },
  )
  await cp(
    path.join(repositoryRoot, 'upstream.lock.json'),
    path.join(packageRoot, 'upstream.lock.json'),
  )
  return packageRoot
}

test('aggregate hash is stable across input order and hash casing', async () => {
  const { aggregateHash } = await loadImplementation()
  const entries = [
    {
      path: 'references/zh-CN.md',
      sha256: 'DDEC383EDFA8E419C0B098F6CF6FFC6F5A44C8A4A57084A0E22F222320FB1E0B',
    },
    {
      path: 'SKILL.md',
      sha256: '27CE135DF6ED459A869B10711CFAB431D2772FE806A775B1BC5882692A005B82',
    },
    {
      path: 'agents/openai.yaml',
      sha256: '2C28493E10C85A7710A5E774844BB0515F606C4506E5E8D5D12FA1BE21107898',
    },
  ]

  assert.equal(
    aggregateHash(entries),
    'e01de6fa081c12c7e481a219d3932e48a2e386f05202e7b8a6e51a0029fad686',
  )
})

test('packaged snapshot verifies the exact Swift Cycle v1.2.0 identity', async () => {
  const { verifyPackagedSnapshot } = await loadImplementation()
  const result = await verifyPackagedSnapshot({ packageRoot: repositoryRoot })

  assert.equal(result.lock.adapter.version, '0.1.1')
  assert.equal(result.lock.upstream.tag, 'v1.2.0')
  assert.equal(result.lock.upstream.commit, 'af3c5ddafba516c304613ea69081118fc234add7')
  assert.equal(result.lock.upstream.skillName, 'swift-cycle')
  assert.equal(
    result.payloadSha256,
    'e01de6fa081c12c7e481a219d3932e48a2e386f05202e7b8a6e51a0029fad686',
  )
})

test('packaged snapshot rejects a tampered file', async (t) => {
  const { verifyPackagedSnapshot } = await loadImplementation()
  const packageRoot = await copyPackagedSnapshot()
  t.after(() => rm(packageRoot, { recursive: true, force: true }))
  const skillPath = path.join(packageRoot, 'vendor', 'swift-cycle', 'SKILL.md')
  const original = await readFile(skillPath, 'utf8')
  await writeFile(skillPath, `${original}\nchanged\n`, 'utf8')

  await assert.rejects(
    verifyPackagedSnapshot({ packageRoot }),
    /hash mismatch.*SKILL\.md/i,
  )
})

test('packaged snapshot rejects missing and extra files', async (t) => {
  const { verifyPackagedSnapshot } = await loadImplementation()
  const missingRoot = await copyPackagedSnapshot()
  const extraRoot = await copyPackagedSnapshot()
  t.after(() => Promise.all([
    rm(missingRoot, { recursive: true, force: true }),
    rm(extraRoot, { recursive: true, force: true }),
  ]))

  await unlink(path.join(missingRoot, 'vendor', 'swift-cycle', 'references', 'zh-CN.md'))
  await writeFile(
    path.join(extraRoot, 'vendor', 'swift-cycle', 'unexpected.txt'),
    'unexpected',
    'utf8',
  )

  await assert.rejects(
    verifyPackagedSnapshot({ packageRoot: missingRoot }),
    /snapshot file set mismatch/i,
  )
  await assert.rejects(
    verifyPackagedSnapshot({ packageRoot: extraRoot }),
    /snapshot file set mismatch/i,
  )
})

test('packaged snapshot rejects unsafe and duplicate lock paths', async (t) => {
  const { verifyPackagedSnapshot } = await loadImplementation()
  const unsafeRoot = await copyPackagedSnapshot()
  const duplicateRoot = await copyPackagedSnapshot()
  t.after(() => Promise.all([
    rm(unsafeRoot, { recursive: true, force: true }),
    rm(duplicateRoot, { recursive: true, force: true }),
  ]))

  const unsafeLockPath = path.join(unsafeRoot, 'upstream.lock.json')
  const unsafeLock = JSON.parse(await readFile(unsafeLockPath, 'utf8'))
  unsafeLock.files[0].path = '../outside.md'
  await writeFile(unsafeLockPath, `${JSON.stringify(unsafeLock, null, 2)}\n`, 'utf8')

  const duplicateLockPath = path.join(duplicateRoot, 'upstream.lock.json')
  const duplicateLock = JSON.parse(await readFile(duplicateLockPath, 'utf8'))
  duplicateLock.files.push({ ...duplicateLock.files[0] })
  await writeFile(duplicateLockPath, `${JSON.stringify(duplicateLock, null, 2)}\n`, 'utf8')

  await assert.rejects(
    verifyPackagedSnapshot({ packageRoot: unsafeRoot }),
    /unsafe snapshot path/i,
  )
  await assert.rejects(
    verifyPackagedSnapshot({ packageRoot: duplicateRoot }),
    /duplicate snapshot path/i,
  )
})

test('source verification compares an explicit checkout without mutating it', async (t) => {
  const { verifyPackagedSnapshot, verifySourceSnapshot } = await loadImplementation()
  const packaged = await verifyPackagedSnapshot({ packageRoot: repositoryRoot })
  const sourceRoot = await mkdtemp(path.join(os.tmpdir(), 'dsh-swift-cycle-source-'))
  t.after(() => rm(sourceRoot, { recursive: true, force: true }))
  await cp(path.join(repositoryRoot, 'vendor', 'swift-cycle'), sourceRoot, { recursive: true })

  const result = await verifySourceSnapshot({ sourceRoot, lock: packaged.lock })

  assert.equal(result.payloadSha256, packaged.payloadSha256)
})
