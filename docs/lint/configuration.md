---
id: configuration
title: Configuration
---

`buf`'s linter is configured through a [`buf.yaml`](../configuration/v1/buf-yaml.md) file that is
placed at the root of the Protobuf source files it defines. If `buf lint` is executed for an
[input](../reference/inputs.md) that contains a `buf.yaml` file, its `lint` configuration is
used for the given operation.

If a `buf.yaml` file is not contained in the input, `buf` operates as if there is a `buf.yaml` file with the
[default values](#default-values).

The example config below shows all available configuration options. For more information on the `buf.yaml`
configuration, please refer to the [reference](../configuration/v1/buf-yaml.md).

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
  except:
    - FILE_LOWER_SNAKE_CASE
  ignore:
    - bat
    - ban/ban.proto
  ignore_only:
    ENUM_PASCAL_CASE:
      - foo/foo.proto
      - bar
    BASIC:
      - foo
  enum_zero_value_suffix: _UNSPECIFIED
  rpc_allow_same_request_response: false
  rpc_allow_google_protobuf_empty_requests: false
  rpc_allow_google_protobuf_empty_responses: false
  service_suffix: Service
  allow_comment_ignores: true
```

### `use`

The `use` key is **optional**, and lists the IDs or categories to use for linting. For example,
this config selects the `BASIC` lint category, as well as the `FILE_LOWER_SNAKE_CASE` ID:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - BASIC
    - FILE_LOWER_SNAKE_CASE
```

The default `use` value is the single item, `DEFAULT`.

### `except`

The `except` key is **optional**, and removes IDs or categories from the `use` list. For example,
this config results in all lint rules in the `DEFAULT` lint category being used except for
`ENUM_NO_ALLOW_ALIAS` and all lint rules in the `BASIC` category:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
  except:
    - ENUM_NO_ALLOW_ALIAS
    - BASIC
```

Note that since `DEFAULT` is the default value for `use`, this is equivalent to the above:

```yaml title="buf.yaml"
version: v1
lint:
  except:
    - ENUM_NO_ALLOW_ALIAS
    - BASIC
```

### `ignore`

The `ignore` key is **optional**, and allows directories or files to be excluded from all lint
rules when running `buf lint`. The specified directory or file paths **must** be relative to the
`buf.yaml`. For example, the lint result in `foo/bar.proto` is ignored with the config:

```yaml title="buf.yaml"
version: v1
lint:
  ignore:
    - foo/bar.proto
```

### `ignore_only`

The `ignore_only` key is **optional**, and allows directories or files to be excluded from specific
lint rules when running `buf lint` by taking a map from lint rule ID or category to path. As with
`ignore`, the paths **must** be relative to the `buf.yaml`

For example, this config sets up specific ignores for the ID `ENUM_PASCAL_CASE` and
the category `BASIC`:

```yaml title="buf.yaml"
version: v1
lint:
  ignore_only:
    ENUM_PASCAL_CASE:
      - foo/foo.proto
      - bar
    BASIC:
      - foo
```

### `allow_comment_ignores`

The `allow_comment_ignores` key is **optional**, and turns on comment-driven ignores.

```yaml title="buf.yaml"
version: v1
lint:
  allow_comment_ignores: true
```

If this option is set, leading comments can be added within Protobuf files to ignore lint errors
for certain components. If any line in a leading comment starts with `buf:lint:ignore ID`, then `buf`
ignores lint errors for this ID. For example:

```proto
syntax = "proto3";

// buf:lint:ignore PACKAGE_LOWER_SNAKE_CASE
// buf:lint:ignore PACKAGE_VERSION_SUFFIX
package A;
```

**We do not recommend using this.** Buf's goal is to help everyone develop consistent Protobuf
schemas regardless of organization, and for a large organization, it would not be helpful
for individual engineers to decide what should and should not be ignored. This should instead be
surfaced in a repository-wide configuration file such as `buf.yaml`.

If you do have  specific items that you want to ignore, we recommended adding the offending
types to a special file, for example `foo_lint_ignore.proto`, and setting the corresponding
`ignore` or `ignore_only`. For example, say we have a legacy enum that uses `allow_alias`.

```protobuf
enum Foo {
  option allow_alias = true;
  FOO_UNSPECIFIED = 0;
  FOO_ONE = 1;
  FOO_TWO = 1;
}
```

Place this enum in a file `foo_lint_ignore.proto` and then set up this configuration:

```yaml title="buf.yaml"
version: v1
lint:
  ignore_only:
    ENUM_NO_ALLOW_ALIAS:
      - path/to/foo_lint_ignore.proto
```

We do recognize, however, that there are situations where comment-driven ignores are necessary,
and we want users to be able to make informed decisions. Therefore, `allow_comment_ignores` is
added as an opt-in option. This also has the effect of making it possible to keep commen-driven
ignores disabled. For example, if you have commit checks for files via an authors/owners file,
you can make sure `buf.yaml` is owned by a top-level repository owner, and prevent
`allow_comment_ignores` from being set. so that `buf` ignores any `buf:lint:ignore`
annotations.

### `enum_zero_value_suffix`

The `enum_zero_value_suffix` key is **optional**, and controls the behavior of the
`ENUM_ZERO_VALUE_SUFFIX` lint rule. By default, this rule verifies that the zero value of all
enums ends in `_UNSPECIFIED`, as recommended by the [Google Protobuf Style Guide](https://developers.google.com/protocol-buffers/docs/style#enums).
However, organizations may have a different preferred suffix, for example `_NONE`, and this
allows this to be set like so:

```yaml title="buf.yaml"
version: v1
lint:
  enum_zero_value_suffix: _NONE
```

That config allows this:

```protobuf
enum Foo {
  FOO_NONE = 0;
}
```

### `rpc_allow_.*`

The `rpc_allow_same_request_response`, `rpc_allow_google_protobuf_empty_requests`, and
`rpc_allow_google_protobuf_empty_responses` options are **optional**, and control the behavior
of the `RPC_REQUEST_STANDARD_NAME`, `RPC_RESPONSE_STANDARD_NAME`, and `RPC_REQUEST_RESPONSE_UNIQUE`
lint rules.

**One of the single most important rules to enforce in modern Protobuf development is to have
a unique request and response message for every RPC.** Separate RPCs should not have their
request and response parameters controlled by the same Protobuf message, and if you share
a Protobuf message between multiple RPCs, this results in multiple RPCs being affected
when fields on this Protobuf message change. **Even in simple cases**, best practice
is to always have a wrapper message for your RPC request and response types. `buf` enforces
this as part of the `DEFAULT` category by verifying that:

- All requests and responses are unique across your Protobuf schema.
- All requests and response messages are named after the RPC, either by naming them
  according to one of these:
  * `MethodNameRequest/MethodNameResponse`
  * `ServiceNameMethodNameRequest/ServiceNameMethodNameResponse`

This service definition, for example, abides by these rules:

```protobuf
// request/response message definitions omitted for brevity

service FooService {
  rpc Bar(BarRequest) returns (BarResponse) {}
  rpc Baz(FooServiceBazRequest) returns (FooServiceBazResponse) {}
}
```

However, **while not recommended**, `buf` provides a few options to slightly loosen these restrictions:

- `rpc_allow_same_request_response` allows the same message type to be used for a single RPC's
  request and response type.
- `rpc_allow_google_protobuf_empty_requests` allows RPC requests to be [google.protobuf.Empty](https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/empty.proto)
  messages. This can be set if you want to allow messages to be void forever, that is, to
  never take any parameters.
- `rpc_allow_google_protobuf_empty_responses` allows RPC responses to be `google.protobuf.Empty`
  messages. This can be set if you want to allow messages to never return any parameters.

The file `google/protobuf/empty.proto` is part of the [Well-Known Types](https://developers.google.com/protocol-buffers/docs/reference/google.protobuf),
and can be directly included in any Protobuf schema. For example:

```protobuf
syntax = "proto3";

package foo.v1;

import "google/protobuf/empty.proto";

service BarService {
  // NOT RECOMMENDED
  rpc Baz(google.protobuf.Empty) returns (google.protobuf.Empty);
}
```

### `service_suffix`

The `service_suffix` key is **optional**, and controls the behavior of the `SERVICE_SUFFIX` lint rule.
By default, this rule verifies that all service names are suffixed with `Service`. However, organizations
may have a different preferred suffix, for example `API`, and this allows this to be set like so:

```yaml title="buf.yaml"
version: v1
lint:
  service_suffix: API
```

That config allows this:

```protobuf
service FooAPI {}
```

## Default values

If a `buf.yaml` does not exist, or if the `lint` key is not configured, this default configuration
is used:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
  enum_zero_value_suffix: _UNSPECIFIED
  rpc_allow_same_request_response: false
  rpc_allow_google_protobuf_empty_requests: false
  rpc_allow_google_protobuf_empty_responses: false
  service_suffix: Service
```
