# How to contribute

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md).
By participating in this project you agree to abide by its terms.

We appreciate you taking the time to contribute to `@octkit/core`. Especially as a new contributor, you have a valuable perspective that we lost a long time ago: you will find things confusing and run into problems that no longer occur to us. Please share them with us, so we can make the experience for future contributors the best it could be.

Thank you 💖

## Creating an Issue

Before you create a new Issue:

1. Please make sure there is no [open issue](https://github.com/owner/core.js/issues?utf8=%E2%9C%93&q=is%3Aissue) yet.
2. If it is a bug report, include the steps to reproduce the issue. If possible, create a reproducible test case on [runkit.com](https://runkit.com/). Example: https://runkit.com/gr2m/octokit-rest-js-1808
3. If it is a feature request, please share the motivation for the new feature, what alternatives you tried, and how you would implement it.
4. Please include links to the corresponding GitHub documentation.

## Setup the repository locally

First, fork the repository.

Setup the repository locally. Replace `<your account name>` with the name of the account you forked to.

```shell
git clone https://github.com/<your account name>/core.js.git
cd core.js
npm install
```

Run the tests before making changes to make sure the local setup is working as expected

```shell
npm test
```

## Submitting the Pull Request

Pull requests can be messy, and that's okay. Don't worry about clean commits. Don't even worry about resolving the problem. Often times the most valuable contribution is a test that replicates a reported bug, or verifies a requested feature. Enjoy!

- Create a new branch locally. You can prefix the branch name with `123/` if the issue number you are working on resolving is 123.
- Create tests to replicate the bug or to verify the new feature. You can add the test to [`test/issues.test.ts`](/test/issues.test.ts)
- Commit the changes to the tests and push them to your fork.
- Submit a pull request from your topic branch to the main branch on the `owner/core.js` repository.
- Reference any issues that your pull request is addressing. Adding "Closes #123" to a pull request description will automatically close the issue once the pull request is merged in.
- Now that you created a test, make the necessary code changes to make the tests pass again.

You will likely have to go back-and-forth between changing the tests and the code. Just add new commits, don't worry about commit messages. Please don't squash and force-push, it makes it harder for others to follow your changes. We will clean up the commits when we merge the pull requests.

## Testing a pull request from github repo locally:

You can install `\@octokit/core` from each pull request. Replace `[PULL REQUEST NUMBER]`:

```
npm install https://github.pika.dev/owner/core.js/pr/[PULL REQUEST NUMBER]
```

Once you are done testing, you can revert back to the default module `\@octokit/core` from npm with `npm install \@octokit/core`

## Maintainers: Merging the Pull Request & releasing a new version

Releases are automated using [semantic-release](https://github.com/semantic-release/semantic-release).
The following commit message conventions determine which version is released:

1. `fix: ...` or `fix(scope name): ...` prefix in subject: bumps fix version, e.g. `1.2.3` → `1.2.4`
2. `feat: ...` or `feat(scope name): ...` prefix in subject: bumps feature version, e.g. `1.2.3` → `1.3.0`
3. `BREAKING CHANGE:` in body: bumps breaking version, e.g. `1.2.3` → `2.0.0`

Only one version number is bumped at a time, the highest version change trumps the others.
Besides publishing a new version to npm, semantic-release also creates a git tag and release
on GitHub, generates changelogs from the commit messages and puts them into the release notes.

Before the publish it runs the `npm run build` script which creates a `pkg/` folder with distributions for browsers, node and Typescript definitions. The contents of the `pkg/` folder are published to the npm registry.

If the pull request looks good but does not follow the commit conventions, use the <kbd>Squash & merge</kbd> button.
