import * as core from '@actions/core'
import {Run} from './run'

async function run(): Promise<void> {
    try {
      const script: string = core.getInput('script')
      const result = await Run(script)
      core.setOutput("stdout", result.stdout)
      core.setOutput("stderr", result.stderr)
      core.setOutput("success", result.success)
      core.setOutput("exit", result.exit)
    } catch (error) {
      if (error instanceof Error) core.setFailed(error.message)
    }
  }
  
  run()