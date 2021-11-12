---
id: remote-plugin-execution
title: Remote Plugin Execution
---

# Remote Plugin Execution

The remote plugin execution feature makes it possible to execute Protobuf plugins remotely in a secure environment on the BSR, as opposed to invoking plugins on your local machine.

By isolating and centralizing code generation from its environment, you eliminate an entire class of problems caused by subtle differences across specific versions of `protoc` and custom Protobuf plugins.

As a best practice, when referencing remote plugins we recommend including the version of the plugin to ensure reproducible code generation.

## Supported plugins

### protoc-based plugins

The Buf team has developed tooling to automatically sync and publish all of the plugins built-in to `protoc`, which are located under the `protocolbuffers` organization. A full list can be found here:

https://buf.build/protocolbuffers/plugins

This is powerful because you no longer need to have `protoc` installed. All the benefits of code generation using the `buf` CLI and remote plugins without the headache of managing `protoc`.

### gRPC plugins

In addition to the plugins mentioned above, we're also adding support for popular gRPC plugins for nearly all of the same languages. These plugins are located under the `grpc` organization. A full list can be found here:

https://buf.build/grpc/plugins

### Example

The following is an example of remote plugin execution, all you need is `buf`, a `buf.gen.yaml` file and a module of your choice.

We'll use the [https://buf.build/acme/petapis](acme/petapis) module hosted on the BSR as the input source. You can also use local Protobuf files, but for this example we're using a hosted module to illustrate remote plugin execution.

Next, create a `buf.gen.yaml` file with the following contents: 

```yaml title=buf.gen.yaml
version: v1
managed:
  enabled: true
  go_package_prefix:
    default: github.com/org/repo/gen/go
plugins:
  - remote: buf.build/protocolbuffers/plugins/go:v1.27.1-1
    out: gen/go
    opt: paths=source_relative
  - remote: buf.build/grpc/plugins/go:v1.1.0-1
    out: gen/go
    opt:
      - paths=source_relative
      - require_unimplemented_servers=false
```

Note we're using the `remote` key instead of `name` to reference a remote plugin, instead of a local one. More information can be [found here](https://docs.buf.build/configuration/v1/buf-gen-yaml#name-or-remote). 

It is possible to reference both local and remote plugins within a single template.

The `buf generate` command issues an RPC to the BSR to execute the remote plugins against the given module. Once execution is finished the output is written out to disk.

```terminal
$ buf generate buf.build/acme/petapis --include-imports
```

The acme/petapis module has a dependency on the acme/paymentapis and googleapis/googleapis so we include the `--include-imports` flag to resolve those dependencies.

What you should end up with is the following structure:

```bash
.
├── buf.gen.yaml
└── gen
    └── go
        ├── google
        │   └── type
        │       ├── datetime.pb.go
        │       └── money.pb.go
        ├── payment
        │   └── v1alpha1
        │       └── payment.pb.go
        ├── pet
        │   └── v1
        │       ├── pet.pb.go
        │       └── pet_grpc.pb.go
        └── weather
            └── v1
                ├── weather.pb.go
                └── weather_grpc.pb.go
```