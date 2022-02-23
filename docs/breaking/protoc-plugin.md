---
id: protoc-plugin
title: protoc plugin
---

Buf ships a binary `protoc-gen-buf-breaking` that performs the breaking change detection
functionality as a `protoc` plugin. This is useful in situations where you already have a
`protoc` plugin setup, such as [Bazel](https://bazel.build).

All flags and config are passed as an option to the plugin as JSON. This must be done with
the `--buf-breaking_opt` flag as opposed to a parameter to `--buf-breaking_out` as the option
includes the ":" character as part of JSON.

The option for `protoc-gen-buf-breaking` has this shape:

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

For example:

```json
{
  "against_input": "image.bin",
  "limit_to_input_files": true
}
```

  - `against_input` is required and limited to [Buf image formats](../reference/images.md). The
    format must be `bin` or `json` and cannot be `dir`, `git`, `tar`, `zip`, etc.
  - `limit_to_input_files` says to limit checks to those files under build by `protoc` in the
     current invocation, in this case the `file_to_generate` in the [CodeGeneratorRequest](https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/compiler/plugin.proto).
     Generally, you want to set this option when using this plugin. We do not make this
     the default to have symmetry with `buf breaking`.

```sh
$ protoc -I . --buf-breaking_out=. '--buf-breaking_opt={"against_input":"image.bin","limit_to_input_files":true}' $(find . -name '*.proto')
pet/v1/pet.proto:18:3:Field "1" on message "Pet" changed type from "enum" to "string".
```
