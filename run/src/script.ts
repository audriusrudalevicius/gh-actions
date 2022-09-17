import { promises as fs } from 'fs'
import * as util from "./util"
import path from 'path'

export class Script {
  private _path = [util.TmpDir(), `${Math.random().toString(36).slice(2)}.sh`].join(path.posix.sep)

  get path(): string {
    return this._path
  }

  async write(content: string): Promise<void> {
    await fs.writeFile(this._path, `#!/usr/bin/env bash
    ${content}
    `)
  }

  async clean(): Promise<void> {
    return fs.unlink(this._path)
  }
}

export async function Create(content: string): Promise<Script> {
  const newScript = new Script()
  newScript.write(content)

  return newScript
}
