import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const expectedFiles = [
  'SKILL.md',
  'agents/openai.yaml',
  'references/adoption-and-routing.md',
  'references/document-information-architecture.md',
  'references/document-profiles.md',
  'references/governance-boundaries.md',
  'references/lifecycle-and-closeout.md',
  'references/zh-CN.md',
  'templates/BLUEPRINT.md',
  'templates/DESIGN.md',
  'templates/DEVLOG.md',
  'templates/TODO.md',
  'templates/docs/README.md',
  'templates/docs/adr/ADR-NNN.md',
  'templates/docs/adr/README.md',
  'templates/docs/architecture.md',
  'templates/docs/closeout-packet.md',
  'templates/docs/evaluation.md',
  'templates/docs/operations.md',
  'templates/docs/review-packet.md',
]
const sha256Pattern = /^[0-9a-f]{64}$/i
const providerName = 'dsh-plugin-swift-cycle'
const invocation = Object.freeze({
  modelInvocable: false,
  userInvocable: true,
})

export const name = providerName
export const inject = ['skills']

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function compareCodePoints(left, right) {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

function normalizeSnapshotPath(value) {
  if (
    typeof value !== 'string'
    || value.length === 0
    || value.includes('\\')
    || path.posix.isAbsolute(value)
  ) {
    throw new Error(`unsafe snapshot path: ${String(value)}`)
  }

  const normalized = path.posix.normalize(value)
  if (normalized === '.' || normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`unsafe snapshot path: ${value}`)
  }
  return normalized
}

function validateLock(lock) {
  if (!lock || typeof lock !== 'object' || Array.isArray(lock)) {
    throw new Error('upstream lock must be an object')
  }
  if (lock.schemaVersion !== 1) {
    throw new Error('unsupported upstream lock schema')
  }
  if (lock.adapter?.name !== 'dsh-plugin-swift-cycle' || lock.adapter?.version !== '0.1.3') {
    throw new Error('unexpected adapter identity in upstream lock')
  }
  if (
    lock.upstream?.repository !== 'https://github.com/Solismuchengxue/skill_swift_cycle'
    || lock.upstream?.tag !== 'v1.3.0'
    || lock.upstream?.commit !== 'f6645dc2768132e48bb936147f40a954855e5ccf'
    || lock.upstream?.skillName !== 'swift-cycle'
  ) {
    throw new Error('unexpected Swift Cycle identity in upstream lock')
  }
  if (!Array.isArray(lock.files)) {
    throw new Error('upstream lock files must be an array')
  }
  if (!sha256Pattern.test(lock.payloadSha256 ?? '')) {
    throw new Error('invalid payload SHA-256 in upstream lock')
  }
  if (!sha256Pattern.test(lock.registrationMetadataSha256 ?? '')) {
    throw new Error('invalid registration metadata SHA-256 in upstream lock')
  }

  const seen = new Set()
  const files = lock.files.map((entry) => {
    const normalizedPath = normalizeSnapshotPath(entry?.path)
    const key = normalizedPath.toLowerCase()
    if (seen.has(key)) {
      throw new Error(`duplicate snapshot path: ${normalizedPath}`)
    }
    seen.add(key)
    if (!sha256Pattern.test(entry?.sha256 ?? '')) {
      throw new Error(`invalid file SHA-256: ${normalizedPath}`)
    }
    return { path: normalizedPath, sha256: entry.sha256.toLowerCase() }
  })

  const actualPaths = files.map((entry) => entry.path).sort(compareCodePoints)
  const requiredPaths = [...expectedFiles].sort(compareCodePoints)
  if (JSON.stringify(actualPaths) !== JSON.stringify(requiredPaths)) {
    throw new Error('upstream lock file set mismatch')
  }

  return { ...lock, files }
}

async function listSnapshotFiles(root, relativeDirectory = '') {
  const currentDirectory = path.join(root, ...relativeDirectory.split('/').filter(Boolean))
  const entries = await readdir(currentDirectory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const relativePath = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name
    if (entry.isSymbolicLink()) {
      throw new Error(`snapshot must not contain symbolic links: ${relativePath}`)
    }
    if (entry.isDirectory()) {
      files.push(...await listSnapshotFiles(root, relativePath))
    } else if (entry.isFile()) {
      files.push(relativePath)
    } else {
      throw new Error(`snapshot contains unsupported entry: ${relativePath}`)
    }
  }

  return files.sort(compareCodePoints)
}

async function verifySnapshotRoot(snapshotRoot, lock) {
  const normalizedLock = validateLock(lock)
  const actualFiles = await listSnapshotFiles(snapshotRoot)
  const lockedFiles = normalizedLock.files
    .map((entry) => entry.path)
    .sort(compareCodePoints)

  if (JSON.stringify(actualFiles) !== JSON.stringify(lockedFiles)) {
    throw new Error('snapshot file set mismatch')
  }

  const verifiedFiles = []
  for (const entry of normalizedLock.files) {
    const filePath = path.join(snapshotRoot, ...entry.path.split('/'))
    const actualHash = await sha256File(filePath)
    if (actualHash !== entry.sha256) {
      throw new Error(`hash mismatch for ${entry.path}`)
    }
    verifiedFiles.push({ path: entry.path, sha256: actualHash })
  }

  const payloadSha256 = aggregateHash(verifiedFiles)
  if (payloadSha256 !== normalizedLock.payloadSha256) {
    throw new Error('payload hash mismatch')
  }

  return {
    lock: normalizedLock,
    files: verifiedFiles,
    payloadSha256,
    snapshotRoot,
  }
}

