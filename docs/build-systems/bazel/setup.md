---
id: setup
title: Overview
---

Bazel rules for `buf` are available at the [rules_buf](https://github.com/bufbuild/rules_buf) repo. 
It currently supports:
* [Lint](/lint/overview) and [Breaking Change Detection](/breaking/overview) 
as [bazel test rules](https://docs.bazel.build/versions/main/skylark/rules.html#executable-rules-and-test-rules).
* `buf` as a [bazel toolchain](https://docs.bazel.build/versions/main/toolchains.html).
* [Gazelle](https://github.com/bazelbuild/bazel-gazelle) extension to generate the rules.

## Setup

Add the following snippet to the `WORKSPACE` file replacing the `<SHA256>` and `<VERSION>` with those of a [specific release](https://github.com/bufbuild/rules_buf/releases):
```starlark title="WORKSPACE"
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

## Rules

The rules work alongside `proto_library` rules. All the rules are configured using the `buf.yaml` file. 

Export the `buf.yaml` using `exports_files(["buf.yaml"])` to reference it. For workspaces this has to be done for each `buf.yaml` file.

> We highly recommend using the [gazelle extension](gazelle) to generate these rules.

### `buf_lint_test`

`buf_lint_test` is a bazel test rule that lints `proto_library` targets. It can accept multiple `proto_library` targets. 

#### Example

```starlark
load("@rules_buf//buf:defs.bzl", "buf_lint_test")
load("@rules_proto//proto:defs.bzl", "proto_library")

proto_library(
    name = "foo_proto",
    srcs = ["pet.proto"],
    deps = ["@go_googleapis//google/type:datetime_proto"],
)

buf_lint_test(
    name = "foo_proto_lint",    
    targets = [":foo_proto"],
    config = "buf.yaml",
)
```

This can be run as:
```
$ bazel test :foo_proto_lint
```

### `buf_breaking_test`

`buf_breaking_test` is a bazel test rule that checks `proto_library` targets for breaking changes. It can accept multiple `proto_library` targets. It requires an [image](/reference/images) file to check against.

#### Example

```starlark
load("@rules_buf//buf:defs.bzl", "buf_breaking_test")
load("@rules_proto//proto:defs.bzl", "proto_library")

proto_library(
    name = "foo_proto",
    srcs = ["foo.proto"],
)

buf_breaking_test(
    name = "foo_proto_breaking",
    # Image file to check against.
    against = "//:image.bin",
    targets = [":foo_proto"],
    config = ":buf.yaml",
)
```

This can be run as:
```
$ bazel test :foo_proto_breaking
```

## Toolchains

The `buf` tool is packaged as a bazel [toolchain](https://docs.bazel.build/versions/main/toolchains.html). It can be used to create custom rules that depend on `buf`.

#### Example

```starlark
def _buf_ls_files_impl(ctx):
    buf = ctx.toolchains["//bar_tools:toolchain_type"].cli
    ...
    ctx.actions.run(
        ...
        arguments = ["ls-files"],
        executable = buf,
    )

buf_ls_files = rule(
    implementation = _buf_ls_files_impl,
    attrs = {
        "srcs": attr.label_list(allow_files = True),  
        ...      
    },
    toolchains = ["//:toolchain_type"]
)
```