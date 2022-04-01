---
id: usage
title: Usage
---

T`buf format` command rewrites `.proto` files in-place according to an opinionated
[style](style.md).

## Configuration

The `buf format` command has no configuration options. There's only one way to
format `.proto` files, so that every `.proto` file looks and feels the same way. Stop
wasting time and energy on deciding how `.proto` files ought to be formatted - `buf`
decides for you so you don't have to.

## Examples

By default, the [input](../reference/inputs.md) is the current directory and the formatted
content is written to stdout. For example, given the following `tree`:

```sh
.
└── proto
    ├── buf.yaml
    └── simple
        └── v1
            └── simple.proto
```

```protobuf title="proto/simple/v1/simple.proto"
syntax = "proto3";

package simple.v1;


message Object {
     string key = 1;
    bytes value = 2;
}
```

```terminal
# Write the current directory's formatted content to stdout
$ buf format
syntax = "proto3";

package simple.v1;

message Object {
  string key = 1;
  bytes value = 2;
}
```

Rewrite the file(s) in-place with `-w`. For example,

```terminal
# Rewrite the files defined in the current directory in-place
$ buf format -w
$ cat proto/simple/v1/simple.proto
syntax = "proto3";

package simple.v1;

message Object {
  string key = 1;
  bytes value = 2;
}
```

> Most people will want to use 'buf format -w'.

Display a diff between the original and formatted content with `-d`. For example,

```terminal
# Write a diff instead of the formatted file
$ buf format -d
diff -u proto/simple/v1/simple.proto.orig proto/simple/v1/simple.proto
--- proto/simple/v1/simple.proto.orig    ...
+++ proto/simple/v1/simple.proto         ...
@@ -2,8 +2,7 @@

 package simple.v1;

-
 message Object {
-    string key = 1;
-   bytes value = 2;
+  string key = 1;
+  bytes value = 2;
 }
```

You can also use the `--exit-code` flag to exit with a non-zero exit code if there is a diff:

```terminal
$ buf format --exit-code
$ buf format -w --exit-code
$ buf format -d --exit-code
```

Format a file, directory, or module reference by specifying an input. For example,

```terminal
# Write the formatted file to stdout
$ buf format proto/simple/v1/simple.proto
syntax = "proto3";

package simple;

message Object {
  string key = 1;
  bytes value = 2;
}
```

```terminal
# Write the formatted directory to stdout
$ buf format simple
...
```

```terminal
# Write the formatted module reference to stdout
$ buf format buf.build/acme/petapis
...
```

Write the result to a specified output file or directory with `-o`. For example,

```terminal
# Write the formatted file to another file
$ buf format proto/simple/v1/simple.proto -o formatted/simple.formatted.proto
```

```terminal
# Write the formatted directory to another directory, creating it if it doesn't exist
$ buf format proto -o formatted
```

```terminal
# This also works with module references
$ buf format buf.build/acme/weather -o formatted
```

Rewrite the file(s) in-place with `-w`. For example,

```terminal
# Rewrite a single file in-place
$ buf format simple.proto -w
```

```terminal
# Rewrite an entire directory in-place
$ buf format proto -w
```

```terminal
# Write a diff and rewrite the file(s) in-place
$ buf format simple -d -w
diff -u proto/simple/v1/simple.proto.orig proto/simple/v1/simple.proto
...
```

> The -w and -o flags cannot be used together in a single invocation.
