---
id: remote-plugin-execution
title: Remote Plugin Execution
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Remote Plugin Execution

One of the greatest challenges with Protobuf code generation is the complexity of working with `protoc` and custom plugins. Time and time again we've heard that developers want the benefits of code generation, but the existing tooling gets in the way.

There is a high barrier to entry due to the complex web of different compiler and plugin versions. Managing and maintaining a stable environment locally on a single machine is hard enough, and the problem gets compounded as you scale out code generation across many developers.

Every organization and open source project develops homegrown tooling in an effort to simplify the developer experience and maintain consistent output across developers. A handful of organizations might get a workable solution, but these remain brittle and difficult to maintain over time. Furthermore, domain knowledge of these homegrown solutions gets lost and upgrade paths become challenging.

At Buf, we believe code generation is a key building block and the Protobuf ecosystem deserves a proper solution.

The **remote plugin execution** feature makes it possible to remotely generate source code using hosted plugins in an isolated environment on the BSR. By isolating code generation from its environment, you eliminate an entire class of problems caused by subtle differences across specific compiler versions and custom Protobuf plugins.

All you need to get started is:

- The `buf` CLI
- A [`buf.gen.yaml`](../../configuration/v1/buf-gen-yaml.md) file
- An [input](../../reference/inputs.md) of your choice

With this setup a single developer or thousands of developers at a large organization are able to achieve stable and reproducible code generation, while enjoying a simplified developer experience.

