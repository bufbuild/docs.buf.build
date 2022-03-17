---
id: rules
title: Rules and categories
---

> The rules and categories described here belong to the latest [`v1`](../configuration/v1/buf-yaml.md)
> release. If you're still using `v1beta1` and haven't [migrated](../configuration/v1beta1-migration-guide.md) yet,
> refer to the previous [reference](../configuration/v1beta1/lint-rules.md).

`buf` provides a carefully curated set of lint rules designed to provide consistency and maintainability
across a Protobuf schema of any size and any purpose, but without being so opinionated as to restrict
organizations from making the design decisions they need to make for their individual APIs.

`buf lint` applies individual lint rules across your Protobuf schema, reporting any violations as errors.
All lint rules have an **ID**, and belong to one or more **categories**. On this page, we'll discuss the
available categories, and the individual rules within each category.

Although categories are not required to be in tree form, they can be represented as such. Note this is just
a human representation and is not actual configuration.

  - `DEFAULT`
    - `BASIC`
      - `MINIMAL`
  - `COMMENTS`
  - `UNARY_RPC`

## Style guide

The [Style Guide](../best-practices/style-guide.md) provides a concise document that includes all rules in the
`DEFAULT` category, as well as additional recommendations that are not enforced. We provide this for ease of consumption
across your various teams, while linking back to this document for rationale for individual rules.

## Categories

`buf` provides three "main top-level" categories of increasing strictness:

- `MINIMAL`
- `BASIC`
- `DEFAULT`

These provide the majority of lint rules you may want to apply. Additionally, `buf` provides "extra top-level"
categories:

- `COMMENTS`
- `UNARY_RPC`

These categories enforce additional constraints that users can apply to their Protobuf schema.

### `MINIMAL`

The `MINIMAL` category represents what we consider to be **fundamental rules for modern Protobuf development.** We
find these rules so important that these should be required for `protoc` to produce valid output.

Not applying these rules can lead to a myriad of bad situations across the variety of available
Protobuf plugins, especially plugins not built into `protoc` itself. There is no downside to
applying these rules. If you can't tell, we **highly** recommend abiding by the `MINIMAL` group
for your development sanity.

The `MINIMAL` category includes several rules. They are listed here and described in more detail below:

  - `MINIMAL`
    - `DIRECTORY_SAME_PACKAGE`
    - `PACKAGE_DEFINED`
    - `PACKAGE_DIRECTORY_MATCH`
    - `PACKAGE_SAME_DIRECTORY`

#### `DIRECTORY_SAME_PACKAGE`

This rule checks that all files in a given directory are in the same package.

#### `PACKAGE_DEFINED`

This rule checks that all files have a package declaration.

#### `PACKAGE_SAME_DIRECTORY`

This rule checks that all files with a given package are in the same directory.

#### `PACKAGE_DIRECTORY_MATCH`

This rule checks that all files are in a directory that matches their package name.

#### Why?

In short, the `MINIMAL` category verifies that all files with package `foo.bar.baz.v1` are in the
directory `foo/bar/baz/v1` (relative to the [`buf.yaml`](../configuration/v1/buf-yaml.md) file), and that
only one such directory exists. For example, consider this `tree`:

```sh
.
├── buf.yaml
└── foo
    └── bar
        ├── bat
        │   └── v1
        │       └── bat.proto // package foo.bar.bat.v1
        └── baz
            └── v1
                ├── baz.proto         // package foo.bar.baz.v1
                └── baz_service.proto // package foo.bar.baz.v1
```

`protoc` doesn't enforce file structure in any way, but you're likely to have a rough time
with many Protobuf plugins across various languages if you do not do this.

This structure has the effect of allowing imports to self-document their package. For example,
you can discern that the import `foo/bar/bat/v1/bat.proto` has types in the package `foo.bar.bat.v1`.

There is no downside to maintaining this structure, and in fact many languages explicitly
or effectively enforce such a file structure anyways (for example, Golang and Java).

### `BASIC`

The `BASIC` category includes everything from the `MINIMAL` category, and adds basic style rules that
are widely accepted as standard Protobuf style. These rules should generally be applied for all Protobuf
schemas.

