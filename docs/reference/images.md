---
id: images
title: Images
---

Throughout the documentation, you will occasionally see references to **Images**. We'll go over what
Images are, how they are used, and the various options associated with them here.

## How Protobuf Plugins work

First we need to provide a short overview of how Protobuf plugins work.

When you invoke the following command:

```sh
$ protoc -I . --go_out=gen/go foo.proto
```

The following is (roughly) what happens:

- `protoc` compiles the file `foo.proto` (and any imports) and internally produces a
  [FileDescriptorSet](https://github.com/protocolbuffers/protobuf/blob/044c766fd4777713fef2d1a9a095e4308d770c68/src/google/protobuf/descriptor.proto#L57),
  which is just a list of [FileDescriptorProto](https://github.com/protocolbuffers/protobuf/blob/044c766fd4777713fef2d1a9a095e4308d770c68/src/google/protobuf/descriptor.proto#L62)
  messages. These messages contain all information about your `.proto` files, including
  optionally source code information such as the start/end line/column of each element
  of your `.proto` file, as well as associated comments.
- The FileDescriptorSet is turned into a [CodeGeneratorRequest](https://github.com/protocolbuffers/protobuf/blob/044c766fd4777713fef2d1a9a095e4308d770c68/src/google/protobuf/compiler/plugin.proto#L68),
  which contains the FileDescriptorProtos that `protoc` produced for `foo.proto` and any
  imports, a list of the files specified (just `foo.proto` in this example), as well as
  any options provided after the `=` sign of `--go_out` or with `--go_opt`.
- `protoc` then looks for a binary named `protoc-gen-go`, and invokes it, giving the serialized
  CodeGeneratorRequest as stdin.
- `protoc-gen-go` runs, and either errors or produces a
  [CodeGeneratorResponse](https://github.com/protocolbuffers/protobuf/blob/044c766fd4777713fef2d1a9a095e4308d770c68/src/google/protobuf/compiler/plugin.proto#L99),
  which specifies what files are to be generated and their content. The serialized
  CodeGeneratorResponse is written to stdout of `protoc-gen-go`.
- On success of `protoc-gen-go`, `protoc` reads stdout and then writes these generated files.

The builtin generators to `protoc`, such as `--java_out`, `--cpp_out`, etc., work in roughly
the same manner, although instead of executing an external binary, this is done internally
to `protoc`.

**FileDescriptorSets are the primitive used throughout the Protobuf ecosystem to represent a
compiled Protobuf schema. They are also the primary artifact that protoc produces.**

That is to say that everything you do with `protoc`, and any plugins you use, talk in terms of FileDescriptorSets.
[gRPC Reflection](https://github.com/grpc/grpc/blob/master/doc/server-reflection.md) uses them under the hood as well.

## How do I create FileDescriptorSets with protoc?

`protoc` provides the `--descriptor_set_out` flag, aliased as `-o`, to allow writing serialized
FileDescriptorSets. For example, given a single file `foo.proto`, you can write a FileDescriptorSet to
stdout as follows:

```sh
$ protoc -I . -o /dev/stdout foo.proto
```

The resulting FileDescriptorSet will contain a single FileDescriptorProto with name `foo.proto`.

By default, FileDescriptorSets will not include any imports not specified on the command line,
and will not include source code information. Source code information is useful for generating
documentation inside your generated stubs, and for things like linters and breaking change
detectors. As an example, assume `foo.proto` imports `bar.proto`. To produce a FileDescriptorSet
that includes both `foo.proto` and `bar.proto`, as well as source code information:

```sh
$ protoc -I . --include_imports --include_source_info -o /dev/stdout foo.proto
```

## What are Images then?

An Image is Buf's custom extension to FileDescriptorSets. The actual definition is currently
stored in [bufbuild/buf](https://github.com/bufbuild/buf/blob/master/proto/buf/alpha/image/v1/image.proto)
as of this writing.

**Images are FileDescriptorSets, and FileDescriptorSets are Images.** Due to the forwards and
backwards compatible nature of Protobuf, we're able to add an additional field to FileDescriptorSet
while maintaining compatibility in both directions - existing Protobuf plugins will just drop this
field, and `buf` does not require this field to be set to work with Images.

**[Modules](../bsr/overview.md#module) are the primitive of Buf, and Images represent the compiled artifact of
a module.** In fact, Images contain information about the module used to create it, which
powers a variety of [BSR](../bsr/overview.md) features. For clarity, the `Image` definition is shown below
(notice the `ModuleName` in the `ImageFileExtension`):

```protobuf
// Image is an extended FileDescriptorSet.
//
// See https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto
message Image {
  repeated ImageFile file = 1;
}

// ImageFile is an extended FileDescriptorProto.
//
// Since FileDescriptorProto does not have extensions, we copy the fields from
// FileDescriptorProto, and then add our own extensions via the
// buf_image_file_extension field. This is compatible with a
// FileDescriptorProto.
//
// See https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto
message ImageFile {
  optional string name = 1;
  optional string package = 2;
  repeated string dependency = 3;
  repeated int32 public_dependency = 10;
  repeated int32 weak_dependency = 11;
  repeated google.protobuf.DescriptorProto message_type = 4;
  repeated google.protobuf.EnumDescriptorProto enum_type = 5;
  repeated google.protobuf.ServiceDescriptorProto service = 6;
  repeated google.protobuf.FieldDescriptorProto extension = 7;
  optional google.protobuf.FileOptions options = 8;
  optional google.protobuf.SourceCodeInfo source_code_info = 9;
  optional string syntax = 12;

  // buf_extension contains buf-specific extensions to FileDescriptorProtos.
  //
  // The prefixed name and high tag value is used to all but guarantee there
  // will never be any conflict with Google's FileDescriptorProto definition.
  // The definition of a FileDescriptorProto has not changed in years, so
  // we're not too worried about a conflict here.
  optional ImageFileExtension buf_extension = 8042;
}

// ImageFileExtension contains extensions to ImageFiles.
//
// The fields are not included directly on the ImageFile so that we can both
// detect if extensions exist, which signifies this was created by buf and not
// by protoc, and so that we can add fields in a freeform manner without
// worrying about conflicts with FileDescriptorProto.
message ImageFileExtension {
  // is_import denotes whether this file is considered an "import".
  //
  // An import is a file which was not derived from the local source files.
  // There are two cases where this could be true:
  //
  // 1. A Well-Known Type included from the compiler.
  // 2. A file that was included from a Buf module dependency.
  //
  // We use "import" as this matches with the protoc concept of
  // --include_imports, however import is a bit of an overloaded term.
  //
  // This will always be set.
  optional bool is_import = 1;
  // ModuleInfo contains information about the Buf module this file belongs to.
  //
  // This field is optional and will not be set if the module is not known.
  optional ModuleInfo module_info = 2;
  // is_syntax_unspecified denotes whether the file did not have a syntax
  // explicitly specified.
  //
  // Per the FileDescriptorProto spec, it would be fine in this case to just
  // leave the syntax field unset to denote this and to set the syntax field
  // to "proto2" if it is specified. However, protoc does not set the syntax
  // field if it was "proto2", and plugins may (incorrectly) depend on this.
  // We also want to maintain consistency with protoc as much as possible.
  // So instead, we have this field which will denote whether syntax was not
  // specified.
  //
  // This will always be set.
  optional bool is_syntax_unspecified = 3;
  // unused_dependency are the indexes within the dependency field on
  // FileDescriptorProto for those dependencies that are not used.
  //
  // This matches the shape of the public_dependency and weak_dependency
  // fields.
  repeated int32 unused_dependency = 4;
}

// ModuleInfo contains information about a Buf module that an ImageFile
// belongs to.
message ModuleInfo {
  // name is the name of the Buf module.
  //
  // This will always be set.
  optional ModuleName name = 1;
  // commit is the repository commit.
  //
  // This field is optional and will not be set if the commit is not known.
  optional string commit = 2;
}

// ModuleName is a module name.
//
// All fields will always be set.
message ModuleName {
  optional string remote = 1;
  optional string owner = 2;
  optional string repository = 3;
}
```

## Linting and breaking change detection

Linting and breaking change detection internally operate on Images that `buf`
either produces on the fly, or reads from an external location. They represent a stable,
widely-used method to represent a compiled Protobuf schema. For the breaking change
detector, Images are the storage format used if you want to manually store the state
of your Protobuf schema. See the [input documentation](inputs.md#breaking-change-detection)
for more details.

## Creating images

Images are created using `buf build`. If the current directory contains a valid
[`buf.yaml`](../configuration/v1/buf-yaml.md), building an Image is as simple as:

```sh
$ buf build -o image.bin
```

The resulting Image is written to the `image.bin` file. Of note, the ordering of
the FileDescriptorProtos is carefully written to mimic the ordering that `protoc`
would produce, for both the cases where imports are and are not written.

By default, `buf` produces an Image with both imports and source code info. You can
strip each of these:

```sh
$ buf build --exclude-imports --exclude-source-info -o image.bin
```

In general, we do not recommend stripping these, as this information can be useful
for various operations. However, source code info takes a lot of additional space
(generally ~5x more space), so if you know you do not need this data, it can be useful
to strip source code info.

Images can be outputted in one of two formats:

- Binary
- JSON

Either format can be compressed using Gzip or Zstandard.

Per the [Inputs](inputs.md) documentation, `buf build` can deduce the format
by the file extension:

```sh
$ buf build -o image.bin
$ buf build -o image.bin.gz
$ buf build -o image.bin.zst
$ buf build -o image.json
$ buf build -o image.json.gz
$ buf build -o image.json.zst
```

The special value `-` is used to denote stdout. You can manually set the format. For example:

```
$ buf build -o -#format=json
```

When combined with [jq](https://stedolan.github.io/jq), this also allows for introspection. For example,
to see a list of all packages:

```sh
$ buf build -o -#format=json | jq '.file[] | .package' | sort | uniq | head
"google.actions.type"
"google.ads.admob.v1"
"google.ads.googleads.v1.common"
"google.ads.googleads.v1.enums"
"google.ads.googleads.v1.errors"
"google.ads.googleads.v1.resources"
"google.ads.googleads.v1.services"
"google.ads.googleads.v2.common"
"google.ads.googleads.v2.enums"
"google.ads.googleads.v2.errors"
```

Images always include the ImageFileExtension field. However, if you want a pure FileDescriptorSet
without this field set, to mimic `protoc` entirely:

```
$ buf build -o image.bin --as-file-descriptor-set
```

The ImageFileExtension field will not affect Protobuf plugins or any other operations; they will
merely see this as an unknown field. However, we provide the option in case you want it.

## Using protoc output as `buf` input

Since `buf` speaks in terms of the Image, and FileDescriptorSets are Images, we're able to easily
allow `protoc` output to be `buf` input. As an example for lint:

```sh
$ protoc -I . --include_source_info -o /dev/stdout foo.proto | buf lint -
```

## Protoc lint and breaking change detection plugins

Since `buf` talks in terms of FileDescriptorSets, it's trivial for us to provide the Protobuf
plugins [protoc-gen-buf-lint](../lint/protoc-plugin.md) and [protoc-gen-buf-breaking](../breaking/protoc-plugin.md)
as well.
