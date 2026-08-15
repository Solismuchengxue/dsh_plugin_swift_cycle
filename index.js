import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const expectedFiles = [
  'SKILL.md',
  'agents/openai.yaml',
  'references/zh-CN.md',
]
const sha256Pattern = /^[0-9a-f]{64}$/i

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
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
  if (lock.adapter?.name !== 'dsh-plugin-swift-cycle' || lock.adapter?.version !== '0.1.0') {
    throw new Error('unexpected adapter identity in upstream lock')
  }
  if (
    lock.upstream?.repository !== 'https://github.com/Solismuchengxue/skill_swift_cycle'
    || lock.upstream?.tag !== 'v1.2.0'
    || lock.upstream?.commit !== 'af3c5ddafba516c304613ea69081118fc234add7'
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

  const actualPaths = files.map((entry) => entry.path).sort((a, b) => a.localeCompare(b))
  const requiredPaths = [...expectedFiles].sort((a, b) => a.localeCompare(b))
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

  return files.sort((a, b) => a.localeCompare(b))
}

async function verifySnapshotRoot(snapshotRoot, lock) {
  const normalizedLock = validateLock(lock)
  const actualFiles = await listSnapshotFiles(snapshotRoot)
  const lockedFiles = normalizedLock.files
    .map((entry) => entry.path)
    .sort((a, b) => a.localeCompare(b))

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
    const byLowercasePath = left.path.toLowerCase().localeCompare(right.path.toLowerCase())
    return byLowercasePath || left.path.localeCompare(right.path)
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
