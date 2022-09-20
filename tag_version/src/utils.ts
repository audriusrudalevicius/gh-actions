import * as core from '@actions/core'
import { prerelease, rcompare, valid } from 'semver'

import DEFAULT_RELEASE_TYPES from '@semantic-release/commit-analyzer/lib/default-release-types'
import { compareCommits, listTags, Tag } from './github'
import { defaultChangelogRules, ChangelogRule } from './defaults'
import { Await } from './ts'

type Tags = Await<ReturnType<typeof listTags>>

export async function getValidTags(
    prefixRegex: RegExp,
    shouldFetchAllTags: boolean
): Promise<Tags> {
    const tags = await listTags(shouldFetchAllTags)

    const invalidTags = tags.filter(
        (tag) => !valid(tag.name.replace(prefixRegex, ''))
    )

    for (const name of invalidTags) {
        core.debug(`Found Invalid Tag: ${name}.`)
    }

    const validTags = tags
        .filter((tag) => valid(tag.name.replace(prefixRegex, '')))
        .sort((a, b) =>
            rcompare(a.name.replace(prefixRegex, ''), b.name.replace(prefixRegex, ''))
        )

    for (const tag of validTags) {
        core.debug(`Found Valid Tag: ${tag.name}.`)
    }

    return validTags
}

export async function getCommits(
    baseRef: string,
    headRef: string
): Promise<{ message: string; hash: string | null }[]> {
    const commits = await compareCommits(baseRef, headRef)

    return commits
        .filter((commit) => !!commit.commit.message)
        .map((commit) => ({
            message: commit.commit.message,
            hash: commit.sha,
        }))
}

export function getBranchFromRef(ref: string): string {
    return ref.replace('refs/heads/', '')
}

export function isPr(ref: string): boolean {
    return ref.includes('refs/pull/')
}

export function getLatestTag(
    tags: Tags,
    prefixRegex: RegExp,
    tagPrefix: string
): Tag | undefined {
    return (
        tags.find((tag) => !prerelease(tag.name.replace(prefixRegex, ''))) || {
            name: `${tagPrefix}0.0.0`,
            commit: {
                sha: 'HEAD',
            },
        } as Tag
    )
}

export function getLatestPrereleaseTag(
    tags: Tags,
    identifier: string,
    prefixRegex: RegExp
): Tag | undefined {
    return tags
        .filter((tag) => prerelease(tag.name.replace(prefixRegex, '')))
        .find((tag) => tag.name.replace(prefixRegex, '').match(identifier))
}

export function mapCustomReleaseRules(customReleaseTypes: string): { type: string; release: string; section?: string | undefined }[] {
    const releaseRuleSeparator = ','
    const releaseTypeSeparator = ':'

    return customReleaseTypes
        .split(releaseRuleSeparator)
        .filter((customReleaseRule) => {
            const parts = customReleaseRule.split(releaseTypeSeparator)

            if (parts.length < 2) {
                core.warning(
                    `${customReleaseRule} is not a valid custom release definition.`
                )
                return false
            }

            const defaultRule = defaultChangelogRules[parts[0].toLowerCase()]
            if (customReleaseRule.length !== 3) {
                core.debug(
                    `${customReleaseRule} doesn't mention the section for the changelog.`
                )
                core.debug(
                    defaultRule
                        ? `Default section (${defaultRule.section}) will be used instead.`
                        : "The commits matching this rule won't be included in the changelog."
                )
            }

            if (!DEFAULT_RELEASE_TYPES.includes(parts[1])) {
                core.warning(`${parts[1]} is not a valid release type.`)
                return false
            }

            return true
        })
        .map((customReleaseRule) => {
            const [type, release, section] =
                customReleaseRule.split(releaseTypeSeparator)
            const defaultRule = defaultChangelogRules[type.toLowerCase()]
            const assigendSection = section || defaultRule?.section
            const rule = {
                type,
                release,
            }
            if (assigendSection !== undefined) {
                return {
                    ...rule,
                    ...{ section: assigendSection },
                }
            }

            return rule
        })
}

export function mergeWithDefaultChangelogRules(
    mappedReleaseRules: ReturnType<typeof mapCustomReleaseRules> = []
): ChangelogRule[] {
    const mergedRules = mappedReleaseRules.reduce(
        (acc, curr) => ({
            ...acc,
            [curr.type]: curr,
        }),
        { ...defaultChangelogRules }
    )

    return Object.values(mergedRules).filter((rule) => !!rule.section)
}