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
      sha256: '9D86791F33542B64DA60778E2D1791B416D8E65CC5888D2499FB4D86952A82BB',
    },
    {
      path: 'agents/openai.yaml',
      sha256: 'EB0A93318D2781E5B2953A2E8277F520CCA9E94BE3DA066200C0BE74D8BAABE4',
    },
    {
      path: 'references/adoption-and-routing.md',
      sha256: '5A66966B5942870F18826BA7B14DDB380EE32BA0D2DE97CA1197C5E72919A1D0',
    },
    {
      path: 'references/document-information-architecture.md',
      sha256: '36480EDB387BC073119A1850DD4E40D917FC134E3627EC7037D59EC128F62DD5',
    },
    {
      path: 'references/document-profiles.md',
      sha256: '6283D824E4762FDBDB2D711563DE674F9C5E97D74B9DE32CE797216E0AB4F852',
    },
    {
      path: 'references/governance-boundaries.md',
      sha256: '6D3B42850235DDC7D9F0D93FC4A43F05D72AA112627BFEC8102B45954FA60A89',
    },
    {
      path: 'references/lifecycle-and-closeout.md',
      sha256: 'CEC4D8765EB8D3D1B0D8CAA011A617F6082927A23B7018C1B2B56BEF69132ED5',
    },
    {
      path: 'references/zh-CN.md',
      sha256: 'CC0C039E0BE92AEBA9C4B69C25FA8F5B97682BB0EC29CBDBF6EDB227FE240FBB',
    },
    {
      path: 'templates/BLUEPRINT.md',
      sha256: '8B0F030A0EF2B04C086E4BBAF0F2589350FBF6455A9DD7B4888176E3A834926C',
    },
    {
      path: 'templates/DESIGN.md',
      sha256: '60D7905F71DC4D05FE4E3FADE23DC858D7356343A64048BC93FE9674571C2371',
    },
    {
      path: 'templates/DEVLOG.md',
      sha256: '553354A0898AE36550B0B20B6489EB16825966C012039D3CEAFFC525AECD011F',
    },
    {
      path: 'templates/TODO.md',
      sha256: 'C543099CE0E9A95B31496D6F189CF180B5FAD3977A9C7DC82113992A39CB5F81',
    },
    {
      path: 'templates/docs/README.md',
      sha256: '7C7EDEEF5CAE9BA14420454013275D8EFA949F2DFC314AF217FE517F6C1643F5',
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
      sha256: 'ACE719EF636D8D2A5F34FFBE51C1E4DC6AFF91DA61433BD1A495D089D86E5B7B',
    },
    {
      path: 'templates/docs/closeout-packet.md',
      sha256: 'F299BD76AE377B656761AA46F9722A4988F1EC9223B1096D67EE77B531EB15A3',
    },
    {
      path: 'templates/docs/evaluation.md',
      sha256: '568DB36F2DCE8B7C3AFAAEA76B4680233F6C3DA165485F8EB0E45F07E72698A4',
    },
    {
      path: 'templates/docs/operations.md',
      sha256: '85891C3DC7B6C3787575180E871FFFFD60ADC2FDB2DA469DEA1DAE826F898FC1',
    },
    {
      path: 'templates/docs/review-packet.md',
      sha256: '34AC545FF4919F2E98D187241BC29CCCC879B241F17A061EAB8F22407A0CE591',
    },
  ]

  assert.equal(
    aggregateHash(entries),
    'fccc61c3c9ce91f00e3fbd1238fdf945e7829f9ffa264a4ebc12ff34fc5c8fb0',
  )
})

test('packaged snapshot verifies the exact Swift Cycle v1.3.0 identity', async () => {
  const { verifyPackagedSnapshot } = await loadImplementation()
  const result = await verifyPackagedSnapshot({ packageRoot: repositoryRoot })

  assert.equal(result.lock.adapter.version, '0.1.3')
  assert.equal(result.lock.upstream.tag, 'v1.3.0')
  assert.equal(result.lock.upstream.commit, 'f6645dc2768132e48bb936147f40a954855e5ccf')
  assert.equal(result.lock.upstream.skillName, 'swift-cycle')
  assert.equal(
    result.payloadSha256,
    'fccc61c3c9ce91f00e3fbd1238fdf945e7829f9ffa264a4ebc12ff34fc5c8fb0',
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
