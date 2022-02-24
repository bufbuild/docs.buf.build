---
id: generate-go-code
title: 10 Generate Go code
---

So far, you've created a new [module](../bsr/overview.md#modules), pushed it up to the
[BSR](../bsr/overview.md), interacted with generated [documentation](view-generated-documentation.md),
and added a dependency on the `buf.build/googleapis/googleapis` module. Next, you'll implement the
`PetStoreService` as a Go application and use other powerful Buf features.

Before you continue, move to the `start` directory again. If you're coming from the [previous
step](add-a-dependency), you can run this command:

```terminal
$ cd ..
```

You should also reset the `gen` directory so that you can generate everything from a clean slate.
This is especially relevant since you removed the `google/type/datetime.proto` definition from
the module itself.

```terminal
$ rm -rf gen
```

The `start` directory should now look like this:

```sh
start/
├── buf.gen.yaml
└── petapis
    ├── buf.lock
    ├── buf.md
    ├── buf.yaml
    └── pet
        └── v1
            └── pet.proto
```

## 10.1 Set up Go {#setup}

Install `go` from [https://golang.org/doc/install](https://golang.org/doc/install). If you don't have any experience with Go,
that's OK! We'll cover everything you need to know here.

## 10.2 Install plugins {#install-plugins}

You'll use the `protoc-gen-go` and `protoc-gen-go-grpc` plugins to generate code with `buf generate`,
so you'll need to install them:

```terminal
$ go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
$ go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

You also need to update your `PATH` so that `buf` can find the plugins:

```terminal
$ export PATH="$PATH:$(go env GOPATH)/bin"
```

## 10.3 Edit your `buf.gen.yaml` {#edit-your-bufgenyaml}

Edit the [`buf.gen.yaml`](../configuration/v1/buf-gen-yaml.md) file so that it configures the
`protoc-gen-go` and `protoc-gen-go-grpc` plugins (and their options):

```yaml title="buf.gen.yaml" {3-14}
 version: v1
 plugins:
-  - name: cpp
-    out: gen/proto/cpp
-  - name: java
-    out: gen/proto/java
+  - name: go
+    out: gen/proto/go
+    opt: paths=source_relative
+  - name: go-grpc
+    out: gen/proto/go
+    opt:
+      - paths=source_relative
+      - require_unimplemented_servers=false
```

These edits remove the C++ and Java code generation from a previous step and add two new code
generation outputs:

* The `protoc-gen-go` plugin will generate Go code to the `gen/proto/go` directory with the
  `paths=source_relative` option.
* The `protoc-gen-go-grpc` plugin will generate Go code to the same `gen/proto/go` directory with
  two options: `paths=source_relative` and `require_unimplemeneted_servers=false`.

## 10.4 Generate Go/gRPC client and server stubs {#generate-stubs}

Now that you have a `buf.gen.yaml` with the `protoc-gen-go[-grpc]` plugins configured, you can generate the code
required to implement the `PetStoreService` API with Go.

Run this command, which targets the version of the module your pushed to the BSR earlier:

```terminal
$ buf generate buf.build/$BUF_USER/petapis
```

> If a `--template` isn't explicitly specified, the `buf.gen.yaml` found in the current directory is used by default.

If successful, you'll notice a few new files in the `gen/proto/go` directory (as configured by the `buf.gen.yaml`
created above):

```sh
start/
├── buf.gen.yaml
├── gen
│   └── proto
│       └── go
│           └── pet
│               └── v1
│                   ├── pet.pb.go
│                   └── pet_grpc.pb.go
└── petapis
    ├── buf.lock
    ├── buf.md
    ├── buf.yaml
    └── pet
        └── v1
            └── pet.proto
```