The Buf team has published a set of [official plugins](#official-plugins) for you to use, starting with all the built-in `protoc` Protobuf plugins and popular ones such as gRPC plugins. 

> Interested in publishing your own community plugin? Check out [Authoring a Plugin](plugin-example.md).
> To learn more about Buf Plugins check out the [Key concepts docs](concepts.md).

## Official plugins

### `protoc`-based plugins

The Buf team has developed tooling to automatically sync and publish all of the plugins built-in to `protoc`, which are located under the `protocolbuffers` organization. Here is a list of supported `protoc`-based plugins:

- https://buf.build/protocolbuffers/plugins/go
- https://buf.build/protocolbuffers/plugins/java
- https://buf.build/protocolbuffers/plugins/python
- https://buf.build/protocolbuffers/plugins/cpp
- https://buf.build/protocolbuffers/plugins/csharp
- https://buf.build/protocolbuffers/plugins/js
- https://buf.build/protocolbuffers/plugins/objc
- https://buf.build/protocolbuffers/plugins/php
- https://buf.build/protocolbuffers/plugins/ruby
- https://buf.build/protocolbuffers/plugins/kotlin

This is powerful because you no longer need to have `protoc` installed, or understand how to invoke it (a daunting task in and of itself). Furthermore you don't need to install additional plugins not already built-in to the `protoc` compiler, such as [protoc-gen-go](https://pkg.go.dev/github.com/golang/protobuf/protoc-gen-go).

### gRPC plugins

In addition to the plugins mentioned above, we're also adding support for popular gRPC plugins for nearly all of the same languages. These plugins are located under the `grpc` organization. Here is a list of supported gRPC plugins:

- https://buf.build/grpc/plugins/go
- https://buf.build/grpc/plugins/java
- https://buf.build/grpc/plugins/python
- https://buf.build/grpc/plugins/cpp
- https://buf.build/grpc/plugins/csharp
- https://buf.build/grpc/plugins/node
- https://buf.build/grpc/plugins/web
- https://buf.build/grpc/plugins/objc
- https://buf.build/grpc/plugins/php
- https://buf.build/grpc/plugins/ruby
- https://buf.build/grpc/plugins/kotlin

## Example

This section provides an example of remote plugin execution.

We'll use the [buf.build/demolab/theweather](https://buf.build/demolab/theweather) module hosted on the BSR as the input source. You can also use local Protobuf files, but for this example we'll use a hosted module to illustrate remote plugin execution.

A remote plugin can have a version specified, as is done below, or it can be omitted, if you want to always use the latest version of the plugin.

Create a template file with these contents: 

<Tabs
  groupId="language-selection"
  defaultValue="go"
  values={[
    {label: 'Go', value: 'go'},
    {label: 'JavaScript', value: 'javascript'},
    {label: 'Python', value: 'python'},
    {label: 'Ruby', value: 'ruby'},
    {label: 'Java', value: 'java'},
  ]}>
  <TabItem value="go">

```yaml title=buf.gen.yaml
version: v1
managed:
  enabled: true
  go_package_prefix:
    default: github.com/organization/repository/gen/go
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

  </TabItem>
  <TabItem value="javascript">

```yaml title=buf.gen.yaml
version: v1
managed:
  enabled: true
plugins:
  - remote: buf.build/protocolbuffers/plugins/js:v3.19.1-1
    out: gen/js
    opt:
      - import_style=commonjs
      - binary
  - remote: buf.build/grpc/plugins/node:v1.11.2-1
    out: gen/js
    opt:
      - import_style=commonjs
```

  </TabItem>
  <TabItem value="python">

```yaml title=buf.gen.yaml
version: v1
managed:
  enabled: true
plugins:
  - remote: buf.build/protocolbuffers/plugins/python:v3.19.1-1
    out: gen/python
  - remote: buf.build/grpc/plugins/python:v1.41.1-1
    out: gen/python
```
  
  </TabItem>
  <TabItem value="ruby">

```yaml title=buf.gen.yaml
version: v1
managed:
  enabled: true
plugins:
  - remote: buf.build/protocolbuffers/plugins/ruby:v3.19.1-1
    out: gen/ruby
  - remote: buf.build/grpc/plugins/ruby:v1.41.1-1
    out: gen/ruby
```

  </TabItem>
  <TabItem value="java">

```yaml title=buf.gen.yaml
version: v1
managed:
  enabled: true
plugins:
  - remote: buf.build/protocolbuffers/plugins/java:v3.19.1-1
    out: gen/java
  - remote: buf.build/grpc/plugins/java:v1.42.1-1
    out: gen/java
```

  </TabItem>
</Tabs>

Note, we're using the `remote` key instead of `name` to reference a remote plugin, instead of a local one. More information can be [found in the buf.gen.yaml docs](https://docs.buf.build/configuration/v1/buf-gen-yaml#name-or-remote).

> As a best practice, when referencing remote plugins we recommend including the version of the plugin to ensure reproducible code generation.

It is possible to reference both local and remote plugins within a single template file. The `buf generate` command issues an RPC to the BSR to execute the remote plugins against the given input. Once execution is finished the output is written out to disk.

```terminal
$ buf generate buf.build/demolab/theweather
```

You should end up with this structure:

<Tabs
  groupId="language-selection"
  defaultValue="go"
  values={[
    {label: 'Go', value: 'go'},
    {label: 'JavaScript', value: 'javascript'},
    {label: 'Python', value: 'python'},
    {label: 'Ruby', value: 'ruby'},
    {label: 'Java', value: 'java'},
  ]}>
  <TabItem value="go">

```bash
.
├── buf.gen.yaml
└── gen
    └── go
        └── weather
            └── v1
                ├── weather.pb.go
                └── weather_grpc.pb.go
```

  </TabItem>
  <TabItem value="javascript">

```bash
.
├── buf.gen.yaml
└── gen
    └── js
        └── weather
            └── v1
                ├── weather_grpc_pb.js
                └── weather_pb.js
```

  </TabItem>
  <TabItem value="python">

```bash
.
├── buf.gen.yaml
└── gen
    └── python
        └── weather
            └── v1
                ├── weather_pb2.py
                └── weather_pb2_grpc.py
```
  
  </TabItem>
  <TabItem value="ruby">

```bash
.
├── buf.gen.yaml
└── gen
    └── ruby
        └── weather
            └── v1
                ├── weather_pb.rb
                └── weather_services_pb.rb
```

  </TabItem>
  <TabItem value="java">

```bash
.
├── buf.gen.yaml
└── gen
    └── java
        └── com
            └── weather
                └── v1
                    ├── GetWeatherRequest.java
                    ├── GetWeatherRequestOrBuilder.java
                    ├── GetWeatherResponse.java
                    ├── GetWeatherResponseOrBuilder.java
                    ├── WeatherProto.java
                    └── WeatherServiceGrpc.java
```

  </TabItem>
</Tabs>

## Wrapping up

Remote plugin execution simplifies the process of generating code for your Protobuf API. It also has the added benefit of enforcing reproducible outputs by eliminating differences in the environment where generation takes place, such as a developer's local machine or across continuous integration environments.

Bring your own Protobuf files, or publish them to the BSR, and then generate the corresponding client and server code in your language of choice with hosted plugins on the BSR. You get all the benefits of code generation without the headache of managing plugins or `protoc` versions.
