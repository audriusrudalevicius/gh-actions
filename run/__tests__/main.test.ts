import * as run from "../src/run"
import * as script from "../src/script"
import { expect, test, jest, describe, beforeEach } from "@jest/globals"
import { promises as fs } from 'fs'
import * as exec from "@actions/exec"

describe("Run tests", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test("throws empty script", async () => {
    await expect(run.Run("")).rejects.toThrow("script is empty!")
  })

  test("executes echo", async () => {
    const execSpy = jest.spyOn(exec, "exec")
    execSpy.mockResolvedValue(0)

    await expect(run.Run('-c echo "test"')).resolves.toStrictEqual({
      exit: 0,
      stderr: "",
      stdout: "",
      success: true,
    })
    expect(execSpy).toHaveBeenCalledTimes(1)
    execSpy.mockClear()
  })
})

describe("Script test", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test("expect script content has written", async () => {
    const writeFileSpy = jest.spyOn(fs, "writeFile")
    await expect(script.Create('echo 2" && echo 1')).resolves.not.toBeNull()
    expect(writeFileSpy).toHaveBeenCalledTimes(1)
    writeFileSpy.mockClear()
  })
})
