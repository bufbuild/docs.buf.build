---
id: usage
title: Usage
---

> We highly recommend completing [the tour](../tour/lint-your-api.md) to get an overview of
> `buf lint`.

## Define a module

To get started, create a [module](../bsr/overview.md#module) by adding a [`buf.yaml`](../configuration/v1/buf-yaml.md)
file to the root of the directory that contains your Protobuf definitions. You can create the default `buf.yaml`
file with this command:

```sh
$ buf config init
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

## Run lint

You can run `buf lint` on your module by specifying the filepath to the directory containing the `buf.yaml`.
In the above example, you can target the [input](../reference/inputs.md) defined in the current directory like so:

```sh
$ buf lint
```

The `buf lint` command:

  - Discovers all Protobuf files per your `buf.yaml` configuration.
  - Copies the Protobuf files into memory.
  - Compiles all Protobuf files.
  - Runs the compilation result against the configured lint rules.

If there are errors, they are printed out in a `file:line:column:message` format by default:

```sh
$ buf lint
google/type/datetime.proto:17:1:Package name "google.type" should be suffixed with a correctly formed version, such as "google.type.v1".
pet/v1/pet.proto:42:10:Field name "petID" should be lower_snake_case, such as "pet_id".
pet/v1/pet.proto:47:9:Service name "PetStore" should be suffixed with "Service".
```

Lint output can also be printed as JSON:

```sh
$ buf lint --error-format=json
{"path":"google/type/datetime.proto","start_line":17,"start_column":1,"end_line":17,"end_column":21,"type":"PACKAGE_VERSION_SUFFIX","message":"Package name \"google.type\" should be suffixed with a correctly formed version, such as \"google.type.v1\"."}
{"path":"pet/v1/pet.proto","start_line":42,"start_column":10,"end_line":42,"end_column":15,"type":"FIELD_LOWER_SNAKE_CASE","message":"Field name \"petID\" should be lower_snake_case, such as \"pet_id\"."}
{"path":"pet/v1/pet.proto","start_line":47,"start_column":9,"end_line":47,"end_column":17,"type":"SERVICE_SUFFIX","message":"Service name \"PetStore\" should be suffixed with \"Service\"."}
```

We can also output errors in a format you can then copy into your `buf.yaml` file. This
lets you ignore all existing lint errors and correct them over time:

```sh
$ buf lint --error-format=config-ignore-yaml
version: v1
lint:
  ignore_only:
    FIELD_LOWER_SNAKE_CASE:
      - pet/v1/pet.proto
    PACKAGE_VERSION_SUFFIX:
      - google/type/datetime.proto
    SERVICE_SUFFIX:
      - pet/v1/pet.proto
```

## Common use cases

`buf` can lint additional inputs instead of just your local Protobuf files. This is useful in a
variety of scenarios, including enabling `protoc` output be used as `buf` input.

See the [input documentation](../reference/inputs.md) for details on all available inputs.

For example,

```sh
# Lint output from protoc passed to stdin.
$ protoc -I . --include_source_info $(find . -name '*.proto') -o /dev/stdout | buf lint -

# Lint a remote git repository on the fly and override the config to be your local config file.
$ buf lint 'https://github.com/googleapis/googleapis.git' --config buf.yaml

# Lint a module published to the BSR.
$ buf lint buf.build/acme/petapis
```

For remote locations that require authentication, see [HTTPS Authentication](../reference/inputs.md#https)
and [SSH Authentication](../reference/inputs.md#ssh) for more details.

## Limit to specific files

By default, `buf` builds all files under the `buf.yaml` configuration file. You can instead
manually specify the file or directory paths to lint. This is an advanced feature intended to be
used for editor or [Bazel](/build-systems/bazel.md) integration - it is better to let `buf` discover
all files under management and handle this for you in general.

```sh
$ buf lint --path path/to/foo.proto --path path/to/bar.proto
```

You can combine this with an in-line [configuration override](../configuration/overview.md#configuration-override), too:

```sh
$ buf lint --path path/to/foo.proto --path path/to/bar.proto --config '{"lint":{"use":["BASIC"]}}'
```

## Docker

Buf ships a Docker image [bufbuild/buf](https://hub.docker.com/r/bufbuild/buf) that enables
you to use `buf` as part of your Docker workflow. For example:

```sh
$ docker run \
  --volume "$(pwd):/workspace" \
  --workdir /workspace \
  bufbuild/buf lint
```
