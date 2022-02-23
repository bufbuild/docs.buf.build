---
id: grpc
title: Call gRPC Endpoints (CLI)
---

`buf` does not provide any gRPC call functionality directly. We feel such CLI functionality
is better left to gRPC-specific tools for now, as they are concentrated on the specific
issues associated with gRPC. `buf` continues to support generation of gRPC clients and servers
via Protobuf plugins. See [generate usage](../generate/usage.md) for more information.

`buf` can provide [`FileDescriptorSet`s](https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto)
usable by gRPC CLI tools on the fly, which is useful when [gRPC Reflection](https://github.com/grpc/grpc/blob/master/doc/server-reflection.md)
is not available on a server, which is the common case.

## grpcurl

We recommend using [grpcurl](https://github.com/fullstorydev/grpcurl) for gRPC operations
from the command line. We feel that `grpcurl` is the most reliable gRPC CLI tool while
providing most necessary functionality. Additionally, `grpcurl` actually uses the same
Protobuf library that Buf's [internal compiler](../build/internal-compiler.md)
is derived from.

To use `buf`-produced `FileDescriptorSet`s with `grpcurl` on the fly:

```sh
$ grpcurl -protoset <(buf build -o -) ...
```

## ghz

[ghz](https://ghz.sh) is another CLI tool we can recommend. It has a host of features, including various
output formats and benchmarking functionality.

To use `buf`-produced `FileDescriptorSet`s with `ghz` on the fly:

```sh
$ ghz --protoset <(buf build -o -) ...
```

[filedescriptorset]: https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/descriptor.proto