export async function sha256File(filePath) {
  return sha256(await readFile(filePath))
}

export function aggregateHash(entries) {
  const normalizedEntries = entries.map((entry) => {
    const normalizedPath = normalizeSnapshotPath(entry?.path)
    if (!sha256Pattern.test(entry?.sha256 ?? '')) {
      throw new Error(`invalid file SHA-256: ${normalizedPath}`)
    }
    return { path: normalizedPath, sha256: entry.sha256.toLowerCase() }
  })
  normalizedEntries.sort((left, right) => {
    const byLowercasePath = compareCodePoints(left.path.toLowerCase(), right.path.toLowerCase())
    return byLowercasePath || compareCodePoints(left.path, right.path)
  })
  const payload = normalizedEntries
    .map((entry) => `${entry.path}\0${entry.sha256}\n`)
    .join('')
  return sha256(Buffer.from(payload, 'utf8'))
}

export async function verifyPackagedSnapshot(options = {}) {
  const resolvedPackageRoot = path.resolve(options.packageRoot ?? packageRoot)
  const lockPath = path.join(resolvedPackageRoot, 'upstream.lock.json')
  const snapshotRoot = path.join(resolvedPackageRoot, 'vendor', 'swift-cycle')
  const lock = JSON.parse(await readFile(lockPath, 'utf8'))
  return verifySnapshotRoot(snapshotRoot, lock)
}

export async function verifySourceSnapshot({ sourceRoot, lock }) {
  if (typeof sourceRoot !== 'string' || sourceRoot.length === 0) {
    throw new Error('sourceRoot is required')
  }
  return verifySnapshotRoot(path.resolve(sourceRoot), lock)
}

export function extractBody(skillText) {
  if (typeof skillText !== 'string') {
    throw new TypeError('Skill content must be a string')
  }
  const normalized = skillText.replaceAll('\r\n', '\n')
  if (!normalized.startsWith('---\n')) {
    throw new Error('Skill frontmatter must start with ---')
  }
  const endMarker = '\n---\n'
  const endIndex = normalized.indexOf(endMarker, 4)
  if (endIndex === -1) {
    throw new Error('Skill frontmatter must end with ---')
  }

  const fields = new Map()
  for (const line of normalized.slice(4, endIndex).split('\n')) {
    if (line.trim() === '') continue
    const separator = line.indexOf(':')
    if (separator <= 0 || line.startsWith(' ') || line.startsWith('\t')) {
      throw new Error(`unsupported Skill frontmatter line: ${line}`)
    }
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    if (fields.has(key)) {
      throw new Error(`duplicate frontmatter key: ${key}`)
    }
    if (value.length === 0) {
      throw new Error(`empty frontmatter value: ${key}`)
    }
    fields.set(key, value)
  }

  const skillName = fields.get('name')
  const description = fields.get('description')
  if (typeof skillName !== 'string' || typeof description !== 'string') {
    throw new Error('Skill frontmatter requires name and description')
  }

  return {
    name: skillName,
    description,
    content: normalized.slice(endIndex + endMarker.length),
  }
}

function registrationIdentity({ lock, name: skillName, description }) {
  return {
    name: skillName,
    description,
    source: 'bundled',
    provider: providerName,
    invocation,
    upstream: {
      repository: lock.upstream.repository,
      tag: lock.upstream.tag,
      commit: lock.upstream.commit,
    },
    adapterVersion: lock.adapter.version,
    payloadSha256: lock.payloadSha256,
  }
}

export async function loadPackagedSkill(options = {}) {
  const verified = await verifyPackagedSnapshot(options)
  const skillPath = path.join(verified.snapshotRoot, 'SKILL.md')
  const parsed = extractBody(await readFile(skillPath, 'utf8'))
  if (parsed.name !== verified.lock.upstream.skillName) {
    throw new Error(`unexpected packaged Skill name: ${parsed.name}`)
  }

  const identity = registrationIdentity({
    lock: verified.lock,
    name: parsed.name,
    description: parsed.description,
  })
  const registrationMetadataSha256 = sha256(
    Buffer.from(JSON.stringify(identity), 'utf8'),
  )
  if (registrationMetadataSha256 !== verified.lock.registrationMetadataSha256) {
    throw new Error('registration metadata hash mismatch')
  }

  return {
    name: parsed.name,
    description: parsed.description,
    source: 'bundled',
    provider: providerName,
    invocation: { ...invocation },
    resourceBase: {
      kind: 'directory',
      path: verified.snapshotRoot,
    },
    content: parsed.content,
    metadata: {
      upstreamRepository: verified.lock.upstream.repository,
      upstreamTag: verified.lock.upstream.tag,
      upstreamCommit: verified.lock.upstream.commit,
      adapterVersion: verified.lock.adapter.version,
      payloadSha256: verified.payloadSha256,
      registrationMetadataSha256,
    },
  }
}

export async function registerPackagedSkill(ctx, options = {}) {
  if (typeof ctx?.skills?.register !== 'function') {
    throw new Error('DeepSeek Harness skills service is unavailable')
  }
  const skill = await loadPackagedSkill(options)
  return ctx.skills.register(skill)
}

export async function apply(ctx) {
  return registerPackagedSkill(ctx)
}
