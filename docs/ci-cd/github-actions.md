---
id: github-actions
title: GitHub Actions
---

[GitHub Actions](https://github.com/features/actions) is a [CI/CD](https://en.wikipedia.org/wiki/CI/CD)
system supported by GitHub that runs workflows against your code based on an event. Buf has published a
collection of GitHub Actions that work together to provide a fully featured CI/CD solution for Protobuf:

  - [buf-setup](https://github.com/marketplace/actions/buf-setup) installs and sets up `buf`,
    so that it can be used by other steps.
  - [buf-lint](https://github.com/marketplace/actions/buf-lint) lints Protobuf files with `buf`,
    and comments in-line on pull requests.
  - [buf-breaking](https://github.com/marketplace/actions/buf-breaking) verifies backwards compatibility
    for your Protobuf files with `buf`, and comments in-line on pull requests.
  - [buf-push](https://github.com/marketplace/actions/buf-push) pushes a [module](../bsr/overview.md#modules) to the Buf Schema Registry
    ([BSR](../bsr/overview.md)). The module is pushed with a tag equal to the git commit SHA.

In this guide, you will configure these GitHub Actions so that `buf lint` and `buf breaking` are run on
all pull requests, and `buf push` pushes your module to the BSR when your pull request is merged.

## Create a BSR token

The `buf-push` step requires access to the BSR. For steps on obtaining a token, see the
[Authentication](../bsr/authentication.md) page for more details. This needs to be added as an encrypted
[GitHub Secret](https://docs.github.com/en/actions/reference/encrypted-secrets).

In this guide, the API token is set to `BUF_TOKEN`.

## `buf-setup`

We will start with the `buf-setup` action. All the other Buf GitHub Actions require
`buf` to be installed on your GitHub Action runner, and `buf-setup` will handle that for us.

Add this `.github/workflows/pull-request.yaml` file to your repository:

```yaml title=".github/workflows/pull-request.yaml"
name: buf-pull-request
on: pull_request
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: bufbuild/buf-setup-action@v1
```

This ensures that `buf` is installed with the latest release version and is available for all subsequent steps
within the current job.

To pin the `buf` CLI to a specific version, update your setup step to include a version:

```yaml {2-3}
- uses: bufbuild/buf-setup-action@v1
  with:
    version: '1.3.1'
```

To resolve the latest release from GitHub, you can specify `latest`, but this is **not** recommended:

```yaml
steps:
  - uses: actions/checkout@v2
  - uses: bufbuild/buf-setup-action@v1
    with:
      version: 'latest'
```

## `buf-lint`

Now that you have installed `buf`, let's configure lint. The `buf-lint` action lints your
pull request and has the ability to provide in-line comments. Add this after your `buf-setup` step:

```yaml title=.github/workflows/pull-request.yaml {9}
name: buf-pull-request
on: pull_request
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: bufbuild/buf-setup-action@v1
      - uses: bufbuild/buf-lint-action@v1
```

## `buf-breaking`

We will do something similar for the breaking change detection. The `buf-breaking` action prevents breaking
changes to your API based on a given repository to check against, such as the `HEAD` of the `main` branch of
your repository.

Add this after your `buf-lint` step and make these adjustments to your previous steps.

```yaml title=.github/workflows/pull-request.yaml {10-13}
name: buf-pull-request
on: pull_request
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: bufbuild/buf-setup-action@v1
      - uses: bufbuild/buf-lint-action@v1
      - uses: bufbuild/buf-breaking-action@v1
        with:
          # The 'main' branch of the GitHub repository that defines the module.
          against: 'https://github.com/${GITHUB_REPOSITORY}.git#branch=main'
```

If any breaking changes are detected against the provided remote, `buf-breaking` adds
inline comments to your pull request to indicate these changes.

## `buf-push`

Now that we've added steps for pull request workflow, let's add a **second workflow**
to push to the BSR once the pull request has merged. We cannot use the same workflow
since we do not want to be pushing to the BSR on each commit pushed to the pull request.

Add this `.github/workflows/push.yaml` file alongside your pull request workflow
configuration.

```yaml title=".github/workflows/push.yaml" {1-5,17-19}
name: buf-push
on:
  push:
    branches:
      - main
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: bufbuild/buf-setup-action@v1
      - uses: bufbuild/buf-lint-action@v1
      - uses: bufbuild/buf-breaking-action@v1
        with:
          # The 'main' branch of the GitHub repository that defines the module.
          against: 'https://github.com/${GITHUB_REPOSITORY}.git#branch=main,ref=HEAD~1'
      - uses: bufbuild/buf-push-action@v1
        with:
          buf_token: ${{ secrets.BUF_TOKEN }}
```

This workflow is basically the same workflow as before, with an additional step to push to the BSR when a push is made to the `main` branch of your repository. The `buf-push` action only pushes to the BSR if contents have actually changed, it otherwise succeeds silently.

When comparing against the same branch we also set `ref=HEAD~1` to compare against the previous commit on that branch.

Note, `ref=HEAD~1` does not work well for [rebase and merge](https://docs.github.com/en/github/administering-a-repository/configuring-pull-request-merges/about-merge-methods-on-github#rebasing-and-merging-your-commits) operations, since `buf` is comparing against the last commit there might be older commits with breaking changes. If you're using **Merge pull request** (GitHub default) or **Squash and merge** options then `#ref=HEAD~1` should work.

The `buf-push` step also tags the BSR commit with the `git` commit SHA, so that they are more
easily associated with one another.

## Inputs

Some repositories are structured so that their [`buf.yaml`](../configuration/v1/buf-yaml.md) is defined
in a sub-directory, such as a `./proto` directory. In this case, you can specify the relative sub-directory using
the `input` parameter (this is relevant for both `pull_request` and `push` workflows). For example, consider the
`tree` for the `buf.build/acme/weather` module:

```sh
.
└── proto
    ├── acme
    │   └── weather
    │       └── v1
    │           └── weather.proto
    └── buf.yaml
```

You can adapt the `push` workflow shown above so that it targets the `./proto` directory, as in
this Action configuration:

```yaml title=".github/workflows/push.yaml" {14,17,23}
name: buf-push
on:
  push:
    branches:
      - main
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: bufbuild/buf-setup-action@v1
      - uses: bufbuild/buf-lint-action@v1
        with:
          input: 'proto'
      - uses: bufbuild/buf-breaking-action@v1
        with:
          input: 'proto'
          # The 'main' branch of the GitHub repository that defines the module.
          # Note we specify the subdir to compare against.
          against: 'https://github.com/${GITHUB_REPOSITORY}.git#branch=main,ref=HEAD~1,subdir=proto'
      - uses: bufbuild/buf-push-action@v1
        with:
          input: 'proto'
          buf_token: ${{ secrets.BUF_TOKEN }}
```

For more information on `subdir` see the [Breaking Change Detection - Usage](https://docs.buf.build/breaking/usage#git) section.

## Wrapping up

Now that you've set up `buf` to run lint checks and detect breaking changes in your CI/CD environment, your APIs
will always remain consistent, and you won't need to waste any more time understanding the [complex backwards
compatibility rules](https://developers.google.com/protocol-buffers/docs/overview#updating) to ensure that you
never break your customers. Plus, the module defined in your GitHub repository is automatically kept
in sync with the BSR, so you don't have to manually push your API updates!
