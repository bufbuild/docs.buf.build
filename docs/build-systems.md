---
id: build-systems
title: Build Systems
---
:::note TODO
Add intro
:::

We currently provide Bazel integration. Please [contact us](contact) if you are interested in this, 
or other build systems.

## Bazel

Bazel rules for `buf` are available at the [rules_buf](https://github.com/bufbuild/rules_buf) repo. 
It currently supports:
* [Lint](lint/overview) and [Breaking Change Detection](breaking/overview) 
as [bazel test rules](https://docs.bazel.build/versions/main/skylark/rules.html#executable-rules-and-test-rules).
* `buf` as a [bazel toolchain](https://docs.bazel.build/versions/main/toolchains.html).
* [Gazelle](https://github.com/bazelbuild/bazel-gazelle) extension to generate [Lint](lint/overview) and [Breaking Change Detection](breaking/overview) rules.

### Setup

Add the following snippet to the `WORKSPACE` file replacing the `<SHA256>` and `<VERSION>` with those of a [specific release](https://github.com/bufbuild/rules_buf/releases):
```starlark
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "rules_buf",
    sha256 = "<SHA256>",
    urls = [        
        "https://github.com/bufbuild/rules_buf/releases/download/<VERSION>/rules_go-<VERSION>.zip",
    ],
)

load("@rules_buf//buf:repositories.bzl", "rules_buf_dependencies", "rules_buf_toolchains")

rules_buf_dependencies()

rules_buf_toolchains()

# rules_proto
load("@rules_proto//proto:repositories.bzl", "rules_proto_dependencies", "rules_proto_toolchains")

rules_proto_dependencies()

rules_proto_toolchains()
```
> `rules_proto` is required and is loaded as part of `rules_buf_dependencies`.
> To use a specific version of `rules_proto` load it before `rules_buf`

### Gazelle (Preferred)

Next, we recommend setting up the gazelle extension to generate all the rules. If you prefer hand written  Setup gazelle according to these [instructions](https://github.com/bazelbuild/bazel-gazelle#setup).

Once that is done, modify the `BUILD` file with the `gazelle` target likewise:
```starlark
load("@bazel_gazelle//:def.bzl", "DEFAULT_LANGUAGES", "gazelle", "gazelle_binary")

gazelle_binary(
    name = "gazelle-buf",    
    languages = DEFAULT_LANGUAGES + [
        "@rules_buf//gazelle/buf:buf",
    ],
)

gazelle(
    name = "gazelle",
    gazelle = ":gazelle-buf",
)
```

Now export the `buf.yaml` file by adding `exports_files(["buf.yaml"])` to the `BUILD` file.
> Refer to [workspace](#workspace) section for instructions on workspaces

Now run `gazelle`:

```terminal
bazel run //:gazelle
```

This should now generate the lint rules for all proto packages.

Try out the generated lint tests by running a lint test target likewise:
```terminal
bazel test //path/to/proto:foo_proto_lint
```

#### Breaking Change Detection

To generate breaking change detection rules we will need to add a gazelle [directive](https://github.com/bazelbuild/bazel-gazelle#directives) that points to an [image](/reference/images) target:
```starlark
# gazelle:buf_breaking_against //:against_image_file
```
The directive should be in the `BUILD` file at the root of the buf [module](bsr/overview#module).

Now run `gazelle` again:
```terminal
bazel run //:gazelle
```

Now you should see a `buf_breaking_test` rule in the `BUILD` file.

### Workspaces

### Toolchains