These style checks represent the "old" [Google Style Guide](https://developers.google.com/protocol-buffers/docs/style)
that has been around for years, before elements from the [Uber Style Guide](https://github.com/uber/prototool/tree/dev/style)
were merged in during the spring of 2019.

This configuration...

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - BASIC
```

...is equivalent to this:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - MINIMAL
    - ENUM_PASCAL_CASE
    - ENUM_VALUE_UPPER_SNAKE_CASE
    - FIELD_LOWER_SNAKE_CASE
    - MESSAGE_PASCAL_CASE
    - ONEOF_LOWER_SNAKE_CASE
    - PACKAGE_LOWER_SNAKE_CASE
    - RPC_PASCAL_CASE
    - SERVICE_PASCAL_CASE
    - PACKAGE_SAME_CSHARP_NAMESPACE
    - PACKAGE_SAME_GO_PACKAGE
    - PACKAGE_SAME_JAVA_MULTIPLE_FILES
    - PACKAGE_SAME_JAVA_PACKAGE
    - PACKAGE_SAME_PHP_NAMESPACE
    - PACKAGE_SAME_RUBY_PACKAGE
    - PACKAGE_SAME_SWIFT_PREFIX
    - ENUM_FIRST_VALUE_ZERO
    - ENUM_NO_ALLOW_ALIAS
    - IMPORT_NO_WEAK
    - IMPORT_NO_PUBLIC
```

#### `ENUM_PASCAL_CASE`

This rule checks that enums are PascalCase.

#### `ENUM_VALUE_UPPER_SNAKE_CASE`

This rule checks that enum values are UPPER_SNAKE_CASE.

#### `FIELD_LOWER_SNAKE_CASE`

This rule checks that field names are lower_snake_case.

#### `MESSAGE_PASCAL_CASE`

This rule checks that messages are PascalCase.

#### `ONEOF_LOWER_SNAKE_CASE`

This rule checks that oneof names are lower_snake_case.

#### `PACKAGE_LOWER_SNAKE_CASE`

This rule checks that packages are lower_snake.case.

#### `RPC_PASCAL_CASE`

This rule checks that RPCs are PascalCase.

#### `SERVICE_PASCAL_CASE`

This rule checks that services are PascalCase.

#### `PACKAGE_SAME_*`

`buf` does not lint file option values, as explained in the [What we left out](#what-we-left-out) section below.
It's important, however, that your file option values are consistent across all files in a given Protobuf package
if you do use them.

  - `PACKAGE_SAME_CSHARP_NAMESPACE` checks that all files with a given package have the same value for the `csharp_namespace` option.
  - `PACKAGE_SAME_GO_PACKAGE` checks that all files with a given package have the same value for the `go_package` option.
  - `PACKAGE_SAME_JAVA_MULTIPLE_FILES` checks that all files with a given package have the same value for the `java_multiple_files` option.
  - `PACKAGE_SAME_JAVA_PACKAGE` checks that all files with a given package have the same value for the `java_package` option.
  - `PACKAGE_SAME_PHP_NAMESPACE` checks that all files with a given package have the same value for the `php_namespace` option.
  - `PACKAGE_SAME_RUBY_PACKAGE` checks that all files with a given package have the same value for the `ruby_package` option.
  - `PACKAGE_SAME_SWIFT_PREFIX` checks that all files with a given package have the same value for the swift_prefix` option.

Each of these rules verify if a given file option is used in one file in a given package, it is used in every file in that package.

For example, if we have file `foo_one.proto`:

```protobuf
// foo_one.proto
syntax = "proto3";

package foo.v1;

option go_package = "foov1";
option java_multiple_files = true;
option java_package = "com.foo.v1";
```

Another file `foo_two.proto` with package `foo.v1` must have these three options
set to the same value, and the other options unset:

```protobuf
// foo_two.proto
syntax = "proto3";

package foo.v1;

option go_package = "foov1";
option java_multiple_files = true;
option java_package = "com.foo.v1";
```

#### `ENUM_FIRST_VALUE_ZERO`

This rule enforces that the first enum value is the zero value.

This is a `proto3` requirement on build, but is not required in `proto2` on build. This rule
enforces that this is also followed in `proto2`.

As an example:

```protobuf
syntax = "proto2";

enum Scheme {
  // *** DO NOT DO THIS ***
  SCHEME_FTP = 1;
  SCHEME_UNSPECIFIED = 0;
}
```

The above results in generated code in certain languages defaulting to `SCHEME_FTP` instead of
`SCHEME_UNSPECIFIED`.

#### `ENUM_NO_ALLOW_ALIAS`

This rule outlaws aliased enums like this:

```protobuf
enum Foo {
  option allow_alias = true;
  FOO_UNSPECIFIED = 0;
  FOO_ONE = 1;
  FOO_TWO = 1; // no!
}
```

The `allow_alias` option lets multiple enum values have the same number. This can lead to
issues when working with the JSON representation of Protobuf, a first-class citizen of `proto3`.
If you get a serialized Protobuf value over the wire in binary format, it is unknown what specific
enum value it applies to, and JSON usually serialized enum values by name. While in practice, this
can lead to hard-to-track bugs if you declare an alias and expect names to be interchangeable.

Instead of having an alias, we recommend deprecating your current enum, and making a new
one with the enum value name you want. Or just stick with the current name for your enum value.

#### `IMPORT_NO_WEAK`

This rule outlaws declaring imports as `weak`. If you didn't know this was possible, forget what you
just learned in this sentence, and regardless do not use these.

#### `IMPORT_NO_PUBLIC`

Similar to the `IMPORT_NO_WEAK` rule, this rule outlaws declaring imports as `public`. If you didn't
know this was possible, forget what you just learned in this sentence, and regardless do not use these.

### `DEFAULT`

The `DEFAULT` category includes everything from the `BASIC` category, as well as some other default style
rules.

This configuration...

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
```

...is equivalent to:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - BASIC
    - ENUM_VALUE_PREFIX
    - ENUM_ZERO_VALUE_SUFFIX
    - FILE_LOWER_SNAKE_CASE
    - RPC_REQUEST_RESPONSE_UNIQUE
    - RPC_REQUEST_STANDARD_NAME
    - RPC_RESPONSE_STANDARD_NAME
    - PACKAGE_VERSION_SUFFIX
    - SERVICE_SUFFIX
```

True to its name, `DEFAULT` is also the default set of lint rules used by `buf` if no configuration is present, and
represents our recommendations for modern Protobuf development without being overly burdensome.

#### `ENUM_VALUE_PREFIX`

This rule requires that all enum value names are prefixed with the enum name. For example:

```protobuf
enum Foo {
  FOO_UNSPECIFIED = 0;
  FOO_ONE = 1;
}

message Bar {
  enum Baz {
    BAZ_UNSPECIFIED = 0;
    BAZ_ONE = 1;
  }
}
```

Protobuf enums use C++ scoping rules, which makes it not possible to have two enums in the same
package with the same enum value name (an exception is when enums are nested, in which case this
rule applies within the given message). While you may think that a given enum value name is
always unique across a package, APIs can develop over years, and there are countless examples
of developers having to compromise on their enum names due to backwards compatibility issues.
For example, you might have this enum:

```protobuf
enum Scheme {
  // Right off the bat, you can't use "UNSPECIFIED" in multiple enums
  // in the same package, so you always would have to prefix this anyways.
  SCHEME_UNSPECIFIED = 0;
  HTTP = 1;
  HTTPS = 2;
  ...
}
```

Two years later, you have an enum in the same package you want to add, but can't:

```protobuf
// This is a made up example, bear with us.
enum SecureProtocol {
  SECURE_PROTOCOL_UNSPECIFIED = 0;
  // If this enum is in the same package as Scheme, this produces
  // a protoc compile-time error!
  HTTPS = 1;
  ...
}
```

#### `ENUM_ZERO_VALUE_SUFFIX`

This rule requires that all enum values have a zero value of `ENUM_NAME_UNSPECIFIED`.
For example:

```protobuf
enum Foo {
  FOO_UNSPECIFIED = 0;
}
```

The suffix is [configurable](configuration.md#enum_zero_value_suffix).

All enums should have a zero value. `proto3` does not differentiate between set and unset fields,
so if an enum field is not explicitly set, it defaults to the zero value. If an explicit
zero value is not part of the enum definition, this defaults to the actual zero value
of the enum. For example, if you had:

```protobuf
enum Scheme {
  // *** DO NOT DO THIS ***
  SCHEME_FTP = 0
}

message Uri {
  Scheme scheme = 1;
}
```

Then any `Uri` with `scheme` not explicitly set defaults to `SCHEME_FTP`.

#### `FILE_LOWER_SNAKE_CASE`

This rule says that all `.proto` files must be named in `lower_snake_case.proto`. This
is the widely accepted standard.

#### `RPC_REQUEST_STANDARD_NAME`, `RPC_RESPONSE_STANDARD_NAME`, `RPC_REQUEST_RESPONSE_UNIQUE`

These rules enforce the message name of RPC request/responses, and that all request/responses are unique.

**One of the single most important rules to enforce in modern Protobuf development is to have
a unique request and response message for every RPC.** Separate RPCs should not have their
request and response parameters controlled by the same Protobuf message, and if you share
a Protobuf message between multiple RPCs, this results in multiple RPCs being affected
when fields on this Protobuf message change. **Even in straightforward cases**, best practice
is to always have a wrapper message for your RPC request and response types. `buf` enforces
this with these three rules by verifying that:

- All request and response messages are unique across your Protobuf schema.
- All request and response messages are named after the RPC, either by naming them
  `MethodNameRequest`, `MethodNameResponse` or `ServiceNameMethodNameRequest`, `ServiceNameMethodNameResponse`.

This service definition, for example, abides by these rules:

```protobuf
// request/response message definitions omitted for brevity

service FooService {
  rpc Bar(BarRequest) returns (BarResponse) {}
  rpc Baz(FooServiceBazRequest) returns (FooServiceBazResponse) {}
}
```

There are [configuration options](configuration.md#rpc_allow_) associated with these three rules.

#### `PACKAGE_VERSION_SUFFIX`

This rule enforces that the last component of a package must be a version of the form
`v\d+, v\d+test.*, v\d+(alpha|beta)\d*, or v\d+p\d+(alpha|beta)\d*`, where numbers are >=1.

Examples (all taken directly from `buf` testing):

```
foo.v1
foo.v2
foo.bar.v1
foo.bar.v1alpha
foo.bar.v1alpha1
foo.bar.v1alpha2
foo.bar.v1beta
foo.bar.v1beta1
foo.bar.v1beta2
foo.bar.v1p1alpha
foo.bar.v1p1alpha1
foo.bar.v1p1alpha2
foo.bar.v1p1beta
foo.bar.v1p1beta1
foo.bar.v1p1beta2
foo.bar.v1test
foo.bar.v1testfoo
```

One of the core promises of Protobuf API development is to never have breaking changes
in your APIs, and `buf` helps enforce this through the [breaking change detector](../breaking/overview.md).
There are scenarios, however, where you do want to properly version your API. Instead of making changes, the
proper method to do so is to make a completely new Protobuf package that is a copy of your existing
Protobuf package, serve both packages server-side, and manually migrate your callers. This rule
enforces that all packages have a version attached so that it is clear when a package represents
a new version.

A common idiom is to use alpha and beta packages for packages that are still in development and can
have breaking changes. You can [configure the breaking change detector](../breaking/configuration.md) to ignore
breaking changes in files for these packages with the `ignore_unstable_packages` option:

```yaml title="buf.yaml"
version: v1
breaking:
  ignore_unstable_packages: true
```

#### `SERVICE_SUFFIX`

This rule enforces that all services are suffixed with `Service`. For example:

```protobuf
service FooService {}
service BarService {}
service BazService {}
```

Service names inherently end up having a lot of overlap with package names, and service
naming often ends up inconsistent as a result across a larger Protobuf schema. Enforcing
a consistent suffix takes away some of this inconsistency.

The suffix is [configurable](configuration.md#service_suffix). For example, if
you have this configuration in your `buf.yaml`...

```yaml title="buf.yaml"
version: v1
lint:
  service_suffix: Endpoint
```

...the `SERVICE_SUFFIX` rule enforces this naming instead:

```protobuf
service FooEndpoint {}
service BarEndpoint {}
service BazEndpoint {}
```

### `COMMENTS`

This is an extra top-level category that enforces that comments are present on various parts
of your Protobuf schema.

The `COMMENTS` category includes these rules:

  - `COMMENT_ENUM` checks that enums have non-empty comments.
  - `COMMENT_ENUM_VALUE` checks that enum values have non-empty comments.
  - `COMMENT_FIELD` checks that fields have non-empty comments.
  - `COMMENT_MESSAGE` checks that messages have non-empty comments.
  - `COMMENT_ONEOF` checks that oneof have non-empty comments.
  - `COMMENT_RPC` checks that RPCs have non-empty comments.
  - `COMMENT_SERVICE` checks that services have non-empty comments.

Note that only leading comments are considered - trailing comments do not count towards passing
these rules.

You may want to at least enforce that certain parts of your schema contain comments. For example, you
can select individual rules in the `COMMENTS` category like this:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
    - COMMENT_ENUM
    - COMMENT_MESSAGE
    - COMMENT_RPC
    - COMMENT_SERVICE
```

### `UNARY_RPC`

This is an extra top-level category that outlaws streaming RPCs.

This `UNARY_RPC` category includes these rules:

- `RPC_NO_CLIENT_STREAMING` checks that RPCs are not client streaming.
- `RPC_NO_SERVER_STREAMING` checks that RPCs are not server streaming.

Some RPC protocols do not allow streaming RPCs, for example [Twirp](https://twitchtv.github.io/twirp). This
extra category enforces that no developer accidentally adds a streaming RPC if your setup does not
support them. Additionally, streaming RPCs have a number of issues in general usage. See [this
discussion](https://github.com/twitchtv/twirp/issues/70#issuecomment-470367807) for more details.

### `PACKAGE_NO_IMPORT_CYCLE`

This is an extra uncategorized rule that detects package import cycles. The Protobuf compiler outlaws circular
file imports, but it's still possible to introduce package cycles, such as these:

```sh
.
├── bar
│   ├── four.proto
│   └── three.proto
└── foo
    ├── one.proto
    └── two.proto
```

```protobuf
# foo/one.proto
syntax = "proto3";

package foo;

import "bar/three.proto";

message One {
    bar.Three three = 3;
}
```

```protobuf
# bar/four.proto
syntax = "proto3";

package bar;

import "foo/one.proto";

message Four {
    foo.One one = 1;
}
```

These packages successfully compile, but this file structure introduces problems for languages that rely on
package-based imports, such as Go. If possible, **this rule should always be configured**.

## What we left out

We think that the above lint rules represent a set that sufficiently enforces consistent
and maintainable Protobuf schemas, including for large organizations, without being so opinionated
as to not let your organization make its own design decisions. Regardless, there are some potential
rules we purposefully did not write that deserve special mention.

### File option values

`buf` does not include linting for specific file option values. It's not that we don't think consistency
across these file options is important - in fact, we think it simplifies Protobuf stub
consumption. A core principle we feel strongly about is that **language-specific file options shouldn't be
part of your core Protobuf schema** - your Protobuf schema should only describe language-independent elements
as much as is possible.

The values for most file options, in fact, should be deduced in a stable and deterministic manner. For example,
we think that `java_package` should likely be a constant prefix followed by the package name as a suffix. Your
`go_package` should use the last component of your package name. And `java_multiple_files` should always be `true`.
These aren't defaults, for backwards-compatibility reasons, but if you're using a tool like `buf` to produce your
stubs, you shouldn't have to think about any of this.

This is exactly why we've created [managed mode](../generate/managed-mode.md), which sets all of these file options
*on the fly* with `buf generate`.

`buf` still enforces that specific file options are the same across a given package, done through the `BASIC` and
`DEFAULT` categories described above. We do find this to be important, regardless of what values you choose. Fortunately,
with managed mode you can remove your file option declarations altogether and leave the rest to `buf`.

### Custom options

There are no lint rules for widely used custom options such as [google.api options](https://github.com/googleapis/googleapis/tree/master/google/api)
or [protoc-gen-validate](https://github.com/envoyproxy/protoc-gen-validate/blob/master/validate/validate.proto).
There's a lot of thought that needs to go into issues such as forwards and backwards compatibility for custom options,
so we currently only support the standard set of file options. [Contact us](../contact.md) if this is a big need for
your organization.

### Naming opinions

`buf` stays away from enforcing naming opinions, such as package name restrictions (beyond versioning
requirements and `lower_snake_case`), or field naming such as `google.protobuf.Duration` name
standardization. This is to provide maximum usefulness of the `DEFAULT` category out of the box.

## Adding or requesting new rules

If you'd like a new rule added, [contact us](../contact.md) to discuss it. We'll add rules if we think
they're maintainable and could have widespread value. Most rules can be easily added, and although
[Buf is OSS](https://github.com/bufbuild/buf), it's usually more efficient for us to add it ourselves.
