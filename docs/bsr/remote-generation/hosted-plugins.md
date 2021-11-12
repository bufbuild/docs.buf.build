---
id: remote-plugin-execution
title: Remote Plugin Execution
---

# Remote Plugin Execution

The remote plugin execution feature makes it possible to execute Protobuf plugins remotely in a secure environment on the BSR, as opposed to invoking plugins on your local machine.


## Supported plugins

### protoc-based plugins

The Buf team has developed tooling to automatically sync and publish all of the plugins built-in to `protoc`, which are located under the `protocolbuffers` organization. A full list can be found here:

https://buf.build/protocolbuffers/plugins

This is powerful because you no longer need to have `protoc` installed. All the benefits of code generation using the `buf` CLI and remote plugins without the headache of managing `protoc`.

### gRPC plugins

In addition to the plugins mentioned above, we're also adding support for popular gRPC plugins for nearly all of the same languages. These plugins are located under the `grpc` organization. A full list can be found here:

https://buf.build/grpc/plugins

### Example

