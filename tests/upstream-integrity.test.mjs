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
      path: 'SKILL.md',
      sha256: '0674BA6D22BBE0867613BB28FAE8759019D88B38B6DEBF326D38C315665968CB',
    },
    {
      path: 'templates/docs/review-packet.md',
      sha256: '34AC545FF4919F2E98D187241BC29CCCC879B241F17A061EAB8F22407A0CE591',
    },
    {
      path: 'agents/openai.yaml',
      sha256: '2C28493E10C85A7710A5E774844BB0515F606C4506E5E8D5D12FA1BE21107898',
    },
    {
      path: 'references/document-profiles.md',
      sha256: '8DE8D9FA08D1166CD260E4683F06D3D2DC875B48D3152CDBD9C1789AE535C6AF',
    },
    {
      path: 'references/zh-CN.md',
      sha256: '8E5B2D0F57F577703A294FD96FC1BB13AC7A8F2780FBB290E6CBBC712769B53C',
    },
    {
      path: 'templates/DESIGN.md',
      sha256: '02C34DA0C1DD7465379C69819F9577C0EDC21B5802C0DA0312B4EC6EC029EDC9',
    },
    {
      path: 'templates/TODO.md',
      sha256: '4B84B2785F3330297A45447630A91BBB6A4AC945EF7899AE7E43A9C56CED22B9',
    },
    {
      path: 'templates/docs/adr/ADR-NNN.md',
      sha256: '75CC54769A7389A3A3FB80FDCFD7475AC4BE7ED0449B92DE786A214223AB3C96',
    },
    {
      path: 'templates/docs/adr/README.md',
      sha256: 'DDDABA5926C7D4AD6D2ED75D640D77D18D35889A271D8784D706A4CCA0DBB158',
    },
    {
      path: 'templates/docs/architecture.md',
      sha256: '61AEFF94EFD245BA72FC8CD4E0F625627678EE018CE7BA21F578BD41F89FCD83',
    },
    {
      path: 'templates/docs/closeout-packet.md',
      sha256: 'F299BD76AE377B656761AA46F9722A4988F1EC9223B1096D67EE77B531EB15A3',
    },
    {
      path: 'templates/docs/evaluation.md',
      sha256: 'F7A07B77C95F19A56B63A06602B54861A49CF131301761FEF1D586FC11E3C48F',
    },
    {
      path: 'templates/docs/operations.md',
      sha256: 'B36A7A1271D1A1E3C3051B56CF8EEC2885BAF819A0D6EF4B3B1AC19D49B7BD6E',
    },
  ]

  assert.equal(
    aggregateHash(entries),
    'fff7094f40c291cc9e03aa96ad271ef110229aba2fb7afa322473949043e4c19',
  )
})

test('packaged snapshot verifies the exact Swift Cycle f383157 candidate identity', async () => {
  const { verifyPackagedSnapshot } = await loadImplementation()
  const result = await verifyPackagedSnapshot({ packageRoot: repositoryRoot })

  assert.equal(result.lock.adapter.version, '0.1.2')
  assert.equal(result.lock.upstream.tag, null)
  assert.equal(result.lock.upstream.commit, 'f383157fce7d179f29de867605d16e01b64366c8')
  assert.equal(result.lock.upstream.skillName, 'swift-cycle')
  assert.equal(
    result.payloadSha256,
    'fff7094f40c291cc9e03aa96ad271ef110229aba2fb7afa322473949043e4c19',
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
