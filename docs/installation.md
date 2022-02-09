---
id: installation
title: Installation
---


import DownloadButton, {mac, linux, windows} from '@site/src/components/DownloadButton';

<div>
  <DownloadButton os={mac}>
    Buf for Mac
  </DownloadButton>
  <DownloadButton os={linux}>
    Buf for Linux
  </DownloadButton>
  <DownloadButton os={windows}>
    Buf for Windows
  </DownloadButton>
</div>

## Homebrew

You can install `buf` on macOS or Linux using [Homebrew](https://brew.sh):

```sh
brew install bufbuild/buf/buf
```

This installs:

  - The binaries `buf`, `protoc-gen-buf-breaking`, `protoc-gen-buf-lint`.
  - Bash completion for `buf`.
  - Fish completion for `buf`.
  - Zsh completion for `buf`.

## GitHub Releases

`buf` is released via the [bufbuild/buf](https://github.com/bufbuild/buf) repository.

Two types of assets are available:

- The single `buf`, `protoc-gen-buf-breaking`, and `protoc-gen-buf-lint` binaries.
- A tarball containing the binaries, bash completion, fish completion, and zsh completion.

See [the Releases page](https://github.com/bufbuild/buf/releases) for the current release.

### Binary

The binary is all that is needed to get started.

To install just the `buf` binary to `/usr/local/bin` for version `1.0.0-rc12`:

```sh
# Substitute BIN for your bin directory.
# Substitute VERSION for the current released version.
BIN="/usr/local/bin" && \
VERSION="1.0.0-rc12" && \
  curl -sSL \
    "https://github.com/bufbuild/buf/releases/download/v${VERSION}/buf-$(uname -s)-$(uname -m)" \
    -o "${BIN}/buf" && \
  chmod +x "${BIN}/buf"
```

`/usr/local/bin` should be on your `$PATH`.

To uninstall from `/usr/local/bin`:

```sh
# Substitute BIN for your bin directory.
BIN="/usr/local/bin" && \
  rm -f "${BIN}/buf"
```

### Tarball

To install the `buf`, `protoc-gen-buf-breaking`, and `protoc-gen-buf-lint` binaries,
bash completion, fish completion, and zsh completion to `/usr/local` for version `1.0.0-rc12`:

```sh
# Substitute PREFIX for your install prefix.
# Substitute VERSION for the current released version.
PREFIX="/usr/local" && \
VERSION="1.0.0-rc12" && \
  curl -sSL \
    "https://github.com/bufbuild/buf/releases/download/v${VERSION}/buf-$(uname -s)-$(uname -m).tar.gz" | \
    tar -xvzf - -C "${PREFIX}" --strip-components 1
```

The binaries are installed to `/usr/local/bin`, which should be on your `$PATH`.

To uninstall from `/usr/local`:

```sh
# Substitute PREFIX for your install prefix.
PREFIX="/usr/local" && \
rm -f \
  "${PREFIX}/bin/buf" \
  "${PREFIX}/bin/protoc-gen-buf-breaking" \
  "${PREFIX}/bin/protoc-gen-buf-lint" \
  "${PREFIX}/etc/bash_completion.d/buf" \
  "${PREFIX}/etc/fish/vendor_completions.d/buf.fish"
  "${PREFIX}/etc/zsh/site-functions/_buf"
```

### Verifying a release

Releases are signed using our [minisign](https://github.com/jedisct1/minisign) public key:

```
RWQ/i9xseZwBVE7pEniCNjlNOeeyp4BQgdZDLQcAohxEAH5Uj5DEKjv6
```

The release assets can be verified using this command (assuming that `minisign` is installed):

```sh
# Substitute VERSION for the current released version.
VERSION="1.0.0-rc12" && \
  curl -OL https://github.com/bufbuild/buf/releases/download/v${VERSION}/sha256.txt && \
  curl -OL https://github.com/bufbuild/buf/releases/download/v${VERSION}/sha256.txt.minisig && \
  minisign -Vm sha256.txt -P RWQ/i9xseZwBVE7pEniCNjlNOeeyp4BQgdZDLQcAohxEAH5Uj5DEKjv6
```

## From Source

The binary can be installed from source if `go` is installed, however we recommend using one of
the release assets instead.

```sh
# Substitute GOBIN for your bin directory
# Leave unset to default to $GOPATH/bin
GO111MODULE=on GOBIN=/usr/local/bin go install \
  github.com/bufbuild/buf/cmd/buf@v1.0.0-rc12
```

## Use the Docker Image

Buf ships a Docker image ([bufbuild/buf](https://hub.docker.com/r/bufbuild/buf)) that enables
you to use `buf` as part of your Docker workflow.

For example, you can run `buf lint` with this command:

```sh
$ docker run --volume "$(pwd):/workspace" --workdir /workspace bufbuild/buf lint
google/type/datetime.proto:17:1:Package name "google.type" should be suffixed with a correctly formed version, such as "google.type.v1".
```

## Windows Support

Buf has officially added support for Windows, available for both `x64_64` and `arm64` architectures. You can download the latest binary from the [release page](https://github.com/bufbuild/buf/releases/latest).
