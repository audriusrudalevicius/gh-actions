import * as core from '@actions/core'
import { Run } from './run'
import { Create } from './script'

async function run(): Promise<void> {
  try {
    const scriptContent: string = core.getInput('script')
    const cwd: string = core.getInput('working-directory')
    const newScript = await Create(scriptContent)
    try {
      const scriptResult = await Run(newScript.path, [], cwd)
      core.setOutput("stdout", scriptResult.stdout)
      core.setOutput("stderr", scriptResult.stderr)
      core.setOutput("success", scriptResult.success)
      core.setOutput("exit", scriptResult.exit)
    } finally {
      newScript.clean()
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()