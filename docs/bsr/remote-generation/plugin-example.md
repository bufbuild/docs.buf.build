---
id: plugin-example
title: Authoring a plugin
---

> The [remote code generation](/bsr/remote-generation/overview) feature is currently in **alpha**. We started with Go and have plans to add support for other languages. [Let us know](/contact.md) which language we should tackle next.

The purpose of this guide is to walk you through a concrete example of how to publish an existing `protoc`-based plugin to the BSR.

We'll take a real-world plugin named `protoc-gen-twirp` and convert it to a containerized BSR plugin. This will be the building block for the [Authoring a Template](template-example.md) example in the next section.

The `protoc-gen-twirp` source code can be found [here](https://github.com/twitchtv/twirp/tree/main/protoc-gen-twirp).

## 1. Docker registry authentication

To push plugins to the BSR, you will need to authenticate to the plugin Docker registry using `docker login`. The username doesn't matter, but has to be provided. Obtain an API token (password) from the [Settings Page](https://buf.build/settings/user) and run this command:

```terminal
$ docker login -u myuser plugins.buf.build
---
password:
Login Succeeded
```

NOTE: Even though the `docker` CLI says `Login Succeeded`, it doesn't actually test your credentials. If you're having issues doing a `docker push` (step 5), refer to the [docker login](https://docs.docker.com/engine/reference/commandline/login/) docs.

## 2. Create BSR plugin

Before we can push a plugin to the BSR, a repository must exist. You can create a repository through the UI or the `buf` CLI.

From the UI click your avatar in the top-right corner, select Plugins and click
the Create Plugin button. Follow the on-screen instructions.

For this example, however, we'll use the `buf` CLI.

> This tutorial uses a real organization (demolab) and plugin name (twirp), make sure to substitute these with your own values.

Create the plugin with `buf` command:

```terminal
$ buf beta registry plugin create \
    buf.build/demolab/plugins/twirp --visibility public 
---
Owner    Name
demolab  twirp
```

There is now a public plugin on the BSR named `twirp` owned by the `demolab` organization:

https://buf.build/demolab/plugins/twirp

## 3. Prepare the Dockerfile

BSR plugins are containerized `protoc`-based plugins that read `CodeGeneratorRequest` from standard input and write `CodeGeneratorResponse` to standard output.

Since the `protoc-gen-twirp` plugin is written in Go, we'll build this plugin with `go install`.

Here is the full Dockerfile example, the entrypoint is `protoc-gen-twirp`:

```Dockerfile title="Dockerfile.twirp"
FROM golang as builder

ENV GOOS=linux GOARCH=amd64 CGO_ENABLED=0

RUN go install github.com/twitchtv/twirp/protoc-gen-twirp@v8.1.0+incompatible
# Note, the Docker images must be built for amd64. If the host machine architecture is not amd64
# you need to cross-compile the binary and move it into /go/bin.
RUN bash -c 'find /go/bin/${GOOS}_${GOARCH}/ -mindepth 1 -maxdepth 1 -exec mv {} /go/bin \;'

FROM scratch

# Runtime dependencies
LABEL "build.buf.plugins.runtime_library_versions.0.name"="github.com/twitchtv/twirp"
LABEL "build.buf.plugins.runtime_library_versions.0.version"="v8.1.0+incompatible"
LABEL "build.buf.plugins.runtime_library_versions.1.name"="google.golang.org/protobuf"
LABEL "build.buf.plugins.runtime_library_versions.1.version"="v1.27.1"

COPY --from=builder /go/bin /

ENTRYPOINT ["/protoc-gen-twirp"]
```

This Dockerfile uses [multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/).

The intended `GOOS/GOARCH` **must** be `linux/amd64`. This is important, especially if you're building Docker images on an ARM-based machine, such as Apple M1 computers.

Normally `go install` would install to `$GOPATH/bin/$GOOS_$GOARCH` when cross-compiling, so we added this line to copy the executable into the `/go/bin` path.

```Dockerfile
RUN bash -c 'find /go/bin/${GOOS}_${GOARCH}/ -mindepth 1 -maxdepth 1 -exec mv {} /go/bin \;'
```

A plugin may generate code that depends on a runtime library, and it is important that this information is captured in the containerized BSR plugin. This is accomplished using [Docker labels](https://docs.docker.com/config/labels-custom-metadata/). In this example the `protoc-gen-twirp` plugin depends on [github.com/twitchtv/twirp](https://github.com/twitchtv/twirp) and [google.golang.org/protobuf](https://google.golang.org/protobuf).

The `twitchtv/twirp` project does not support Go modules, but we have to pass a version that Go is able to recognize. For this example we'll use version `v8.1.0+incompatible`, however, for most Go projects with module support you would pass a normal semver version.

Since Go binaries are statically linked and have no further dependencies the binary is copied into a lightweight `scratch` image to reduce the final image size.

## 4. Build the Dockerfile

Once we prepared the Dockerfile, the next step is to build and tag an image.

We'll do so locally by running this command:

```terminal
$ docker build -f Dockerfile.twirp -t plugins.buf.build/demolab/twirp:v8.1.0-1 .
```

We're tagging the version as `v8.1.0-1` even though the upstream version of the plugin is `v8.1.0`. This structure enables us to make changes to the packaging of the plugin without changing the upstream version, for example, if we made a mistake in our Dockerfile. This pattern is commonly used in other systems where packaging is done externally to the upstream software, such as [Debian](https://www.debian.org/doc/debian-policy/ch-controlfields.html#version) and [Arch](https://wiki.archlinux.org/title/Arch_package_guidelines#Package_versioning)
package versioning systems.

## 5. Publish plugin to the BSR

Lastly, publish the containerized `protoc`-based plugin to the BSR. Make sure you have [authenticated](#1-docker-registry-authentication) your docker client in step 1.

```terminal
$ docker push plugins.buf.build/demolab/twirp:v8.1.0-1
---
The push refers to repository [plugins.buf.build/demolab/twirp]
f3dfdb857337: Pushed 
v8.1.0-1: digest: sha256:782f6522b2bc8cc943338b61a73e795c4309969f9974ef3431e4aa1f76150e16 size: 528
```

Awesome, you've successfully published your first BSR plugin! 

Remember, plugins are the smallest reusable components required for code generation. In the next section we'll prepare a BSR Template and use the `demolab/twirp` plugin created above.

Continue to the next section to learn more about authoring *and using* [BSR Templates](template-example.md)
