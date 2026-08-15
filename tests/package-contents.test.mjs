import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('npm dry-run package contains only the audited adapter runtime files', () => {
  const command = process.platform === 'win32'
    ? (process.env.ComSpec ?? 'cmd.exe')
    : 'npm'
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', 'npm pack --json --dry-run']
    : ['pack', '--json', '--dry-run']
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    shell: false,
  })

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
    'vendor/swift-cycle/references/zh-CN.md',
  ])
})
