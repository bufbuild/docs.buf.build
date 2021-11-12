---
id: remote-plugin-execution
title: Remote Plugin Execution
---

# Remote Plugin Execution

The remote plugin execution feature makes it possible to execute Protobuf plugins remotely in a secure environment on the BSR, as opposed to invoking plugins on your local machine.

We've made it easier than ever to get started with code generation.

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

We'll use the [https://buf.build/acme/petapis](acme/petapis) module hosted on the BSR. You can also use local Protobuf files, but for the sake of this example we're using a hosted module to illustrate remote plugin execution.

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

And then run the following command:

```terminal
$ buf generate buf.build/acme/petapis --include-imports
```

What this does is send the `acme/petapis` module up to the BSR, resolve dependencies (because we included the `--include-imports` flag), and then execute the requested plugins in a secure sandbox environment on the BSR. Once execution is finished the output is written out to local disk.

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