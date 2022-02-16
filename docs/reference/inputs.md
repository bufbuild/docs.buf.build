---
id: inputs
title: Inputs
---

The various I/O options for `buf` can seem daunting and overly complex, so we'll break down how this
all fits together.

In general, an input is a collection of `.proto` files used by many of the `buf` commands.
In most cases, this is a [module](../bsr/overview.md#modules), but a variety of other formats are supported
and explained below.

> By default, `buf` uses the current directory as its input for all commands.

## Terminology

First, some basic terminology to help our discussion:

- A **Source** is a set of `.proto` files that can be compiled.
- An **Image** is a compiled set of `.proto` files. This is itself a Protobuf message. The exact
  mechanics of Images are described in the [Image documentation](images.md). **Images** are created
  from **Sources** using `buf build`.
- An **Input** is either a **Source** or an **Image**.
- All **Inputs** have a **Format**, which describes the type of the **Input**. This **Format** is
  usually automatically derived, however it can be explicitly set.

## Why?

Generally, your only goal is to work with `.proto` files on disk. This is how `buf` works by default.
However, there are cases where one wants to work with more than just local files, which are described
below.

### The Buf Schema Registry (BSR)

The core primitive for Buf is the module, which is emphasized by the Buf Schema Registry ([BSR](../bsr/overview.md)).
With the BSR, you can use any version of a module as an input for each
of the `buf` commands.

For example, you can run `buf lint` for all of the files contained in the `buf.build/acme/weather` module like
so:

```sh
$ buf lint buf.build/acme/weather
```

### Breaking change detection

The biggest current use case is for [breaking change detection](../breaking/overview.md). When you are comparing your
current Protobuf schema to an old version of your schema, you have to decide - where is your old
version stored? `buf` provides multiple options for this, including the ability to directly compile
and compare against a Git branch or Git tag.

However, it is sometimes preferable to store a representation of your old version in a file. `buf` provides
this functionality with Images, allowing you to store your golden state, and then compare your
current Protobuf schema against this golden state. This includes support for partial comparisons, as well
as storing this golden state in a remote location.

For example:

```sh
$ buf build -o image.bin
$ buf breaking --against image.bin
```

## Specifying an Input

Inputs are specified as the first argument on the command line, and with the `--against` flag for the
compare against Input on `buf breaking`.

For each of `buf {build,lint,breaking,generate,ls-files}`, the Input is specified as the first argument.
Inputs are specified as a string, and have this structure:

```
path#option_key1=option_value1,option_key2=option_value2
```

The path specifies the path to the Input. The options specify options to interpret the
Input at the path.

### format option

The `format` option can be used on any Input string to override the derived Format.

Examples:

  - `path/to/file.data#format=bin` explicitly sets the Format to `bin`. By default this path
    would be interpreted as Format `dir`.
  - `https://github.com/googleapis/googleapis#format=git` explicitly sets the Format to `git`. In
    this case however, note that `https://github.com/googleapis/googleapis.git` has the
    same effect; the `.git` suffix is used to infer the Format (see below for derived Formats).
  - `-#format=json` explicitly sets the Format to `json`, which reads from stdin as JSON, or in the case
    of `buf build --output`, writes to stdout as JSON.

### Other options

As of now, there are seven other options, all of which are Format-specific:

  - The `branch` option specifies the branch to clone for `git` Inputs.
  - The `tag` option specifies the tag to clone for `git` Inputs.
  - The `ref` option specifies an explicit `git` reference for `git` Inputs. Any ref that is a valid
    input to `git checkout` is accepted.
  - The `depth` option optionally specifies how deep of a clone to perform.
    This defaults to 50 if ref is set, and 1 otherwise.
  - The `recurse_submodules` option says to clone submodules recursively for `git` Inputs.
  - The `strip_components` option specifies the number of directories to strip for `tar` or `zip` Inputs.
  - The `subdir` option specifies a subdirectory to use within a `git`, `tar`, or `zip` Input.

If `ref` is specified, `branch` can be further specified to clone a specific branch before checking
out the `ref`.

## Source Formats

All Sources contain a set of `.proto` files that can be compiled.

### dir

A local directory. The path can be either relative or absolute.

**This is the default Format**. By default, `buf` uses the current directory as its input for all commands.

Examples:

  - `path/to/dir` says to compile the files in this relative directory path.
  - `/absolute/path/to/dir` says to compile the files in this absolute directory path.

### tar

A tarball. The path to this tarball can be either a local file, a remote http/https location, or
`-` for stdin.

Use `compression=gzip` to specify that the tarball is compressed with Gzip. This is automatically
detected if the file extension is `.tgz` or `.tar.gz`.

Use `compression=zstd` to specify that the tarball is compressed with Zstandard. This is automatically
detected if the file extension is `.tar.zst`.

The `strip_components` and `subdir` options are optional. Note that `strip_components` is applied
before `subdir`.

Examples:

  - `foo.tar` says to read the tarball at this relative path.
  - `foo.tar.gz` says to read the gzipped tarball at this relative path.
  - `foo.tgz` says to read the gzipped tarball at this relative path.
  - `foo.tar.zst` says to read the zstandard tarball at this relative path.
  - `foo.tar#strip_components=2` says to read the tarball at this relative path and strip the first two directories.
  - `foo.tgz#subdir=proto` says to read the gzipped tarball at this relative path, and use the subdirectory `proto`
    within the archive as the base directory.
  - `https://github.com/googleapis/googleapis/archive/master.tar.gz#strip_components=1` says to read
    the gzipped tarball at this http location, and strip one directory.
  - `-#format=tar` says to read a tarball from stdin.
  - `-#format=tar,compression=gzip` says to read a gzipped tarball from stdin.
  - `-#format=tar,compression=zstd` says to read a zstandard tarball from stdin.

### zip

A zip archive. The path to this archive can be either a local file, a remote http/https location, or
`-` for stdin.

The `strip_components` and `subdir` options are optional. Note that `strip_components` is applied
before `subdir`.

Examples:

- `foo.zip` says to read the zip archive at this relative path.
- `foo.zip#strip_components=2` says to read the zip archive at this relative path and strip the first two directories.
- `foo.zip#subdir=proto` says to read the zip archive at this relative path, and use the subdirectory `proto`
  within the archive as the base directory.
- `https://github.com/googleapis/googleapis/archive/master.zip#strip_components=1` says to read
  the zip archive at this http location, and strip one directory.
- `-#format=zip` says to read a zip archive from stdin.

### git

A Git repository. The path to the Git repository can be either a local `.git` directory, or a remote
`http://`, `https://`, `ssh://`, or `git://` location.

  - The `branch` option specifies the branch to clone.
  - The `tag` option specifies the tag to clone.
  - The `ref` option specifies an explicit Git reference. Any ref that is a valid
    input to `git checkout` is accepted.
  - The `depth` option specifies how deep of a clone to perform. It defaults to 50 if `ref` is used and 1 otherwise.
  - The `recurse_submodules` option says to clone submodules recursively.
  - The `subdir` option says to use this subdirectory as the base directory.

Note that `http://`, `https://`, `ssh://`, and `git://` locations must be prefixed with their scheme:

  - HTTP locations must start with `http://`.
  - HTTPS locations must start with `https://`.
  - SSH locations must start with `ssh://`.
  - Git locations must start with `git://`.

Examples:

  - `.git#branch=master` says to clone the master branch of the git repository at the relative path
    `.git`. This is particularly useful for local breaking change detection.
  - `.git#tag=v1.0.0` says to clone the v1.0.0 tag of the git repository at the relative path
    `.git`.
  - `.git#branch=master,subdir=proto` say to clone the master branch and use the `proto` directory
    as the base directory.
  - `.git#branch=master,recurse_submodules=true` says to clone the master branch along with all
    recursive submodules.
  - `.git#ref=7c0dc2fee4d20dcee8a982268ce35e66fc19cac8` says to clone the repo and checkout the specific ref.
    Any ref that is a valid input to `git checkout` can be used.
  - `.git#ref=refs/remotes/pull/3,branch=my_feature,depth=100` says to clone the specified branch
    to a depth of 100 and checkout `refs/remotes/pull/3`.
  - `https://github.com/googleapis/googleapis.git` says to clone the default branch of
    the git repository at the remote location.
  - `https://github.com/googleapis/googleapis.git#branch=master` says to clone the master branch of
    the git repository at the remote location.
  - `https://github.com/googleapis/googleapis.git#tag=v1.0.0` says to clone the v1.0.0 tag of
    the git repository at the remote location.
  - `git://github.com/googleapis/googleapis.git#branch=master` is also valid.
  - `ssh://git@github.com/org/private-repo.git#branch=master` is also valid.
  - `https://github.com/googleapis/googleapis#format=git,branch=master` is also valid.

### file

A local proto file. The path can be either relative or absolute, similar to the [dir](#dir) input.
This is a special input that uses the file and its imports as the input to `buf` commands.
If a local [configuration](configuration/overview.md) file is found, dependencies specified are used to
resolve file imports first, followed by the local filesystem. If there is no local configuration, the local
filesystem is used to resolve file imports.

- The `include_package_files` option can used to include all other files in the package for the specified proto file.
  This is set to `false` by default.

Examples:

- `buf build path/to/my/file.proto` compiles an [image](reference/images.md) based on the file and
  its imports.
- An absolute path, `/absolute/path/to/my/file.proto` can also be accepted.
- `buf build path/to/my/file.proto#include_package_files=true` compiles an [image](reference/images.md) for the file
  and the files in the package and their imports.
- `buf build path/to/my/file.proto#include_package_files=false` is equivalent to the default behavior.

### Symlinks

Note that symlinks are supported for `dir` and `file` inputs only, while `git`, `tar`, and `zip` Inputs
ignore all symlinks.

## Image Formats

All Images are files. Files can be read from a local path, a remote http/https location,
or `-` for stdin.

Images are created using `buf build`. Examples:

  - `buf build -o image.bin`
  - `buf build -o image.bin.gz`
  - `buf build -o image.bin.zst`
  - `buf build -o image.json`
  - `buf build -o image.json.gz`
  - `buf build -o image.json.zst`
  - `buf build -o -`
  - `buf build -o -#format=json`
  - `buf build -o -#format=json,compression=gzip`
  - `buf build -o -#format=json,compression=zstd`

Note that `-o` is an alias for `--output`.

**Images can also be created in the `bin` Format using `protoc`**. See the [internal compiler](../build/internal-compiler.md)
documentation for more details.

For example, the command below shows a valid way to compile all Protobuf files in your current directory,
produce a [FileDescriptorSet](https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto)
(which is also an Image, as described in the [Image documentation](images.md)) to stdout, and read this Image as binary
from stdin:

```sh
$ protoc -I . $(find. -name '*.proto') -o /dev/stdout | buf lint -
```

### bin

A binary Image.

Use `compression=gzip` to specify the Image is compressed with Gzip. This is automatically detected
if the file extension is `.bin.gz`

Use `compression=zstd` to specify the Image is compressed with Zstandard. This is automatically detected
if the file extension is `.bin.zst`

Examples:

  - `image.bin` says to read the file at this relative path.
  - `image.bin.gz` says to read the gzipped file at this relative path.
  - `image.bin.zst` says to read the zstandard file at this relative path.
  - `-` says to read a binary Image from stdin.
  - `-#compression=gzip` says to read a gzipped binary Image from stdin.
  - `-#compression=zstd` says to read a zstandard binary Image from stdin.

### json

A JSON Image. This creates Images that take much more space, and are slower to parse, but results
in diffs that show the actual differences between two Images in a readable format.

Use `compression=gzip` to specify the Image is compressed with Gzip. This is automatically detected
if the file extension is `.json.gz`

Use `compression=zstd` to specify the Image is compressed with Zstandard. This is automatically detected
if the file extension is `.json.zst`

Examples:

  - `image.json` says to read the file at this relative path.
  - `image.json.gz` says to read the gzipped file at this relative path.
  - `image.json.zst` says to read the zstandard file at this relative path.
  - `-#format=json` says to read a JSON Image from stdin.
  - `-#format=json,compression=gzip` says to read a gzipped JSON Image from stdin.
  - `-#format=json,compression=zstd` says to read a zstandard JSON Image from stdin.

When combined with [jq](https://stedolan.github.io/jq), this also allows for introspection. For example,
to see a list of all packages:

```sh
$ buf build -o -#format=json | jq '.file[] | .package' | sort | uniq | head
"google.actions.type"
"google.ads.admob.v1"
"google.ads.googleads.v1.common"
"google.ads.googleads.v1.enums"
"google.ads.googleads.v1.errors"
"google.ads.googleads.v1.resources"
"google.ads.googleads.v1.services"
"google.ads.googleads.v2.common"
"google.ads.googleads.v2.enums"
"google.ads.googleads.v2.errors"
```

## Automatically derived Formats

By default, `buf` derives the Format and compression of an Input from the path via the file
extension.

| Extension | Derived Format | Derived Compression |
| --- | --- | --- |
| .bin | bin | none |
| .bin.gz | bin | gzip |
| .bin.zst | bin | zstd |
| .json | json | none |
| .json.gz| json | gzip |
| .json.zst| json | zstd |
| .tar | tar | none |
| .tar.gz | tar | gzip |
| .tgz | tar | gzip |
| .tar.zst | tar | zstd |
| .zip | zip | n/a |
| .git | git | none |

There are also **two special cases**:

  - If the path is `-`, this is interpreted to mean stdin. By default, this is interpreted as the `bin`
    Format.

    Of note, the special value `-` can also be used as a value to the `--output` flag of `buf build`,
    which is interpreted to mean stdout, and also interpreted by default as the `bin` Format.

  - If the path is `/dev/null` on Linux or Mac, or `nul` for Windows, this is
    interpreted as the `bin` format.

**If no format can be automatically derived, the `dir` format is assumed**, meaning that `buf`
assumes that the path is a path to a local directory.

The format of an Input can be explicitly set as described above.

## Deprecated Formats

The formats below are deprecated. They should continue to work forever, but we recommend
updating if you are explicitly specifying any of these.

| Format | Replacement |
| --- | --- |
| bingz | Use the `bin` format with the `compression=gzip` option. |
| jsongz | Use the `json` format with the `compression=gzip` option. |
| targz | Use the `tar` format with the `compression=gzip` option. |

## Authentication

Archives, Git repositories, and Image files can be read from remote locations. For those remote
locations that need authentication, a couple mechanisms exist.

### HTTPS

Remote archives and Image files use [netrc files](https://ec.haxx.se/usingcurl/usingcurl-netrc)
for authentication. `buf` looks for a netrc file at `$NETRC` first, defaulting to `~/.netrc`.

Git repositories are cloned using the `git` command, so any credential helpers you have configured
are automatically used.

Basic authentication can be also specified for remote archives, Git repositories, and Image files over
HTTPS with these environment variables:

- `BUF_INPUT_HTTPS_USERNAME` is the username. For GitHub, this is your GitHub user.
- `BUF_INPUT_HTTPS_PASSWORD` is the password. For GitHub, this is a personal access token for your GitHub User.

Assuming one of these mechanisms is present, you can call `buf` as you normally would:

```sh
$ buf lint https://github.com/org/private-repo.git#branch=master
$ buf lint https://github.com/org/private-repo.git#tag=v1.0.0
$ buf lint https://github.com/org/private-repo/archive/master.tar.gz#strip_components=1
$ buf lint https://github.com/org/private-repo/archive/master.zip#strip_components=1
$ buf breaking --against https://github.com/org/private-repo.git#branch=master
$ buf breaking --against https://github.com/org/private-repo.git#tag=v1.0.0
```

### SSH

Public key authentication can be used for remote Git repositories over SSH.

Git repositories are cloned via the `git` command, so by default, `buf` uses your existing Git SSH
configuration, including any identities added to `ssh-agent`.

These environment variables can also be used:

- `BUF_INPUT_SSH_KEY_FILE` is the path to the private key file.
- `BUF_INPUT_SSH_KNOWN_HOSTS_FILES` is a colon-separated list of known hosts file paths.

Assuming one of these mechanisms is present, you can call `buf` as you normally would:

```sh
$ buf lint ssh://git@github.com/org/private-repo.git#branch=master
$ buf lint ssh://git@github.com/org/private-repo.git#tag=v1.0.0
$ buf breaking --against ssh://git@github.com/org/private-repo.git#branch=master
$ buf breaking --against ssh://git@github.com/org/private-repo.git#tag=v1.0.0
```

Note that CI services such as [CircleCI](https://circleci.com) have a private key and known hosts
file pre-installed, so this should work out of the box.

## Input configuration

By default, `buf` looks for a [`buf.yaml`](../configuration/v1/buf-yaml.md) in this manner:

- For `dir, bin, json` Inputs, `buf` looks at your current directory for a `buf.yaml` file.
- For `tar` and `zip` Inputs, `buf` looks at the root of the archive for a `buf.yaml` file
  after `strip_components` is applied.
- For `git` Inputs, `buf` looks at the root of the cloned repository at the head of the
  cloned branch.

The configuration can be overridden with the `--config` flag. See the [configuration documentation](../configuration/overview.md#configuration-override)
for more details.
