---
id: generate-code
title: 5 Generate code
---

`buf` provides a user-friendly experience for generating code locally that's completely compatible
with any existing usage of `protoc`.

Move back to the `start` directory with this command:

```terminal
$ cd ..
```

## 5.1 Install plugins {#install-plugins}

You'll use the `protoc-gen-cpp` and `protoc-gen-java` plugins to generate code using `buf generate`,
so you'll need to install them.

These plugins are special in that they're built into to the `protoc` binary, so if you don't already
have `protoc` on your `$PATH`, see the [installation guide][install_protoc].

> For other `protoc` plugins, such as `protoc-gen-go` and `protoc-gen-go-grpc`, it's **not** required
> to have `protoc` installed in your `PATH`.

## 5.2 Configure a `buf.gen.yaml` {#configure-a-bufgenyaml}

The [`buf.gen.yaml`](../configuration/v1/buf-gen-yaml.md) file controls how the `buf generate` command
executes `protoc` plugins. With a `buf.gen.yaml`, you can configure where each `protoc` plugin writes its result
and specify options for each plugin independently.

You can create a `buf.gen.yaml` file that configures the `protoc-gen-cpp` and `protoc-gen-java`
plugins:

```yaml title="buf.gen.yaml"
version: v1
plugins:
  - name: cpp
    out: gen/proto/cpp
  - name: java
    out: gen/proto/java
```

Given this config, `buf` does two things:

 * It executes the `protoc-gen-cpp` plugin and places its output in the `gen/proto/cpp` directory.
 * It executes the `protoc-gen-java` plugin and places its output in the `gen/proto/java` directory.

Like `protoc`, `buf` infers the `protoc-gen-` prefix for each plugin specified by the `name` key.
You can override this behavior with the [`path`](../configuration/v1/buf-gen-yaml.md#path) key, but
this is an advanced feature that's usually unnecessary.

## 5.3 Generate C++ and Java stubs {#generate-c-and-java-stubs}

Now that you have a `buf.gen.yaml` with the `protoc-gen-{cpp,java}` plugins configured, you can generate the
C++ and Java code associated with the `PetStoreService` API.

Run this command, targeting the input defined in the `petapis` directory:

```terminal
$ buf generate petapis
```

> If a `--template` isn't explicitly specified, the `buf.gen.yaml` found in the current directory is used by
default.

If successful, you'll notice a few new files in the `gen/proto/cpp` and `gen/proto/java` directories
(as configured by the `buf.gen.yaml` created above):

```sh
start/
├── buf.gen.yaml
├── gen
│   └── proto
│       ├── cpp
│       │   ├── google
│       │   │   └── type
│       │   │       ├── datetime.pb.cc
│       │   │       └── datetime.pb.h
│       │   └── pet
│       │       └── v1
│       │           ├── pet.pb.cc
│       │           └── pet.pb.h
│       └── java
│           ├── com
│           │   └── google
│           │       └── type
│           │           ├── DateTime.java
│           │           ├── DateTimeOrBuilder.java
│           │           ├── DateTimeProto.java
│           │           ├── TimeZone.java
│           │           └── TimeZoneOrBuilder.java
│           └── pet
│               └── v1
│                   └── PetOuterClass.java
└── petapis
    ├── buf.yaml
    ├── google
    │   └── type
    │       └── datetime.proto
    └── pet
        └── v1
            └── pet.proto
```

## 5.4 Use managed mode {#use-managed-mode}

[Managed mode](../generate/managed-mode.md) is a `buf.gen.yaml` configuration option that tells `buf`
to set all of the file options in your module according to an opinionated set of values suitable for each of the
supported Protobuf languages, such as Go, Java, and C#. The file options are written *on the fly* by
`buf` so that you don't need to include them in your Protobuf source files.

These options aren't derived from your Protobuf definitions as an API *producer*. Instead, these
options relate to how people *consume* your Protobuf APIs. Different consumers may want different
values for these options, especially when a given set of Protobuf definitions is consumed in many
different places.

For example, you can explicitly configure a few options to change the behavior of the generated code
for C++ and Java. You can disable [`cc_enable_arenas`][cc_enable_arenas] and enable
[`java_multiple_files`][java_multiple_files] with this configuration:

```yaml title=buf.gen.yaml {2-5}
 version: v1
+managed:
+  enabled: true
+  cc_enable_arenas: false
+  java_multiple_files: true
 plugins:
   - name: cpp
     out: gen/proto/cpp
   - name: java
     out: gen/proto/java
```

If you regenerate the C++ and Java code, you'll notice that the generated content has changed:

```terminal
$ rm -rf gen
$ buf generate petapis
```

```sh
start/
├── buf.gen.yaml
├── gen
│   └── proto
│       ├── cpp
│       │   ├── google
│       │   │   └── type
│       │   │       ├── datetime.pb.cc
│       │   │       └── datetime.pb.h
│       │   └── pet
│       │       └── v1
│       │           ├── pet.pb.cc
│       │           └── pet.pb.h
│       └── java
│           └── com
│               ├── google
│               │   └── type
│               │       ├── DateTime.java
│               │       ├── DateTimeOrBuilder.java
│               │       ├── DatetimeProto.java
│               │       ├── TimeZone.java
│               │       └── TimeZoneOrBuilder.java
│               └── pet
│                   └── v1
│                       ├── DeletePetRequest.java
│                       ├── DeletePetRequestOrBuilder.java
│                       ├── DeletePetResponse.java
│                       ├── DeletePetResponseOrBuilder.java
│                       ├── GetPetRequest.java
│                       ├── GetPetRequestOrBuilder.java
│                       ├── GetPetResponse.java
│                       ├── GetPetResponseOrBuilder.java
│                       ├── Pet.java
│                       ├── PetOrBuilder.java
│                       ├── PetProto.java
│                       ├── PetType.java
│                       ├── PutPetRequest.java
│                       ├── PutPetRequestOrBuilder.java
│                       ├── PutPetResponse.java
│                       └── PutPetResponseOrBuilder.java
└── petapis
    ├── google
    │   └── type
    │       └── datetime.proto
    └── pet
        └── v1
            └── pet.proto
```

We'll come back to managed mode in a more complex example [later in the tour](use-managed-mode.md).
For now, restore your `buf.gen.yaml` configuration before you continue:

```yaml title=buf.gen.yaml {2-5}
 version: v1
-managed:
-  enabled: true
-  cc_enable_arenas: false
-  java_multiple_files: true
 plugins:
   - name: cpp
     out: gen/proto/cpp
   - name: java
     out: gen/proto/java
```

Then regenerate the original code:

```terminal
$ rm -rf gen
$ buf generate petapis
```

[cc_enable_arenas]: /configuration/v1/buf-gen-yaml.md#cc_enable_arenas
[install_protoc]: https://github.com/protocolbuffers/protobuf#protocol-compiler-installation
[java_multiple_files]: /configuration/v1/buf-gen-yaml.md#java_multiple_files
