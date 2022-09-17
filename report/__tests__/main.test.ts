import { expect, test, jest, describe, beforeEach } from "@jest/globals"
import * as Render from "../src/render"
import { PathLike, promises as fs } from 'fs'
import { FileHandle } from "fs/promises"
import * as glob from '@actions/glob'
import path from "path"
import type { Globber } from '@actions/glob'

type FsContnets = {
  [key: string]: string;
};

class MockGlobber implements Globber {
  private _items: FsContnets = {}
  private _prefix = ''

  constructor(items: FsContnets, prefix: string) {
    this._items = items
    this._prefix = prefix
  }

  getSearchPaths(): string[] {
    throw new Error("Method not implemented.")
  }
  glob(): Promise<string[]> {
    throw new Error("Method not implemented.")
  }
  async *globGenerator(): AsyncGenerator<string, void> {
    for (const [key, value] of Object.entries(this._items)) {
      if (key.indexOf(this._prefix) > -1) {
        yield key;
      }
    }
  }
}

describe("Run tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  const fsContents: FsContnets = {
    'data.json': JSON.stringify({ 'pages': [{ 'title': 'Page 1' }, { 'title': 'Page 2' }] }),
    'template.eta': [
      "<%~ include('header', {name: 'Hello'})%>",
      "<%- it.pages.forEach(function(page){ %>",
      "  * <% = page.title %>",
      "<%- }) %>",
      "<%~ include('default/footer')%>"
    ].join("\n"),
    '.github/report-templates/header.eta': '### Report <%=it.name%>',
    '.github/report-templates/default/footer.eta': '---',
  }

  test("renders template with data", async () => {
    const readFileSpy = jest.spyOn(fs, "readFile")
    const globCreateSpy = jest.spyOn(glob, "create")
    const resolveSpy = jest.spyOn(path, "resolve")
    readFileSpy.mockImplementation(async (path: FileHandle | PathLike): Promise<string> => {
      return fsContents[path.toString()]
    })
    globCreateSpy.mockImplementation(async (pattern, options?) => {
      return new MockGlobber(fsContents, ".github/report-templates/")
    })
    resolveSpy.mockImplementationOnce((p) => { return p })
    await expect(Render.Render("template.eta", "data.json", ".github/report-templates/")).resolves.toEqual([
      "### Report Hello",
      "  * Page 1",
      "  * Page 2",
      "---"
    ].join("\n"))
    expect(readFileSpy).toBeCalledTimes(4)
    expect(globCreateSpy).toBeCalledTimes(1)
    expect(resolveSpy).toBeCalledTimes(1)
  })
})
