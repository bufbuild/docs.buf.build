---
id: faq
title: FAQ
---

### Command and flag migrations

You may have recently gotten one of these warnings:

```
"buf image build" has been moved to "buf build".
```

```
Failure: flag --input is no longer supported, use the first argument instead.
```

At Buf, we take compatibility very seriously. When we say v1.0, we mean it - we hope `buf` will be
stable on v1 for the next decade, and if there is something we want to change, it is our responsibility to
make sure that we don't break you, not your responsibility to change because of us. We have learned
a lot about `buf` usage in the last two years of our beta, and have deprecated flags and commands as
we go, but for v1.0, we are removing the deprecated items to make sure we have a clean setup going forward.

All commands and flags have been printing warnings for a long time, and have a smooth migration path.
Simply update the command or flag, and you'll be good to go:

- Removed the `buf login` command in favor of `buf registry login`.
- Removed the `buf logout` command in favor of `buf registry logout`.
- Removed the `buf push` command in favor of `buf mod push`.
- Removed the `buf mod init` command in favor of `buf config init`.
- Removed the `--name` and `--dep` flags in `buf mod init`.
- Removed the `--version` flag in favor of the `buf version` command, which writes to stdout.
- Moved the output of `--help` and `help` from stderr to stdout.
- [From v0.55.0](https://github.com/bufbuild/buf/releases/tag/v0.55.0): The version key in all configuration files (`buf.yaml`, `buf.gen.yaml`, `buf.work.yaml`) is now required.
- [From v0.45.0](https://github.com/bufbuild/buf/releases/tag/v0.45.0): Removed the `buf beta config init` command in favor of `buf config init`.
- [From v0.45.0](https://github.com/bufbuild/buf/releases/tag/v0.45.0): Removed the `buf beta mod export` command in favor of `buf export`.
- [From v0.45.0](https://github.com/bufbuild/buf/releases/tag/v0.45.0): Removed the `buf beta mod init` command in favor of `buf config init`.
- [From v0.45.0](https://github.com/bufbuild/buf/releases/tag/v0.45.0): Removed the `buf beta mod update` command in favor of `buf mod update`.
- [From v0.45.0](https://github.com/bufbuild/buf/releases/tag/v0.45.0): Removed the `buf beta mod clear-cache` command in favor of `buf mod clear-cache`.
- [From v0.45.0](https://github.com/bufbuild/buf/releases/tag/v0.45.0): Removed the `buf beta push` command in favor of `buf mod push`.
- [From v0.34.0](https://github.com/bufbuild/buf/releases/tag/v0.34.0): Removed the `buf check breaking` command in favor of `buf breaking`.
- [From v0.34.0](https://github.com/bufbuild/buf/releases/tag/v0.34.0): Removed the `buf check lint` command in favor of `buf lint`.
- [From v0.34.0](https://github.com/bufbuild/buf/releases/tag/v0.34.0): Removed the `buf check ls-lint-checkers` command in favor of `buf config ls-lint-rules`.
- [From v0.34.0](https://github.com/bufbuild/buf/releases/tag/v0.34.0): Removed the `buf check ls-breaking-checkers` command in favor of `buf config ls-breaking-rules`.
- [From v0.31.0](https://github.com/bufbuild/buf/releases/tag/v0.31.0): Removed the `--file` flag on `buf build` in favor of the `--path` flag.
- [From v0.31.0](https://github.com/bufbuild/buf/releases/tag/v0.31.0): Removed the `--file` flag on `buf lint` in favor of the `--path` flag.
- [From v0.31.0](https://github.com/bufbuild/buf/releases/tag/v0.31.0): Removed the `--file` flag on `buf breaking` in favor of the `--path` flag.
- [From v0.31.0](https://github.com/bufbuild/buf/releases/tag/v0.31.0): Removed the `--file` flag on `buf generate` in favor of the `--path` flag.
- [From v0.31.0](https://github.com/bufbuild/buf/releases/tag/v0.31.0): Removed the `--file` flag on `buf export` in favor of the `--path` flag.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `--source` flag on `buf build` in favor of the first positional parameter.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `--source-config` flag on `buf build` in favor of the `--config` flag.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `--input` flag on `buf lint` in favor of the first positional parameter.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `--input-config` flag on `buf lint` in favor of the `--config` flag.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `--input` flag on `buf breaking` in favor of the first positional parameter.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `--input-config` flag on `buf breaking` in favor of the `--config` flag.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `--against-input` flag on `buf breaking` in favor of the `--against` flag.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `--against-input-config` flag on `buf breaking` in favor of the `--against-config` flag.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `--input` flag on `buf generate` in favor of the first positional parameter.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `--input-config` flag on `buf generate` in favor of the `--config` flag.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `--input` flag on `buf ls-files` in favor of the first positional parameter.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `--input-config` flag on `buf ls-files` in favor of the `--config` flag.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `buf image build` command in favor of `buf build`.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `buf image convert` command.
- [From v0.29.0](https://github.com/bufbuild/buf/releases/tag/v0.29.0): Removed the `buf beta image convert` command.
- [From v0.23.0](https://github.com/bufbuild/buf/releases/tag/v0.23.0): Removed the `buf experimental image convert` command.
- [From v0.52.0](https://github.com/bufbuild/buf/releases/tag/v0.52.0) [and v0.34.0](https://github.com/bufbuild/buf/releases/tag/v0.34.0): Complete deletion `protoc-gen-buf-check-breaking` and `protoc-gen-buf-check-lint`, which have been moved to `protoc-gen-buf-breaking` and `protoc-gen-buf-lint`.

In January 2021 (v0.34.0), `protoc-gen-buf-check-breaking` and `protoc-gen-buf-check-lint` were deprecated and scheduled for removal for v1.0. In August 2021 (v0.52.0), we began returning error for every invocation of `protoc-gen-buf-check-breaking` and `protoc-gen-buf-check-lint`. This release completes the deletion process.

The only migration necessary is to change your installation and invocation from `protoc-gen-buf-check-breaking` to `protoc-gen-buf-breaking` and `protoc-gen-buf-check-lint` to `protoc-gen-buf-lint`. These can be installed in the exact same manner, whether from GitHub Releases, Homebrew, AUR, or direct Go installation:

```
# instead of go get github.com/bufbuild/buf/cmd/protoc-gen-buf-check-breaking
go get github.com/bufbuild/buf/cmd/protoc-gen-buf-breaking
# instead of curl -sSL https://github.com/bufbuild/buf/releases/download/v0.57.0/protoc-gen-buf-check-breaking-Linux-x86_64
curl -sSL https://github.com/bufbuild/buf/releases/download/v0.57.0/protoc-gen-buf-breaking-Linux-x86_64
```

We feel these changes make using `buf` more natural. Examples:

```sh
# Compile the files in the current directory
$ buf build

# Equivalent to the default no-arg invocation
$ buf build .

# Build the repository at https://github.com/foo/bar.git
$ buf build https://github.com/foo/bar.git

# Lint the files in the 'proto' directory
$ buf lint proto

# Check the files in the current directory against the files on the main branch for breaking changes
$ buf breaking --against .git#branch=main

# Check the files in the 'proto' directory against the files in the 'proto' directory on the main branch
$ buf breaking proto --against .git#branch=main,subdir=proto
```

### `buf.yaml` version

You may have recently seen this warning:

```
Failure: buf.yaml has no version set. Please add "version: v1". See https://docs.buf.build/faq for more details.
```

We have added the concept of version to the configuration. For a given version, these things
don't change:

- Configuration file layout
- Default configuration files
- Lint and breaking change rules and their associated categories.

**Our goal at Buf is to never break users.** You should be able to upgrade `buf`, and expect the same
results, forever. In this spirit, we want to make sure that upgrading `buf` does not result
in any configuration differences, and does not result in different lint or breaking change results.

There are only a few exceptions to this rule that took place between `v1beta1` and `v1`. Fortunately,
we've rolled out the `buf beta migrate-v1beta1` command to automatically migrate your configuration
for you. For more information on exactly what changed between `v1beta1` and `v1`, check out the
[migration guide](configuration/v1beta1-migration-guide.md).

We also need to be able to enhance the lint and breaking change functionality, and improve
on the configuration shape as well. To accomplish this, while not breaking users who have
come to rely on the existing shape and rules, we have added this version. The only
currently-available versions are `v1beta1` and `v1`.

**The `v1beta1` version will be supported forever.** This will not be removed when we hit v1.0.
Having a `version` set in your configuration is currently optional, however we will
require having a `version` as of v1.0. This will be one of the only (if not the only) breaking
change between the beta and v1.0.

To prepare for this, and to remove this warning, just add a version to the top of your [`buf.yaml`](configuration/v1/buf-yaml.md):

```yaml title="buf.yaml"
version: v1
```

Here's a one-liner for that:

```sh
$ cat <(echo version: v1) buf.yaml > buf.yaml.tmp && mv buf.yaml.tmp buf.yaml
```

A version can (and should) also be added to the protoc plugin options. For example:

```json
$ protoc -I . \
  --buf-lint_out=. \
  '--buf-lint_opt={"input_config":{"version":"v1","lint":{"use":["ENUM_NO_ALLOW_ALIAS"]}}}' \
  $(find . -name '*.proto')
```

We apologize for any inconvenience this warning may have caused.
