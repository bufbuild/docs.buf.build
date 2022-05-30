---
id: usage
title: Usage
---

> We recommend completing [the Tour of Buf](../tour/lint-your-api.md) for an overview of Protobuf
> linting with the `buf lint` command.

## Define a module

To get started linting your Protobuf sources, create a [Buf module](../bsr/overview.md#modules) by
adding a [`buf.yaml`](../configuration/v1/buf-yaml.md) file to the root of the directory that
holds your Protobuf definitions. You can create the default `buf.yaml` file with this command:

```teminal
$ buf mod init
```

That creates this file:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

As you can see, the default configuration applies the [`DEFAULT`](./rules.md#default) rules.

## Run lint

You can run `buf lint` on your module by specifying the filepath to the directory containing the
`buf.yaml`. It uses the current directory by default, so you can target the
[input](../reference/inputs.md) defined in the current directory with this command:

```terminal
$ buf lint
```

The `buf lint` command performs these actions in order:

  - **Discovers** all of the Protobuf files per your `buf.yaml` configuration.
  - **Copies** them into memory.
  - **Compiles** them
  - **Runs** the compilation result against the configured lint rules.

import Examples from "@site/src/components/Examples";

<Examples subject="linting Protobuf sources with Buf" projects={["linting"]} />

### Error syntax {#syntax}

Any lint errors discovered are printed out in this format:

import Syntax from "@site/src/components/Syntax";

<Syntax
  title="Lint error syntax"
  examples={[
    "pet/v1/pet.proto:47:9:Service name \"PetStore\" should be suffixed with \"Service\"."
  ]}
  segments={[
    {label: "file", kind: "variable"},
    {separator: ":"},
    {label: "line", kind: "variable"},
    {separator: ":"},
    {label: "column", kind: "variable"},
    {separator: ":"},
    {label: "message", kind: "variable"}
  ]}
/>

Here's a full example output:

```terminal
$ buf lint
---
google/type/datetime.proto:17:1:Package name "google.type" should be suffixed with a correctly formed version, such as "google.type.v1".
pet/v1/pet.proto:42:10:Field name "petID" should be lower_snake_case, such as "pet_id".
pet/v1/pet.proto:47:9:Service name "PetStore" should be suffixed with "Service".
```

### JSON output {#json}

You can print lint output as JSON:

```terminal
$ buf lint --error-format=json
---
{"path":"google/type/datetime.proto","start_line":17,"start_column":1,"end_line":17,"end_column":21,"type":"PACKAGE_VERSION_SUFFIX","message":"Package name \"google.type\" should be suffixed with a correctly formed version, such as \"google.type.v1\"."}
{"path":"pet/v1/pet.proto","start_line":42,"start_column":10,"end_line":42,"end_column":15,"type":"FIELD_LOWER_SNAKE_CASE","message":"Field name \"petID\" should be lower_snake_case, such as \"pet_id\"."}
{"path":"pet/v1/pet.proto","start_line":47,"start_column":9,"end_line":47,"end_column":17,"type":"SERVICE_SUFFIX","message":"Service name \"PetStore\" should be suffixed with \"Service\"."}
```

### Copy errors into your configuration {#copy}

We can output errors in a format that you can copy into your
[`buf.yaml`](../configuration/v1/buf-yaml.md) configuration file. This enables you to ignore
specific lint errors and gradually correct them over time:

```terminal
$ buf lint --error-format=config-ignore-yaml
---
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

`buf` can lint [inputs](../reference/inputs.md) beyond your local Protobuf files, such as [Git
repositories](../reference/inputs.md#git) and [tarballs](../reference/inputs.md#tar). This can be
useful in a variety of scenarios, such as using [protoc] output as `buf` input. Here are some
examples script:

```sh
# Lint output from protoc passed to stdin.
protoc -I . --include_source_info $(find . -name '*.proto') -o /dev/stdout | buf lint -

# Lint a remote git repository on the fly and override the config to be your local config file.
buf lint 'https://github.com/googleapis/googleapis.git' --config buf.yaml

# Lint a module published to the Buf Schema Registry.
buf lint buf.build/acme/petapis
```

For remote locations that require authentication, see [HTTPS
Authentication](../reference/inputs.md#https) and [SSH Authentication](../reference/inputs.md#ssh).

## Limit to specific files

By default, the `buf` CLI builds all files under your [`buf.yaml`](../configuration/v1/buf-yaml.md)
configuration file. But you can optionally lint only specific files or directories. This is an
advanced feature that's mostly intended to be used by other systems, like editors. In general, it's
better to let the `buf` CLI discover all files and handle this for you. But if you do need this,
you can use the `--path` flag:

```terminal
$ buf lint \
  --path path/to/foo.proto \
  --path path/to/bar.proto
```

You can also combine this with an in-line [configuration
override](../configuration/overview.md#configuration-override):

```terminal
$ buf lint \
  --path path/to/foo.proto \
  --path path/to/bar.proto \
  --config '{"version":"v1","lint":{"use":["BASIC"]}}'
```

## Docker

Buf ships a Docker image, [`bufbuild/buf`][image], that enables
you to use `buf` as part of your Docker workflow. Here's an example:

```terminal
$ docker run \
  --volume "$(pwd):/workspace" \
  --workdir /workspace \
  bufbuild/buf lint
```

[image]: https://hub.docker.com/r/bufbuild/buf
[protoc]: https://github.com/protocolbuffers/protobuf
