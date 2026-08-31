import assert from 'node:assert/strict'
import { cp, mkdtemp, readFile, rm, unlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import * as implementation from '../index.js'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function requiredFunction(name) {
  assert.equal(typeof implementation[name], 'function', `index.js must export ${name}()`)
  return implementation[name]
}

async function copyPackageFixture() {
  const packageRoot = await mkdtemp(path.join(os.tmpdir(), 'dsh-swift-cycle-plugin-'))
  await cp(path.join(repositoryRoot, 'vendor'), path.join(packageRoot, 'vendor'), { recursive: true })
  await cp(path.join(repositoryRoot, 'upstream.lock.json'), path.join(packageRoot, 'upstream.lock.json'))
  return packageRoot
}

function createContext() {
  const calls = []
  const disposer = () => {}
  return {
    calls,
    disposer,
    ctx: {
      skills: {
        register(skill) {
          calls.push(skill)
          return disposer
        },
      },
    },
  }
}

test('frontmatter parser returns the Skill identity and body without delimiters', () => {
  const extractBody = requiredFunction('extractBody')
  const parsed = extractBody('---\nname: swift-cycle\ndescription: Manual workflow.\nlicense: MIT\n---\n\n# Swift Cycle\n')

  assert.equal(parsed.name, 'swift-cycle')
  assert.equal(parsed.description, 'Manual workflow.')
  assert.equal(parsed.content, '\n# Swift Cycle\n')
})

test('frontmatter parser rejects missing boundaries and duplicate identity keys', () => {
  const extractBody = requiredFunction('extractBody')
  assert.throws(
    () => extractBody('name: swift-cycle\n# Swift Cycle\n'),
    /frontmatter must start/i,
  )
  assert.throws(
    () => extractBody('---\nname: swift-cycle\nname: other\ndescription: Manual.\n---\nbody\n'),
    /duplicate frontmatter key: name/i,
  )
})

test('packaged Skill exposes the exact user-only registration contract', async () => {
  const loadPackagedSkill = requiredFunction('loadPackagedSkill')
  const skill = await loadPackagedSkill()

  assert.equal(skill.name, 'swift-cycle')
  assert.match(skill.description, /^仅当用户显式调用 swift-cycle/)
  assert.equal(skill.source, 'bundled')
  assert.equal(skill.provider, 'dsh-plugin-swift-cycle')
  assert.deepEqual(skill.invocation, {
    modelInvocable: false,
    userInvocable: true,
  })
  assert.deepEqual(skill.resourceBase, {
    kind: 'directory',
    path: path.join(repositoryRoot, 'vendor', 'swift-cycle'),
  })
  assert.ok(!skill.content.startsWith('---'))
  for (const marker of [
    '## 调用与采用',
    '## 读取真实现场',
    '## 后台自动路由',
    '## 自动选择文档档位',
    '## 文档职责',
    '## 自动同步与收敛',
    '## 有限工作包',
    '## 何时请求决定',
    '## 验证与独立审查',
  ]) {
    assert.ok(skill.content.includes(marker), `missing capability marker: ${marker}`)
  }
  assert.match(skill.content, /docs\/blueprint\.md/)
  assert.deepEqual(skill.metadata, {
    upstreamRepository: 'https://github.com/Solismuchengxue/skill_swift_cycle',
    upstreamTag: 'v1.3.0',
    upstreamCommit: 'f6645dc2768132e48bb936147f40a954855e5ccf',
    adapterVersion: '0.1.3',
    payloadSha256: 'fccc61c3c9ce91f00e3fbd1238fdf945e7829f9ffa264a4ebc12ff34fc5c8fb0',
    registrationMetadataSha256: 'c71d5517575435f515204bf4314b4a62a002fab32ac8da925e99f468bb613009',
  })
})

test('plugin apply registers exactly one Skill and returns the registry disposer', async () => {
  const apply = requiredFunction('apply')
  const { calls, ctx, disposer } = createContext()

  const result = await apply(ctx)

  assert.equal(calls.length, 1)
  assert.equal(calls[0].name, 'swift-cycle')
  assert.deepEqual(calls[0].invocation, {
    modelInvocable: false,
    userInvocable: true,
  })
  assert.equal(result, disposer)
})

test('registration fails closed before calling the registry for a stale metadata lock', async (t) => {
  const registerPackagedSkill = requiredFunction('registerPackagedSkill')
  const packageRoot = await copyPackageFixture()
  t.after(() => rm(packageRoot, { recursive: true, force: true }))
  const lockPath = path.join(packageRoot, 'upstream.lock.json')
  const lock = JSON.parse(await readFile(lockPath, 'utf8'))
  lock.registrationMetadataSha256 = '0'.repeat(64)
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8')
  const { calls, ctx } = createContext()

  await assert.rejects(
    registerPackagedSkill(ctx, { packageRoot }),
    /registration metadata hash mismatch/i,
  )
  assert.equal(calls.length, 0)
})

test('registration fails closed before calling the registry when the Chinese reference is missing', async (t) => {
  const registerPackagedSkill = requiredFunction('registerPackagedSkill')
  const packageRoot = await copyPackageFixture()
  t.after(() => rm(packageRoot, { recursive: true, force: true }))
  await unlink(path.join(packageRoot, 'vendor', 'swift-cycle', 'references', 'zh-CN.md'))
  const { calls, ctx } = createContext()

  await assert.rejects(
    registerPackagedSkill(ctx, { packageRoot }),
    /snapshot file set mismatch/i,
  )
  assert.equal(calls.length, 0)
})

test('registration rejects a missing Harness skills service', async () => {
  const registerPackagedSkill = requiredFunction('registerPackagedSkill')
  await assert.rejects(
    registerPackagedSkill({}),
    /skills service is unavailable/i,
  )
})
