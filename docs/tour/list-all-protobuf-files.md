---
id: list-all-protobuf-files
title: 2 List All Protobuf Files
---

You can list all of the `.proto` files `buf` is configured to use
with the following command:

```terminal
$ buf ls-files
```

This prints this list of `.proto` files managed by `buf` per the
[build configuration](../configuration/v1/buf-yaml.md#build):

```
google/type/datetime.proto
pet/v1/pet.proto
```


The [`build.excludes`](/configuration/v1/buf-yaml#excludes) parameter
enables you to remove certain directories from being built, but this is neither
necessary nor recommended.

## 2.1 Remote Inputs {#remote-inputs}

The `ls-files` command also works with remote inputs, such as the following:

```terminal
$ buf ls-files git://github.com/bufbuild/buf-tour.git#branch=main,subdir=start/petapis
start/petapis/google/type/datetime.proto
start/petapis/pet/v1/pet.proto
```

  * The `branch` option specifies the branch to clone for git inputs. In this case, we're using
    the `main` branch.
  * The `subdir` option specifies a sub-directory to use within a `git`, `tar`, or `zip` input.
    In this case, we're targeting the `start/petapis` sub-directory.

We're listing the files from a `git` archive, so you'll notice that the result includes the
`start/petapis/` prefix, which is the relative filepath from the root of the `git` archive.

More [input formats](../reference/inputs.md) can be used in all of the `buf` commands.
We'll explore more of these formats in the following sections.
