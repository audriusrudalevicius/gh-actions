import * as core from '@actions/core'
import * as render from './render'

async function run(): Promise<void> {
  try {
    const templatePath: string = core.getInput('template')
    const templatesDir: string = core.getInput('templatesDir')
    const dataPath: string = core.getInput('data')
    const result = await render.Render(templatePath, dataPath, templatesDir)
    if (core.isDebug()) {
      core.debug(`result: ${result}`)
    }

    core.setOutput('result', result)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
