import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function runNpm(args) {
  const command = process.platform === 'win32'
    ? (process.env.ComSpec ?? 'cmd.exe')
    : 'npm'
  const commandArgs = process.platform === 'win32'
    ? ['/d', '/s', '/c', [
        'npm',
        ...args.map((value) => /[\s&()^|<>]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value),
      ].join(' ')]
    : args
  return spawnSync(command, commandArgs, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    shell: false,
  })
}

test('npm dry-run package contains only the audited adapter runtime files', () => {
  const result = runNpm(['pack', '--json', '--dry-run'])

  assert.equal(result.error, undefined, result.error?.message)
  assert.equal(result.status, 0, result.stderr || result.stdout)
  const report = JSON.parse(result.stdout)
  assert.equal(report.length, 1)
  const files = report[0].files.map((entry) => entry.path).sort()
  assert.deepEqual(files, [
    'LICENSE',
    'README.md',
    'cordis.patch.yml',
    'index.js',
    'package.json',
    'upstream.lock.json',
    'vendor/swift-cycle/SKILL.md',
    'vendor/swift-cycle/agents/openai.yaml',
    'vendor/swift-cycle/references/document-profiles.md',
    'vendor/swift-cycle/references/zh-CN.md',
    'vendor/swift-cycle/templates/DESIGN.md',
    'vendor/swift-cycle/templates/TODO.md',
    'vendor/swift-cycle/templates/docs/adr/ADR-NNN.md',
    'vendor/swift-cycle/templates/docs/adr/README.md',
    'vendor/swift-cycle/templates/docs/architecture.md',
    'vendor/swift-cycle/templates/docs/closeout-packet.md',
    'vendor/swift-cycle/templates/docs/evaluation.md',
    'vendor/swift-cycle/templates/docs/operations.md',
    'vendor/swift-cycle/templates/docs/review-packet.md',
  ])
})

test('packed artifact verifies its embedded Swift Cycle snapshot after extraction', async (t) => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'dsh-swift-cycle-pack-'))
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }))
  const result = runNpm(['pack', '--json', '--pack-destination', temporaryRoot])
  assert.equal(result.error, undefined, result.error?.message)
  assert.equal(result.status, 0, result.stderr || result.stdout)
  const report = JSON.parse(result.stdout)
  const archivePath = path.join(temporaryRoot, report[0].filename)
  const extractRoot = path.join(temporaryRoot, 'extract')
  await mkdir(extractRoot)

  const extracted = spawnSync('tar', ['-xzf', archivePath, '-C', extractRoot], {
    encoding: 'utf8',
    shell: false,
  })
  assert.equal(extracted.error, undefined, extracted.error?.message)
  assert.equal(extracted.status, 0, extracted.stderr || extracted.stdout)

  const extractedPackage = path.join(extractRoot, 'package')
  const entrypoint = await import(pathToFileURL(path.join(extractedPackage, 'index.js')).href)
  const verified = await entrypoint.verifyPackagedSnapshot({ packageRoot: extractedPackage })
  const license = await readFile(path.join(extractedPackage, 'LICENSE'), 'utf8')

  assert.equal(
    verified.payloadSha256,
    'fff7094f40c291cc9e03aa96ad271ef110229aba2fb7afa322473949043e4c19',
  )
  assert.ok(!license.includes('\r'), 'packed LICENSE must use LF line endings')
})
