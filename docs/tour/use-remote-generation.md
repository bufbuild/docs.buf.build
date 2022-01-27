---
id: use-remote-generation
title: 16 Bonus — Use Remote Generation
---

> The [Remote Generation](../bsr/remote-generation/overview.md) feature is
> *experimental*.

In this section, we'll learn how to use Buf's Go Module Proxy to import the
Go/gRPC client and server stubs like any other ordinary library.

This simplifies the code generation workflow to be as simple as `buf push`
followed by `go get` or `go mod tidy`.

## 16.1 Remove `buf.gen.yaml` {#remove-bufgenyaml}

We won't need to generate anything locally anymore, so we can remove the
`buf.gen.yaml`, as well as the generated code found in the `gen/` directory:

```terminal
$ rm buf.gen.yaml
$ rm -rf gen
```

As expected, if you try to compile your Go program again, you'll notice a compilation error:

```terminal
$ go build ./...
client/main.go:10:2: no required module provides package github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1; to add it:
	go get github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1
```

## 16.2 Depend on `go.buf.build` {#depend-on-gobufbuild}

We can depend on the same Go/gRPC client and server stubs by adapting our import paths
to use [https://buf.build/library/templates/go-grpc](https://buf.build/library/templates/go-grpc),
which is one of the BSR's [hosted templates](../bsr/remote-generation/overview.md#hosted-templates).

In short, the `go-grpc` template acts exactly like the local `buf.gen.yaml` template we just removed,
(i.e. it executes the `protoc-gen-go` and `protoc-gen-go-grpc` plugins).

The [Go module path](../bsr/remote-generation/overview.md#the-go-module-path) we need to use is derived
from the name of the module we want to generate *for*, as well as the name of the template we want to
generate *with*:

```
go.buf.build/TEMPLATE_OWNER/TEMPLATE_NAME/MODULE_OWNER/MODULE_NAME
```

With module `buf.build/$BUF_USER/petapis` and template `buf.build/library/template/go-grpc`, the result
becomes:

```
go.buf.build/grpc/go/$BUF_USER/petapis
```

Update your import paths like so:

```go title="client/main.go" {8-11}
 package main

 import (
     "context"
     "fmt"
     "log"

-    // This import path is based on the name declaration in the go.mod,
-    // and the gen/proto/go output location in the buf.gen.yaml.
-    petv1 "github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1"
+    petv1 "go.buf.build/grpc/go/$BUF_USER/petapis/pet/v1"
     "google.golang.org/grpc"
 )
```

```go title="server/main.go" {9-12}
 package main

 import (
     "context"
     "fmt"
     "log"
     "net"

-    // This import path is based on the name declaration in the go.mod,
-    // and the gen/proto/go output location in the buf.gen.yaml.
-    petv1 "github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1"
+    petv1 "go.buf.build/grpc/go/$BUF_USER/petapis/pet/v1"
     "google.golang.org/grpc"
 )
```

Now if you run the following command, you'll notice that the remote-generated library is resolved:

```terminal
$ go mod tidy
go: finding module for package go.buf.build/grpc/go/$BUF_USER/petapis/pet/v1
go: found go.buf.build/grpc/go/$BUF_USER/petapis/pet/v1 in go.buf.build/grpc/go/$BUF_USER/petapis v1.4.4
go: downloading go.buf.build/grpc/go/$BUF_USER/paymentapis v1.4.1
```

With this, the Go/gRPC client and server stubs are included in your `go.mod` just like
any other ordinary Go library.

## 16.3 Run the Application {#run-the-application}

We can run the application again to verify the remote-generated library works as expected.

Run the server with the following:

```terminal
$ go run server/main.go
... Listening on 127.0.0.1:8080
```

In a separate terminal, run the client and you'll notice the following:

```terminal
$ go run client/main.go
... Connected to 127.0.0.1:8080
... Successfully PutPet
```

You'll also notice the following in the server logs (in the other terminal running the server):

```terminal
$ go run server/main.go
... Listening on 127.0.0.1:8080
... Got a request to create a PET_TYPE_SNAKE named Ekans
```

Everything works just as before, but we don't have any locally generated code:

```sh
start/
├── buf.work.yaml
├── client
│   └── main.go
├── go.mod
├── go.sum
├── paymentapis
│   ├── buf.lock
│   ├── buf.yaml
│   └── payment
│       └── v1alpha1
│           └── payment.proto
├── petapis
│   ├── buf.lock
│   ├── buf.md
│   ├── buf.yaml
│   └── pet
│       └── v1
│           └── pet.proto
└── server
    └── main.go
```

## 16.4 Synthetic Versions {#synthetic-versions}

Now that we're depending on the remote-generated library, it's important to discuss how it is
versioned.

The challenge with versioning remote generated code, is that it is the product of two logical
inputs: the Protobuf module and the template version. The lowest common denominator of the language
registry ecosystems we surveyed is "semantic versioning without builds or pre-releases", so
something like `v1.2.3`.

To ensure that we can create consistent, and lossless synthetic versions, we simplify the
versioning schemes of the two inputs. Both template versions, and Protobuf module versions, are
represented as **monotonically increasing integers**.

  - For hosted Templates we enforce a version of the form `v1`, `v2`, `vN...`.
  - For Protobuf modules we use the **commit sequence ID**. This ID is an integer that uniquely
    identifies a commit. It is calculated by counting the number of commits since the first commit
    of a module (i.e. the first commit has a sequence ID of `1`, the second commit has a sequence ID
    of `2`, and so on).

With these simplified versioning schemes we create a synthetic version which takes the following form:

```
[v1].[template_version].[commit_sequence_id]
```

As an example, the version `v1.3.5` represents the 3rd version of a hosted template and the 5th commit
of a Protobuf module.

In this case, we're using the 4th version for both the hosted template and the Protobuf module:

```sh title="go.mod" {6}
module github.com/bufbuild/buf-tour/petstore

go 1.16

require (
	go.buf.build/grpc/go/$BUF_USER/petapis v1.4.4
	google.golang.org/genproto v0.0.0-20210811021853-ddbe55d93216 // indirect
	google.golang.org/grpc v1.40.0
)
```

## 16.5 Updating Versions {#updating-versions}

When you update your module and push new commits, you can update your library version by incrementing
the final element in the synthetic version (described above).

To demonstrate, make a simple change by adding a simple comment to the `PetStoreService`:

```terminal
$ cd petapis
```

```protobuf title="petapis/pet/v1/pet.proto" {1}
+// PetStoreService defines a pet store service.
 service PetStoreService {
   rpc GetPet(GetPetRequest) returns (GetPetResponse) {}
   rpc PutPet(PutPetRequest) returns (PutPetResponse) {}
   rpc DeletePet(DeletePetRequest) returns (DeletePetResponse) {}
   rpc PurchasePet(PurchasePetRequest) returns (PurchasePetResponse) {}
 }
```

Push the latest changes with the following command:

```terminal
$ buf push
8535a2784a3a48f6b72f2cb80eb49ac7
```

Now, edit your `go.mod` to use the latest version (i.e. the 5th commit):

```sh title="go.mod" {6-7}
 module github.com/bufbuild/buf-tour/petstore

 go 1.16

 require (
-    go.buf.build/grpc/go/$BUF_USER/petapis v1.4.4
+    go.buf.build/grpc/go/$BUF_USER/petapis v1.4.5
     google.golang.org/genproto v0.0.0-20210811021853-ddbe55d93216 // indirect
     google.golang.org/grpc v1.40.0
 )
```

If you run the following command, you'll notice that your `go.sum` is updated with
the version specified in your `go.mod`:

```terminal
$ go mod tidy
```

```sh title="go.sum" {1-4}
-go.buf.build/grpc/go/$BUF_USER/petapis v1.4.4 h1:Ay1b0VFvLsey21ylibis+lP8wBiDd5RUipDnQG6nCvY=
-go.buf.build/grpc/go/$BUF_USER/petapis v1.4.4/go.mod h1:aKE843ItBFu7UPuaxuUJvNpqC2hjVagPYiJ20n9dBJQ=
+go.buf.build/grpc/go/$BUF_USER/petapis v1.4.5 h1:kW63uI3YuRvHb4WPrn7dJQLUaMHuNE3x/912DpzwloE=
+go.buf.build/grpc/go/$BUF_USER/petapis v1.4.5/go.mod h1:aKE843ItBFu7UPuaxuUJvNpqC2hjVagPYiJ20n9dBJQ=
```
