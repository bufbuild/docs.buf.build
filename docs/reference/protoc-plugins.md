---
id: protoc-plugins
title: protoc plugins
---

Buf ships with two binaries that you can use as [protoc] plugins:

* [`protoc-gen-buf-breaking`](#breaking)
* [`protoc-gen-buf-lint`](#lint)

Buf doesn't use these binaries but they can be useful in situations where you have a protoc setup
in place, for example when using [Bazel].

## `protoc-gen-buf-breaking` {#breaking}

The `protoc-gen-buf-breaking` binary performs [breaking change detection][breaking] as a `protoc`
plugin.

All flags and config are passed to the plugin as an option in JSON format. You need to pass these
options using `--buf-breaking_opt` as opposed to `--buf-breaking_out`, as the option includes the
`:` character as part of JSON.

The option for `protoc-gen-buf-breaking` has this structure:

```json
{
  "against_input": @string,
  "against_input_config": @string_or_json_config,
  "input_config": @string_or_json_config,
  "limit_to_input_files": @bool,
  "exclude_imports": @bool,
  "log_level": @string,
  "log_format": @string,
  "error_format": @string,
  "timeout": @duration
}
```

An example option:

```json
{
  "against_input": "image.bin",
  "limit_to_input_files": true
}
```

- `against_input` is required and limited to [Buf image formats](../reference/images.md). The
  format must be `bin` or `json` and can't be `dir`, `git`, `tar`, `zip`, etc.
- `limit_to_input_files` limits checks to those files under build by `protoc` in the
  current invocation, in this case the `file_to_generate` in the [`CodeGeneratorRequest`][req].
  We generally recommend setting this option when using this plugin. We don't make this
  the default in order to maintain symmetry with [`buf breaking`][breaking].

Here's an example usage of the binary in conjunction with protoc:

```terminal
$ protoc \
  -I . \
  --buf-breaking_out=. \
  '--buf-breaking_opt={"against_input":"image.bin","limit_to_input_files":true}' \
  $(find . -name '*.proto')
---
pet/v1/pet.proto:18:3:Field "1" on message "Pet" changed type from "enum" to "string".
```

## `protoc-gen-buf-lint` {#lint}

The `protoc-gen-buf-lint` binary performs [linting][lint] as a `protoc` plugin.

All flags and config are passed to the plugin as an option in JSON format. You need to pass these
options using `--buf-lint_opt` as opposed to `--buf-lint_out`, as the option includes the
`:` character as part of JSON.

The option for `protoc-gen-buf-lint` has this structure:

```json
{
  "input_config": @string_or_json_config,
  "log_level": @string,
  "log_format": @string,
  "error_format": @string,
  "timeout": @duration
}
```

An example option:

```json
{
  "input_config": {
    "version": "v1",
    "lint": {
      "use": [
        "ENUM_NO_ALLOW_ALIAS"
      ]
    }
  },
  "error_format": "json"
}
```

Here's an example usage of the binary in conjunction with protoc:

```terminal
$ protoc \
  -I . \
  --buf-lint_out=. \
  $(find . -name '*.proto')
---
google/type/datetime.proto:17:1:Package name "google.type" should be suffixed with a correctly formed version, such as "google.type.v1".
pet/v1/pet.proto:42:10:Field name "petID" should be lower_snake_case, such as "pet_id".
pet/v1/pet.proto:47:9:Service name "PetStore" should be suffixed with "Service".
```

You can also use a custom configuration:

```terminal
$ protoc \
  -I . \
  --buf-lint_out=. \
  '--buf-lint_opt={"input_config":{"version":"v1","lint":{"use":["SERVICE_SUFFIX"]}}}' \
  $(find . -name '*.proto')
---
pet/v1/pet.proto:47:9:Service name "PetStore" should be suffixed with "Service".
```

[breaking]: ../breaking/overview.md
[lint]: ../lint/overview.md
[protoc]: https://developers.google.com/protocol-buffers
[req]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/compiler/plugin.proto
