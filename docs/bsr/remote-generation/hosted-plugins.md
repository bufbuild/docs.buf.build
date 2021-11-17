---
id: remote-plugin-execution
title: Remote Plugin Execution
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Remote Plugin Execution

The remote plugin execution feature makes it possible to execute Protobuf plugins remotely in a secure environment on the BSR, as opposed to invoking plugins on your local machine.

By isolating and centralizing code generation from its environment, you eliminate an entire class of problems caused by subtle differences across specific versions of `protoc` and custom Protobuf plugins.

## Supported plugins

### `protoc`-based plugins

The Buf team has developed tooling to automatically sync and publish all of the plugins built-in to `protoc`, which are located under the `protocolbuffers` organization. A full list can be found here:

https://buf.build/protocolbuffers/plugins

This is powerful because you no longer need to have `protoc` installed. It provides all the benefits of code generation using `buf` and remote plugins without the headache of managing `protoc`.

### gRPC plugins

In addition to the plugins mentioned above, we're also adding support for popular gRPC plugins for nearly all of the same languages. These plugins are located under the `grpc` organization. A full list can be found here:

https://buf.build/grpc/plugins

## Example

The following is an example of remote plugin execution, and this is all you need to get started:

- The `buf` CLI
- A [`buf.gen.yaml`](../../configuration/v1/buf-gen-yaml.md) file 
- An [input](../../reference/inputs.md) of your choice

We'll use the [buf.build/demolab/theweather](https://buf.build/demolab/theweather) module hosted on the BSR as the input source. You can also use local Protobuf files, but for this example we'll use a hosted module to illustrate remote plugin execution.

Create a template file with the following contents: 

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
  - remote: buf.build/grpc/plugins/node:v1.11.2-1
    out: gen/js
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

It is possible to reference both local and remote plugins within a single template file. The `buf generate` command issues an RPC to the BSR to execute the remote plugins against the given module. Once execution is finished the output is written out to disk.

```terminal
$ buf generate buf.build/demolab/theweather
```

What you should end up with is the following structure:

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
        ├── getweatherrequest.js
        ├── getweatherresponse.js
        └── weather
            └── v1
                └── weather_grpc_pb.js
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

All code generation takes place in a **secure environment** on the BSR.

Bring your own Protobuf files, or publish them to the BSR, and then generate the corresponding client and server code in your language of choice with hosted plugins on the BSR. You get all the benefits of code generation without the headache of managing plugins or `protoc` versions.