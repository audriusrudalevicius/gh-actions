import { promises as fs, PathLike } from "fs"
import { renderAsync, defaultConfig, compile, templates } from "eta"
import type { EtaConfig } from "eta/dist/types/config"
import path from "path"
import * as glob from '@actions/glob'
import * as core from '@actions/core'

export async function Render(templatePath: PathLike, dataPath: PathLike, templatesDir: PathLike): Promise<string> {
    const tpl = await fs.readFile(templatePath)
    const data = await fs.readFile(dataPath)
    let fullPath = path.resolve(templatesDir.toString())
    if (!fullPath.endsWith(path.posix.sep)) {
        fullPath = fullPath + path.posix.sep
    }
    core.debug(`templatesDir: ${fullPath}`)

    const globber = await glob.create([fullPath, '**.eta'].join(path.posix.sep))
    for await (const file of globber.globGenerator()) {
        const ext = path.extname(file)
        const name = file.replace(fullPath, '').replace(ext, '')

        core.debug(`including template: ${file.toString()} name: ${name}`)
        const tplData = await fs.readFile(file)
        templates.define(name, compile(tplData.toString()))
    }
    const cfg = {
        ...defaultConfig, ...{
            autoTrim: false
        }
    } as EtaConfig
    return await renderAsync(tpl.toString(), JSON.parse(data.toString()), cfg) as string
}
