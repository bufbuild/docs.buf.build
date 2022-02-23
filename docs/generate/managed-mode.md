---
id: managed-mode
title: Managed Mode
---

Protobuf enables you to set [file options][file-options] in your `.proto` files that dictate how
code should be generated from those sources. Some file options, such as [`go_package_prefix`](#go_package_prefix),
are recognized by the [`protoc`][protoc] compiler itself.

**Managed Mode** enables you to use an opinionated set of configuration values when generating code
stubs from Protobuf definitions rather than hard-coding those [file options][file-options] into your
`.proto` files. You can [enable](#enabled) Managed Mode in your [`buf.gen.yaml`][buf-gen-yaml] 
configuration:

* [C++](#cpp)
* [C#](#csharp)
* [Go](#go)
* [Java](#java)
* [Objective-C](#objective-c)
* [PHP](#php)
* [Ruby](#ruby)

Managed Mode has no implications for languages not on this list. In general, though, we do recommend
enabling Managed Mode in cases where you're not sure which [plugins]

> If you're using Protobuf in a language that's not in this list, then Managed Mode is likely of no
> benefit to you.

**Managed Mode** addresses this problem head on so that users can remove file options from their Protobuf APIs altogether.

In addition, you can use Managed Mode to set Protobuf's [`optimize_for`](#optimize_for) option.

With Managed Mode, file options are written on the fly by the `buf` CLI, which means that you can
remove them from your `.proto` source files.

## Configuration

Configuring **Managed Mode** is easy - all you need to do is add the `managed.enabled` option to your `buf.gen.yaml` template. An example `buf.gen.yaml`
template that uses the `protoc-gen-java` plugin is shown below:

```yaml title="buf.gen.yaml"
version: v1
managed:
  enabled: true
plugins:
  - name: java
    out: gen/proto/java
```

With this, you can remove all of the standard file option declarations from all of our Protobuf files entirely, and leave the rest to `buf`.

> **Managed Mode** only supports the standard file options included in Protobuf by default. It's impossible for `buf` to establish an opinion
> for the custom options you might define, so such options still need to be checked into your Protobuf source files.

### `managed`

The `managed` key is used to configure **Managed Mode**. A complete example of the `managed` configuration with the `protoc-gen-go` plugin is
shown below:

```yaml title="buf.gen.yaml"
version: v1
managed:
  # Non-language-specific options
  enabled: true
  optimize_for: CODE_SIZE
  override:
    JAVA_PACKAGE:
      acme/weather/v1/weather.proto: "org"
  # Language-specific options
  cc_enable_arenas: false
  go_package_prefix:
    default: github.com/acme/weather/private/gen/proto/go
    except:
      - buf.build/googleapis/googleapis
    override:
      buf.build/acme/weather: github.com/acme/weather/gen/proto/go
  java_multiple_files: false
  java_package_prefix: com
  java_string_check_utf8: false
plugins:
  - name: go
    out: gen/proto/go
    opt: paths=source_relative
```

#### `enabled`

The `enabled` key is **required** if *any* other `managed` keys are set. Setting `enabled` equal to `true`
enables **Managed Mode** according to [default behavior](#default-behavior).

#### `optimize_for`

The `optimize_for` key is **optional**, and controls what the [`optimize_for`][optimize_for]
value is set to in all of the files in the generation target Input. Accepted values are `SPEED`, `CODE_SIZE`, and `LITE_RUNTIME`, with `SPEED` as the default.

##### `default`

The `default` key is **required** if the `go_package_prefix` key is set. The `default` value is used as a prefix for the
`go_package` value set in each of the files. The `default` value **must** be a relative filepath that **must not** jump context
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
> declaration equal to `weatherv1`, which makes it easier to import Go definitions from a variety of generated packages that would otherwise
> collide (a lot of Protobuf packages contain the `v1` suffix).

##### `except`

The `except` key is **optional**, and removes certain modules from the `go_package` file option override behavior. The `except` values **must**
be valid [module names](../bsr/overview.md#modules).

There are situations where you may want to enable **Managed Mode** for the `go_package` option in *most* of your Protobuf files, but not necessarily
for *all* of your Protobuf files. This is particularly relevant for the `buf.build/googleapis/googleapis` module, which points its `go_package` value to
an [external repository](https://github.com/googleapis/go-genproto). Popular libraries, such as [grpc-go](https://github.com/grpc/grpc-go) depend on these
`go_package` values, so it's important that **Managed Mode** does not overwrite them.

##### `override`

The `override` key is **optional**, and overrides the `go_package` file option value used for specific modules. The `override` keys **must** be valid
module names. Additionally, the corresponding `override` values **must** be a valid [Go import path](https://golang.org/ref/spec#ImportPath)
and **must not** jump context from the current directory. As an example, `../external` is invalid.

This setting is used for [workspace](../reference/workspaces.md) environments, where you have a module that imports from another module in the same workspace, and
you need to generate the Go code for each module in different directories. This is particularly relevant for repositories that decouple their private API
definitions from their public API definitions (as is the case for `buf`).

#### `override`

This is a list of per-file overrides for each modifier. In the example provided above, an override for `acme/weather/v1/weather.proto` is set for the `java_package_prefix`
modifier to be `org` instead of `com`. This sets `org` as the package prefix for **only** the specific `acme/weather/v1/weather.proto` file and **not** for the rest of the module.

## Default behavior

When `managed.enabled` is set to `true`, a variety of [language-specific](#languages) options are
set on the fly by the `buf` CLI. Enabling Managed Mode for `acme/weather/v1/weather.proto` file sets
its file options to this:

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
```

Some options, such as [`cc_enable_arenas`][cc_enable_arenas] and [`optimize_for`][optimize_for]

> Some options, such as `cc_enable_arenas` and `optimize_for`, are excluded from this list because **Managed Mode** agrees with the default
> values specified by [google/protobuf/descriptor.go](https://github.com/protocolbuffers/protobuf/blob/b650ea44b10133008baaea7488360c5b95c93c7b/src/google/protobuf/descriptor.proto#L385).
> If you disagree with the default values, you can override these option values, which is described in the [next section](#file-option-overrides).

## File option overrides

You might find that several of the options set by **Managed Mode** are not what you want. This is particularly relevant for options that
influence the content of the generated code, and are less focused on the generated package and/or file layout (such as `java_package`).
For this reason, **Managed Mode** lets users override the values of several options, including `cc_enable_arenas`, `java_multiple_files`,
`java_string_check_utf8`, and `optimize_for`.

You can configure each of these options under the `managed` key like so:

```yaml title="buf.gen.yaml"
version: v1
managed:
  enabled: true
  cc_enable_arenas: false
  java_multiple_files: false
  java_string_check_utf8: false
  optimize_for: CODE_SIZE
plugins:
  - name: java
    out: gen/proto/java
```

## Languages

### C++ {#cpp}

#### `cc_enable_arenas`

The `cc_enable_arenas` key is **optional**, and controls what the [`cc_enable_arenas`][cc_enable_arenas]
value is set to in all of the files in the generation target [Input]. Accepted values
are `false` and `true`, with `false` as the default.

### C# {#csharp}

If you enabled Managed Mode, [`csharp_namespace`][csharp_namespace] is set to the package name with
each package sub-name capitalized.

### Go

#### `go_package_prefix`

The `go_package_prefix` key is **optional**, and controls what the [`go_package`][go_package]
value is set to in all the files contained within the generation target input.

### Java

#### `java_multiple_files`

The `java_multiple_files` key is **optional**, and controls what the
[`java_multiple_files`][java_multiple_files] value is set to in all of the files contained within
the generation target input. Accepted values are `false` and `true`, with `true` as the default.

#### `java_package_prefix`

The `java_package_prefix` key is **optional**, and controls what the [`java_package`][java_package]
prefix value is set to in all of the files contained within the generation target input. The default
value is `com`.

#### `java_outer_classname`

If you enable Managed Mode, [`java_outer_classname`][java_outer_classname] is set to the
[PascalCase][pascal]-equivalent of the file's name, removing the `.` from the `.proto` extension.

#### `java_string_check_utf8`

The `java_string_check_utf8` key is **optional** and controls the value of
[`java_string_check_utf8`][java_string_check_utf8] in all of the files contained within the
generation target Input. Accepted values are `false` and `true`, with `false` as the default.

### Objective-C

For Objective-C, enabling Managed Mode means that [`objc_class_prefix`][objc_class_prefix] is set to
the uppercase first letter of each package sub-name, not including the package version, with these rules:

* If the resulting abbreviation is 2 characters, `X` is added.
* If the resulting abbreviation is 1 character, `XX` is added.
* If the resulting abbreviation is `GPB`, it's changed to `GPX`, as `GPB` is reserved by Google for
  the Protocol Buffers implementation.

### PHP

If you enable Managed Mode:

* [`php_namespace`][php_namespace] is set to the package name with each package sub-name
  capitalized, with `\\` substituted for `.`.
* [`php_metadata_namespace`][php_metadata_namespace] is set to the same value as `php_namespace`,
  with `\\GPBMetadata` appended.

### Ruby

If you enable Managed Mode, [`ruby_package`][ruby_package] is set to the package name with each
package sub-name capitalized, with `::` substituted for `.`.

## Background

One of the largest drawbacks of Protobuf is the hardcoding of language-specific options within Protobuf definitions themselves.
For example, consider this `acme/weather/v1/weather.proto` file in the given file `tree`:

```sh
.
├── acme
│   └── weather
│       └── v1
│           └── weather.proto
└── buf.yaml
```

```protobuf title="acme/weather/v1/weather.proto"
syntax = "proto3";

package acme.weather.v1;

option go_package = "github.com/acme/weather/gen/proto/go/acme/weather/v1;weatherv1";
option java_multiple_files = true;
option java_outer_classname = "WeatherProto";
option java_package = "com.acme.weather.v1";
```

None of these options have anything to do with the API definition within Protobuf - they are all API *consumer* concerns, not API *producer* concerns.
Different consumers may (and usually do) want different values for these options, especially when a given set of Protobuf definitions is consumed in
many different places. This gets especially bad with imports - anyone in Go who has had to specify long chains of `--go_opt=Mpath/to/foo.proto=github.com/pkg/foo`
can attest to the severity of the situation.

**Managed Mode** addresses this problem head-on so that users can remove file options from their Protobuf APIs altogether.

[buf-gen-yaml]: /configuration/v1/buf-gen-yaml.md
[cc_enable_arenas]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L419
[csharp_namespace]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L427
[file-options]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L341
[go_package]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L391
[input]: /reference/inputs.md
[java_multiple_files]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L363
[java_outer_classname]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L355
[java_package]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L347
[java_string_check_utf8]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L374
[objc_class_prefix]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L424
[optimize_for]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L384
[pascal]: https://techterms.com/definition/pascalcase
[php_metadata_namespace]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L447
[php_namespace]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L442
[plugins]: /bsr/remote-generation/concepts#plugins
[protoc]: https://github.com/protocolbuffers/protobuf
[ruby_package]: https://github.com/protocolbuffers/protobuf/blob/b7fe12e3670c68dc30517c418bee9dc2e2e6915e/src/google/protobuf/descriptor.proto#L452
