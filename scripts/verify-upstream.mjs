import { verifyPackagedSnapshot, verifySourceSnapshot } from '../index.js'

function parseArguments(args) {
  if (args.length === 0) {
    return {}
  }
  if (args.length === 2 && args[0] === '--source' && args[1]) {
    return { sourceRoot: args[1] }
  }
  throw new Error('usage: node scripts/verify-upstream.mjs [--source <swift-cycle-directory>]')
}

try {
  const options = parseArguments(process.argv.slice(2))
  const packaged = await verifyPackagedSnapshot()
  console.log(`packaged_upstream_commit=${packaged.lock.upstream.commit}`)
  console.log(`packaged_payload_sha256=${packaged.payloadSha256}`)

  if (options.sourceRoot) {
    const source = await verifySourceSnapshot({
      sourceRoot: options.sourceRoot,
      lock: packaged.lock,
    })
    console.log(`source_payload_sha256=${source.payloadSha256}`)
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
