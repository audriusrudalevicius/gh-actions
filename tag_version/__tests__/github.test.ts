/* eslint-disable @typescript-eslint/no-explicit-any */
import { listTags } from '../src/github'
import { expect, it, jest, describe } from "@jest/globals"

jest.mock(
  '@actions/github',
  jest.fn().mockImplementation(() => ({
    context: { repo: { owner: 'mock-owner', repo: 'mock-repo' } },
    getOctokit: jest.fn().mockReturnValue({
      rest: {
        repos: {
          listTags: jest.fn().mockImplementation((params: any) => {
            if (params.page === 6) {
              return { data: [] }
            }

            const res = [...new Array(100).keys()].map((_) => ({
              name: `v0.0.${_ + (params.page - 1) * 100}`,
              commit: { sha: 'string', url: 'string' },
              zipball_url: 'string',
              tarball_url: 'string',
              node_id: 'string',
            }))

            return { data: res }
          })
        }
      },
    }),
  }))
)

describe('github', () => {
  it('returns all tags', async () => {
    const tags = await listTags(true)

    expect(tags.length).toEqual(500)
    expect(tags[499]).toEqual({
      name: 'v0.0.499',
      commit: { sha: 'string', url: 'string' },
      zipball_url: 'string',
      tarball_url: 'string',
      node_id: 'string',
    })
  })

  it('returns only the last 100 tags', async () => {
    const tags = await listTags(true)

    expect(tags.length).toEqual(500)
    expect(tags[99]).toEqual({
      name: 'v0.0.99',
      commit: { sha: 'string', url: 'string' },
      zipball_url: 'string',
      tarball_url: 'string',
      node_id: 'string',
    })
  })
})