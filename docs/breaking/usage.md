---
id: usage
title: Usage
---

> We highly recommend completing [the tour](../tour/detect-breaking-changes.md) to get an overview
> of `buf breaking`.

## Define a module

To get started, create a [module](../bsr/overview.md#modules) by adding a [`buf.yaml`](../configuration/v1/buf-yaml.md)
file to the root of the directory that contains your Protobuf definitions. You can create the default `buf.yaml`
file with this command:

```terminal
$ buf mod init
```

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

## Run breaking change detection

You can run `buf breaking` on your module by specifying the filepath to the directory containing the `buf.yaml`
and choosing an [input](../reference/inputs.md) to compare it against. In the above example, you can target the
input defined in the current directory and compare it against the `main` `git` branch:

```terminal
$ buf breaking --against '.git#branch=main'
```

The above `buf breaking` command:

  - Discovers all Protobuf files per your configuration.
  - Copies all Protobuf files into memory.
  - Compiles all Protobuf files.
  - Clones the head of the `main` branch of the `git` repository located at local directory `.git` into memory.
  - Compiles all Protobuf files on the `main` branch per the configuration on that branch.
  - Compares the compilation results for breaking changes.

If there are errors, they are printed out in a `file:line:column:message` format by default:

```terminal
$ buf breaking --against '.git#branch=main'
---
pet/v1/pet.proto:18:3:Field "1" on message "Pet" changed type from "enum" to "string".
```

Breaking output can also be printed as JSON:

```terminal
$ buf breaking --against '.git#branch=main' --error-format=json
---
{"path":"acme/pet/v1/pet.proto","start_line":18,"start_column":3,"end_line":18,"end_column":9,"type":"FIELD_SAME_TYPE","message":"Field \"1\" on message \"Pet\" changed type from \"enum\" to \"string\"."}
```

## Common use cases

`buf`'s breaking change detector works by comparing a previous version of your Protobuf schema to
your current version. `buf` considers your current schema to be the "input" and your previous schema
to be the "against input". This is represented by the first CLI argument `<input>` and the `--against`
flag.

There are multiple ways to store and/or retrieve your previous schema version with `buf` inputs.
The sections below outline some common scenarios and how to deal with them.

### git

> Make sure to check out Buf's dedicated [GitHub Actions](../ci-cd/github-actions.md) to seamlessly add
> breaking change detection into your CI/CD pipeline!

You can directly compare against the `.proto` files at the head of a `git` branch, or a `git` tag.
See the inputs documentation for details on `git` branches and `git` tags.

As an example, if you are currently in the root of your `git` repository, you should have a `.git`
directory. To compare against your Protobuf schema as committed on the `main` branch:

```terminal
$ buf breaking --against '.git#branch=main'
```

This is especially useful for local development. Note that many CI services like [Travis CI](https://travis-ci.com/)
do not do a full clone of your repo, instead cloning a certain number of commits (typically around 50)
on the specific branch that is being tested. In this scenario, other branches aren't present
in your clone within CI, so the above doesn't work. While you could work around this by [disabling git
clone and doing it manually](https://docs.travis-ci.com/user/customizing-the-build/#disabling-git-clone),
a better alternative is to give the remote path directly to `buf` to clone itself:

```terminal
$ buf breaking --against 'https://github.com/foo/bar.git'
# Assuming your repo is github.com/foo/bar
```

`buf` only clones the single commit at the `HEAD` of the branch, so even for large repositories, this
should be quick.

You can also compare against a `git` tag, for example `v1.0.0`:

```terminal
$ buf breaking --against '.git#tag=v1.0.0'
```

You can also compare against a subdirectory in your git repository. For example, if your `buf.yaml` is
stored in the subdirectory `proto`:


```terminal
$ buf breaking --against '.git#tag=v1.0.0,subdir=proto'
```

For remote locations that require authentication, see [HTTPS Authentication](../reference/inputs.md#https) and
[SSH Authentication](../reference/inputs.md#ssh) for more details.

### Archives

You can compare against a tar or zip archive of your `.proto` files as well. This is especially useful for
GitHub where tarballs and zip archives can be retrieved for any commit or branch.

```terminal
$ buf breaking --against "https://github.com/foo/bar/archive/${COMMIT}.tar.gz#strip_components=1"
$ buf breaking --against "https://github.com/foo/bar/archive/${COMMIT}.zip#strip_components=1"
# Assuming your repo is github.com/foo/bar and COMMIT is a variable storing the commit
# to compare against
```

## Deleted references

`buf breaking` is able to produce references to your current files even if a type is moved between
files. For example, if we moved the `Date` message to another file, `buf` would reference the location
within this file instead.

`buf` also attempts to use an enclosing type for deleted references. For example, if a field is deleted,
`buf` references the enclosing message if it is still present, and if a nested message is deleted, `buf`
references the enclosing message as well.

For example, from the tour:

```terminal
$ buf breaking --against "https://github.com/googleapis/googleapis/archive/${GOOGLEAPIS_COMMIT}.tar.gz#strip_components=1"
---
google/type/date.proto:50:3:Field "3" on message "Date" changed type from "int32" to "string".
```

## Limit to specific files

By default, `buf` builds all files under the `buf.yaml` configuration file. You can instead
manually specify the file or directory paths to run breaking change detection. This is an advanced
feature intended to be used for editor or Bazel integration - it is better to let `buf` discover
all files under management and handle this for you in general, especially when using the `FILE`
category.

Breaking change detection is limited to the given files if the `--path` flag is specified, as in
this command:

```terminal
$ buf breaking --against .git#branch=main --path path/to/foo.proto --path path/to/bar.proto
```

You can combine this with an in-line [configuration override](../configuration/overview.md#configuration-override), too:

```terminal
$ buf breaking --against .git#branch=main --path path/to/foo.proto --path path/to/bar.proto --config '{"breaking":{"use":["WIRE_JSON"]}}'
```

## Docker

Buf ships a Docker image [bufbuild/buf](https://hub.docker.com/r/bufbuild/buf) that enables
you to use `buf` as part of your Docker workflow. For example:

```terminal
$ docker run \
  --volume "$(pwd):/workspace" \
  --workdir /workspace \
  bufbuild/buf breaking --against '.git#branch=main'
```

## Advanced use cases

Due to the nature of inputs, `buf` happily compares just about anything. You may have an advanced
use case, so we want to demonstrate the capabilities of `buf` by comparing a `git` repository against a remote
archive.

You should be able to copy/paste this into your terminal:

```terminal
$ buf breaking \
  "https://github.com/googleapis/googleapis.git" \
  --against "https://github.com/googleapis/googleapis/archive/b89f7fa5e7cc64e9e38a59c97654616ad7b5932d.tar.gz#strip_components=1" \
  --config '{"breaking":{"use":["PACKAGE"]}}'
---
google/cloud/asset/v1/assets.proto:27:1:File option "cc_enable_arenas" changed from "false" to "true".
```

To explicitly target the `main` branch, you can adapt the command to include `branch=main` in the
`git` input:

```terminal {2}
$ buf breaking \
  "https://github.com/googleapis/googleapis.git#branch=main" \
  --against "https://github.com/googleapis/googleapis/archive/b89f7fa5e7cc64e9e38a59c97654616ad7b5932d.tar.gz#strip_components=1" \
  --config '{"breaking":{"use":["PACKAGE"]}}'
---
google/cloud/asset/v1/assets.proto:27:1:File option "cc_enable_arenas" changed from "false" to "true".
```
