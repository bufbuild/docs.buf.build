---
id: faq
title: FAQ
---

## CLI command or flag warnings

If you're using the [`buf` CLI][repo] and you get an error message saying that a flag or command has
been moved or is no longer supported, the solution is to upgrade to version [1.0][v1] or greater of
the CLI.

Prior to v1.0, we frequently made changes to the CLI, some of them breaking. With the
[1.0 release][v1], we removed all deprecated flags and commands and established a clean slate.
For the future, our policy is to _never_ introduce breaking changes until v2.0 of the CLI, and
we don't intend to ever release a v2.0.

## `buf.yaml` version

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
currently available versions are `v1beta1` and `v1`.

**The `v1beta1` version will be supported forever.** This will not be removed when we hit v1.0.
Having a `version` set in your configuration is currently optional, however we will
require having a `version` as of v1.0. This will be one of the only (if not the only) breaking
change between the beta and v1.0.

To prepare for this, and to remove this warning, just add a version to the top of your [`buf.yaml`](configuration/v1/buf-yaml.md):

```yaml title="buf.yaml"
version: v1
```

Here's a one-liner for that:

```terminal
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

[repo]: https://github.com/bufbuild/buf
[v1]: https://github.com/bufbuild/buf/releases/tag/v1.0.0
