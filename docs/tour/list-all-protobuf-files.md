---
id: list-all-protobuf-files
title: 2 List all Protobuf files
---

You can list all of the `.proto` files managed by `buf` per the
[build configuration](../configuration/v1/buf-yaml#build):

```terminal
$ buf ls-files
---
google/type/datetime.proto
pet/v1/pet.proto
```

The [`build.excludes`](/configuration/v1/buf-yaml#excludes) parameter
enables you to prevent certain directories from being built, but this is neither
necessary nor recommended.

## 2.1 Remote inputs {#remote-inputs}

The `ls-files` command also works with remote inputs, such as this Git input:

```terminal
$ buf ls-files git://github.com/bufbuild/buf-tour.git#branch=main,subdir=start/petapis
---
start/petapis/google/type/datetime.proto
start/petapis/pet/v1/pet.proto
```

Some things to note from the remote input:

* The `branch` option specifies the branch to clone for git inputs. In this case, use
  the `main` branch.
* The `subdir` option specifies a sub-directory to use within a `git`, `tar`, or `zip` input.
  In this case, target the `start/petapis` sub-directory.

Here, `buf` is listing the files from a [`git`](/reference/inputs#git) archive, so you'll notice that the result includes the
`start/petapis/` prefix, which is the relative filepath from the root of the `git` archive.

Several other [input formats](../reference/inputs) can be used in many `buf` commands.
We'll explore more of these formats in the upcoming sections.
