---
id: protoc-plugin
title: Protoc Plugin
---

Buf ships a binary `protoc-gen-buf-lint` that performs the lint functionality as a `protoc`
plugin. This is useful in situations where you already have a `protoc` plugin setup, such as
[Bazel](https://bazel.build).

All flags and config are passed as an option to the plugin as JSON. This must be done with
the `--buf-lint_opt` flag as opposed to a parameter to `--buf-lint_out` as the option
includes the ":" character as part of JSON.

The option for `protoc-gen-buf-lint` has the following shape:

```json
{
  "input_config": @string_or_json_config,
  "log_level": @string,
  "log_format": @string,
  "error_format": @string,
  "timeout": @duration
}
```

For example:

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

For example:

```sh
$ protoc -I . --buf-lint_out=. $(find . -name '*.proto')
google/type/datetime.proto:17:1:Package name "google.type" should be suffixed with a correctly formed version, such as "google.type.v1".
pet/v1/pet.proto:42:10:Field name "petID" should be lower_snake_case, such as "pet_id".
pet/v1/pet.proto:47:9:Service name "PetStore" should be suffixed with "Service".
```

We can instead use a custom configuration as well:

```sh
$ protoc -I . --buf-lint_out=. '--buf-lint_opt={"input_config":{"version":"v1","lint":{"use":["SERVICE_SUFFIX"]}}}' $(find . -name '*.proto')
pet/v1/pet.proto:47:9:Service name "PetStore" should be suffixed with "Service".
```
