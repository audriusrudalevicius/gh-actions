import fs from 'fs'
import * as os from 'os'
import path from 'path'

let _tmpDir: string

export function TmpDir(): string {
    if (!_tmpDir) {
        _tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'script-run-')).split(path.sep).join(path.posix.sep)
    }
    return _tmpDir
}
