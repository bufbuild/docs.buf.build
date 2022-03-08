---
id: managed-mode
title: Managed mode
---

Protobuf enables you to set [file options][file-options] in your `.proto` files that dictate aspects
of how code is generated from those files. Some file options are required by the [`protoc`][protoc]
compiler in some circumstances, such as [`go_package`](#go_package_prefix) when generating Go code.
These options have been a pain point in Protobuf development for many years because they require API producers to set
values that [don't really belong](#background) in API definitions.

You can avoid setting these file options when [generating] code from Protobuf sources by enabling
**managed mode** in your [`buf.gen.yaml`](../configuration/v1/buf-gen-yaml.md) configuration file.
When managed mode is [enabled](#enabled), the `buf` CLI sets specified file options on the fly during
code generation so that you don't need to hard-code them in your `.proto` files.

Managed mode provides options for these languages:

* [C++](#cpp)
* [C#](#csharp)
* [Go](#go)
* [Java](#java)
* [Objective-C](#objective-c)
* [PHP](#php)
* [Ruby](#ruby)

> If you're generating code for a language that isn't on this list, managed mode has no implications
> and enabling it has no effect. And if you're generating Swift code, Protobuf does offer a
> [`swift_prefix`][swift_prefix] file option, but Apple specifically
> [counsels against using it][apple-warning], so managed mode doesn't support it.

## Configuration

To enable managed mode, set the `managed.enabled` option in your [`buf.gen.yaml`][buf-gen-yaml]
configuration. Here's an example configuration that uses a [hosted plugin][hosted] to generate
Java code and write the resulting files to the `gen/proto/java` directory:

```yaml title="buf.gen.yaml"
version: v1
managed:
  enabled: true
plugins:
  - remote: buf.build/protocolbuffers/plugins/java
    out: gen/proto/java
```

With `enabled` set to `true` here, you can remove any [Java](#java)-specific file options from the
Protobuf files covered by this configuration and let the `buf` CLI inject those values on the fly
instead.

> Managed mode only supports the standard file options included in Protobuf by default. If you're
> using custom file options, you need to include them in your `.proto` files.

### `managed`

You can use the `managed` key to configure managed mode.

Here's an example `buf.gen.yaml` configuration that uses managed mode plus [hosted plugins][hosted]
to generate Go and Java code:

```yaml title="buf.gen.yaml"
version: v1
managed:
  enabled: true
  java_multiple_files: false
  java_package_prefix: com
  java_string_check_utf8: false
  go_package_prefix:
    default: github.com/acme/weather/private/gen/proto/go
      except:
        - buf.build/googleapis/googleapis
   override:
    JAVA_PACKAGE:
      acme/weather/v1/weather.proto: org
plugins:
  - remote: buf.build/protocolbuffers/plugins/go
    out: gen/proto/go
    opt: paths=source_relative
  - remote: buf.build/protocolbuffers/plugins/java
    out: gen/proto/java
```

With this configuration, you could remove _all_ file options specific to [Go](#go) and [Java](#java)
from your `.proto` files.

#### `enabled`

The `enabled` key is **required** if you set *any* other keys under `managed`. Setting `enabled`
to `true` has a variety of implications for different [languages](#languages).

#### `optimize_for`

The `optimize_for` key is **optional** and dictates which Protobuf [`optimize_for`][optimize_for]
setting is applied to Protobuf files in the [input]. This setting applies to both
[C++](#cpp) and [Java](#java) but may effect third-party plugins as well. Accepted values:

Value | Description | Default
:-----|:------------|:-------
`SPEED` | Generate highly optimized code for parsing, serializing, and performing common operations on messages | ✅
`CODE_SIZE` | Generate minimal classes and instead rely on shared, reflection-based code for serialization, parsing, and other operations |
`LITE_RUNTIME` | Generate classes that depend only on the "lite" Protobuf runtime |

#### `override`

This setting enables you to apply per-file overrides for any given setting. In the `buf.gen.yaml`
[above](#managed), for example, the [`java_package_prefix`](#java_package_prefix) setting is
set to `com` but overridden and set to `org` for the `acme/weather/v1/weather.proto` file and only
that file:

```yaml
override:
  JAVA_PACKAGE:
    acme/weather/v1/weather.proto: org
```

## Languages

### C++ {#cpp}

If you're generating C++ code with managed mode enabled, there are two options that apply:

#### `cc_enable_arenas`

The `cc_enable_arenas` key is an **optional** Boolean that controls which [`cc_enable_arenas`][cc_enable_arenas]
value is used in all files in the generation target [input]. The default is `false`.

#### `optimize_for` {#optimize_for-cpp}

You can set [`optimize_for`](#optimize_for) for C++ using managed mode.

### C# {#csharp}

If you enable managed mode, [`csharp_namespace`][csharp_namespace] is set to the package name with
each package sub-name capitalized. This converts the `acme.weather.v1` package name, for example,
to `Acme.Weather.V1`.

### Go

If you're generating Go code with managed mode enabled, there are several options that apply:

#### `go_package_prefix`

The `go_package_prefix` key is **optional** and controls which [`go_package`][go_package]
value is used in all the Protobuf files in the target [input].

##### `default`

The `default` key is **required** if you set [`go_package_prefix`](#go_package_prefix). The `default`
value is used as a prefix for the `go_package` value set in each of the files. The `default` value **must** be a relative filepath that **must not** jump context
from the current directory, that is they must be subdirectories relative to the current working directory. As an example,
`../external` is invalid.

In the configuration example shown above, the `github.com/acme/weather/gen/proto/go` prefix is *joined* with the given Protobuf
file's relative path from the module root. In the `buf.build/acme/weather` module's case, the `acme/weather/v1/weather.proto`
file would have this `go_package` set:

```protobuf title="acme/weather/v1/weather.proto"
syntax = "proto3";

package acme.weather.v1;

option go_package = "github.com/acme/weather/gen/proto/go/acme/weather/v1;weatherv1";
```

> If the Protobuf file's package declaration conforms to the `PACKAGE_VERSION_SUFFIX` lint rule, the final two path elements are
> concatenated and included after the `;` element in the `go_package` result. The above example generates a Go package with a package
> declaration equal to `weatherv1`, which enables you to import Go definitions from a variety of generated packages that would otherwise
> collide (a lot of Protobuf packages contain the `v1` suffix, for example).

##### `except`

The `except` key is **optional**, and removes certain modules from the `go_package` file option override behavior. The `except` values **must**
be valid [module names](../bsr/overview.md#modules).

There are situations where you may want to enable managed mode for the `go_package` option in *most* of your Protobuf files, but not necessarily
for *all* of your Protobuf files. This is particularly relevant for the `buf.build/googleapis/googleapis` module, which points its `go_package` value to
an [external repository](https://github.com/googleapis/go-genproto). Popular libraries, such as [grpc-go](https://github.com/grpc/grpc-go) depend on these
`go_package` values, so it's important that managed mode doesn't overwrite them.

##### `override`

The `override` key is **optional**, and overrides the `go_package` file option value used for specific modules. The `override` keys **must** be valid
module names. Additionally, the corresponding `override` values **must** be a valid [Go import path][go.import]
and **must not** jump context from the current directory. As an example, `../external` is invalid.

This setting is used for [workspace](../reference/workspaces.md) environments, where you have a module that imports from another module in the same workspace, and
you need to generate the Go code for each module in different directories. This is particularly relevant for repositories that decouple their private API
definitions from their public API definitions (as is the case for `buf`).

### Java

If you're generating Java code with managed mode enabled, there are several options that apply:

#### `optimize_for` {#optimize_for-java}

You can set [`optimize_for`](#optimize_for) for Java using managed mode.

#### `java_multiple_files`

The `java_multiple_files` key is an **optional** Boolean that controls which
[`java_multiple_files`][java_multiple_files] value is used in all the files in the generation
target [input]. The default is `true`.

#### `java_package_prefix`

The `java_package_prefix` key is an **optional** string that controls which
[`java_package`][java_package] prefix value is used in all the files in the generation target [input].
The default is `com`.

#### `java_outer_classname`

If you enable managed mode, [`java_outer_classname`][java_outer_classname] is set to the
[PascalCase][pascal]-equivalent of the file's name, removing the `.` from the `.proto` extension.
This converts the `weather.proto` filename, for example, to `WeatherProto`.

#### `java_string_check_utf8`

The `java_string_check_utf8` key is an **optional** Boolean that controls which
[`java_string_check_utf8`][java_string_check_utf8] value is used in all the files in the
generation target [input]. The default is `false`.

### Objective-C

For Objective-C, enabling managed mode means that [`objc_class_prefix`][objc_class_prefix] is set to
the uppercase first letter of each package sub-name, not including the package version,
with these rules:

* If the resulting abbreviation is 2 characters, `X` is added.
* If the resulting abbreviation is 1 character, `XX` is added.
* If the resulting abbreviation is `GPB`, it's changed to `GPX`, as `GPB` is reserved by Google for
  the Protocol Buffers implementation.

Managed mode would automatically convert the `acme.weather.v1` package name, for example, to
`AWX`.

### PHP

If you're generating PHP code and you enable managed mode:

* [`php_namespace`][php_namespace] is set to the package name with each package sub-name
  capitalized, with `\\` substituted for `.`. This would automatically convert the package name
  `acme.weather.v1`, for example, to `Acme\\Weather\\V1`.
* [`php_metadata_namespace`][php_metadata_namespace] is set to the same value as `php_namespace`,
  with `\\GPBMetadata` appended. This would automatically convert the package name `acme.weather.v1`,
  for example, to `Acme\\Weather\\V1\\GPBMetadata`.

### Ruby

If you're generating Ruby code and you enable managed mode, [`ruby_package`][ruby_package] is set to
the package name with each package sub-name capitalized, with `::` substituted for `.`. This would
automatically convert the `acme.weather.v1` package name, for example, to `Acme::Weather::V1`.

## Managed mode example {#example}

To see how managed mode changes your Protobuf sources, take this initial `.proto` file:

```protobuf title="acme/weather/v1/weather.proto"
syntax = "proto3";

package acme.weather.v1;

// Messages, enums, service, etc.
```

Now take this configuration:

```yaml title="buf.gen.yaml"
version: v1
managed:
  enabled: true
  go_package_prefix:
    default: github.com/acme/weather/private/gen/proto/go
```

Applying the configuration to the initial file would yield this `.proto` file:

```protobuf title="acme/weather/v1/weather.proto"
syntax = "proto3";

package acme.weather.v1;

option csharp_namespace = "Acme.Weather.V1";
option go_package = "github.com/acme/weather/gen/proto/go/acme/weather/v1;weatherv1";
option java_multiple_files = true;
option java_outer_classname = "WeatherProto";
option java_package = "com.acme.weather.v1";
option objc_class_prefix = "AWX";
option php_namespace = "Acme\\Weather\\V1";
option php_metadata_namespace = "Acme\\Weather\\V1\\GPBMetadata";
option ruby_package = "Acme::Weather::V1";

// Messages, enums, service, etc.
```

But with the `buf` CLI, you wouldn't ever _see_ this file. Those options would be written on the fly
and used as part of the generation process.

## Background

One drawback of Protobuf development using the original [`protoc`][protoc] compiler is that you need
to hard-code some file options into your `.proto` files when generating code for some languages.
Take this `weather.proto` file inside of this file tree, for example:

```protobuf title="acme/weather/v1/weather.proto"
syntax = "proto3";

package acme.weather.v1;

option go_package = "github.com/acme/weather/gen/proto/go/acme/weather/v1;weatherv1";
option java_multiple_files = true;
option java_outer_classname = "WeatherProto";
option java_package = "com.acme.weather.v1";
```

```sh
.
├── acme
│   └── weather
│       └── v1
│           └── weather.proto
└── buf.yaml
```

Notice that four file options are set here:

* [`go_package`](#go_package_prefix)
* [`java_multiple_files`](#java_multiple_files)
* [`java_outer_classname`](#java_outer_classname)
* [`java_package`](#java_package_prefix)

But none of these options have anything to do with the _actual API definition_ in Protobuf, which
makes them API _consumer_ concerns rather than API _producer_ concerns. Different consumers may want
to use different values for these options. A Java developer, for example, may want to specify a
[`java_package`](#java_package_prefix) that matches their organization.

The problem really comes to a head when it comes to import paths. With [`protoc`][protoc], a Go
developer, for example, would need to invoke the [`--go_opt`](#go_opt) flag when generating code,
for example `--go_opt=Mpath/to/foo.proto=github.com/pkg/foo`, to specify the import path.
With the `buf` CLI and managed mode, you can avoid these complex `protoc` invocations and use
[configuration](#configuration) instead.

[apple-warning]: https://github.com/apple/swift-protobuf/blob/main/Documentation/API.md#generated-struct-name
[buf-gen-yaml]: /configuration/v1/buf-gen-yaml.md
[cc_enable_arenas]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L419
[csharp_namespace]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L427
[descriptor.go]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L341
[file-options]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L341
[generating]: ../generate/usage.md
[go.import]: https://golang.org/ref/spec#ImportPath
[go_opt]: https://developers.google.com/protocol-buffers/docs/reference/go-generated
[go_package]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L391
[hosted]: ../bsr/remote-generation/overview.md#hosted-plugins
[input]: /reference/inputs.md
[java_multiple_files]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L363
[java_outer_classname]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L355
[java_package]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L347
[java_string_check_utf8]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L374
[objc_class_prefix]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L424
[optimize_for]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L384
[pascal]: https://techterms.com/definition/pascalcase
[php_metadata_namespace]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L447
[php_namespace]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L442
[plugins]: /bsr/remote-generation/concepts#plugins
[protoc]: https://github.com/protocolbuffers/protobuf
[ruby_package]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L452
[swift_prefix]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto#L433
