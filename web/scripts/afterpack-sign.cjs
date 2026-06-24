// electron-builder afterPack hook.
//
// When no Apple Developer ID is configured, electron-builder skips signing and
// leaves the bundle with a stale linker signature that no longer matches the
// modified contents — on Apple Silicon macOS refuses to launch it (not even a
// Gatekeeper prompt; a hard "damaged"/killed block). We replace it with a
// valid ad-hoc signature so the app runs.
//
// Note: ad-hoc signed builds are NOT notarized, so a downloaded copy still
// requires a one-time user approval (System Settings > Privacy & Security >
// "Open Anyway", or `xattr -dr com.apple.quarantine <App>`). To remove that
// step entirely, configure Developer ID signing + notarization.
const { execFileSync } = require('node:child_process')
const path = require('node:path')

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return

  const appPath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`
  )

  console.log(`[afterPack] ad-hoc signing ${appPath}`)
  execFileSync('codesign', ['--deep', '--force', '--sign', '-', appPath], {
    stdio: 'inherit',
  })
}
