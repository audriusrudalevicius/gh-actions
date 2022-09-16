import { exec, ExecOptions } from "@actions/exec"

export interface ExecResult {
  success: boolean
  exit: number
  stdout: string
  stderr: string
}

export async function Run(
  command: string,
  args: string[] = [],
  silent = true
): Promise<ExecResult> {
  let stdout = ""
  let stderr = ""

  const options: ExecOptions = {
    silent,
    ignoreReturnCode: true,
  }

  options.listeners = {
    stdout: (data: Buffer) => {
      stdout += data.toString()
    },
    stderr: (data: Buffer) => {
      stderr += data.toString()
    },
  }

  if (command === "") throw new Error("script is empty!")
  const returnCode: number = await exec(`bash -c "${command}"`, args, options)

  return {
    success: returnCode === 0,
    exit: returnCode,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  }
}
