---
id: setup
title: Setup
---

> If you are using [GitHub Actions](https://github.com/features/actions), you can skip
> this guide and refer to the [GitHub Actions guide](github-actions.md) instead.

[Continuous Integration/Continuous Deployment (CI/CD)](https://en.wikipedia.org/wiki/CI/CD)
is a software development practice that automates building, testing, and deploying software.
If you are working with Protobuf, then `buf` should be part of all three of these development
stages.

This guide illustrates how to integrate `buf` into general CI/CD solutions, such as
[CircleCI](https://circleci.com) and [TravisCI](https://travis-ci.org). If you are using
[GitHub Actions](https://github.com/features/actions), you can skip this guide and refer to
the [GitHub Actions guide](github-actions.md) instead.

This guide is also supplemented by the [buf-example](https://github.com/bufbuild/buf-example)
repository, which provides a functional example for integrating `buf` into [CircleCI](https://circleci.com),
[TravisCI](https://travis-ci.org), or [GitHub Actions](https://github.com/features/actions).
For a quick solution that uses a [Makefile](https://github.com/bufbuild/buf-example/blob/master/Makefile),
please refer to [buf-example](https://github.com/bufbuild/buf-example)!

## Installation

> This is demonstrated in [buf-example](https://github.com/bufbuild/buf-example), so please refer to that
> repository for a functional example.

The first step is to get `buf` running on your CI/CD worker. In order to do so, you'll need an install
script. `buf` can be downloaded from a release or built from source.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="download"
  values={[
    {label: 'Download from a release', value: 'download'},
    {label: 'Build from source', value: 'build'},
  ]}>
<TabItem value="download">

```bash title="install.sh"
#!/bin/bash

PROJECT=<your-project-name>
# Use your desired buf version
BUF_VERSION=1.1.0
# buf is installed to ~/bin/your-project-name.
BIN_DIR=$HOME/bin/$PROJECT

curl -sSL \
	"https://github.com/bufbuild/buf/releases/download/v$BUF_VERSION/buf-$(uname -s)-$(uname -m)" \
	-o "$BIN_DIR/buf"
chmod +x "$BIN_DIR/buf"
```

This script sends a request to the `buf` GitHub Releases using [`curl`](https://curl.se/docs)
for the given `BUF_VERSION` and operating system. The binary is then given executable permission.

</TabItem>
<TabItem value="build">

If you intend on building `buf` from source, this assumes that you have the Go toolchain available in your CI/CD.
If not, please refer to the [Go Documentation](https://golang.org/) for more details.

```bash title="install.sh"
#!/bin/bash

BUF_TMP=$(mktemp -d)
cd $BUF_TMP; go get github.com/bufbuild/buf/cmd/buf@v$BUF_VERSION
rm -rf $BUF_TMP
```

</TabItem>
</Tabs>

## Running lint and breaking change detection {#checks}

> This is demonstrated in [buf-example](https://github.com/bufbuild/buf-example), so please refer to that
> repository for a functional example.

To run lint checks with your job, simply add `buf lint` to it and you're good to go!

If your [`buf.yaml`](../configuration/v1/buf-yaml.md) is defined at the root of your repository, you
can run the linter with this command:

```terminal
$ buf lint
```

If, on the other hand, your `buf.yaml` is defined in a nested directory, such as the `proto`
directory, the command looks like this:

```terminal
$ buf lint proto
```

For `buf breaking`, the process is similar, but be sure to set the full `https` or `ssh`
remote as the target. If your `buf.yaml` is defined at the root of your repository,
the command looks like this:

```terminal
$ buf breaking --against "https://github.com/<your-org>/<your-repo>.git#branch=main"
```

Also valid:

```terminal
$ buf breaking --against "ssh://git@github.com/<your-org>/<your-repo>.git#branch=main"
```

Again, if your `buf.yaml` is defined in a nested directory, such as the `proto` directory,
the command looks like this (notice the `subdir` parameter):

```terminal
$ buf breaking proto --against "https://github.com/<your-org>/<your-repo>.git#branch=main,subdir=proto"
```

Also valid:

```terminal
$ buf breaking proto --against "ssh://git@github.com/<your-org>/<your-repo>.git#branch=main,subdir=proto"
```

If you are on [TravisCI](https://travis-ci.org) or [CircleCI](https://circleci.com) they
do not clone any branches outside of the one being tested, so this enables `buf` to clone
using the remote and run the [breaking change detector](../breaking/overview.md).

## CI authentication (Optional)

If you wish to authenticate a CI/CD job to access the [BSR](../bsr/overview.md) (for example, push a module,
create tags, etc.), we recommend you store your `BUF_TOKEN` in your CI/CD provider's secret
environment variable storage.

For example:
  - [TravisCI](https://docs.travis-ci.com/user/environment-variables/#defining-encrypted-variables-in-travisyml)
  - [CircleCI](https://circleci.com/docs/2.0/env-vars/)
  - [GitHub Actions](https://docs.github.com/en/actions/reference/encrypted-secrets)

You can then access the token in your job using an environment variable, which enables you to create a
`.netrc` file for your job during setup. Here's an example assuming you've stored your token as `BUF_API_TOKEN`
and your username as `BUF_USER`:

```terminal
$ echo ${BUF_API_TOKEN} | buf registry login --username ${BUF_USER} --token-stdin
```

For more details on authenticating to the `BSR`, please see [Authentication](../bsr/authentication.md).

## CI caching

To enable caching of modules downloaded by the `buf` CLI, you can either configure caching of the `~/.cache`
directory, or set the `BUF_CACHE_DIR` environment variable to a directory of your choice and cache that directory.

For more information about module caching, see the [Module Cache docs](../bsr/overview.md#module-cache).

## Wrapping up

Now that you've set up `buf` to run lint checks and detect breaking changes in your CI/CD environment,
your APIs will always remain consistent, and you won't need to waste any more time understanding
the [complex backwards compatibility rules](https://developers.google.com/protocol-buffers/docs/overview#updating)
to ensure that you never break your customers.
