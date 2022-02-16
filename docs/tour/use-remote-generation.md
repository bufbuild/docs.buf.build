---
id: use-remote-generation
title: 16 Bonus — Use Remote Generation
---

> The [Remote Generation](../bsr/remote-generation/overview.md) feature is **experimental** and
> thus likely to change.

In this section, you'll learn how to use Buf's Go Module Proxy to import the Go/gRPC client and
server stubs as you would import any other Go library. Remote Generation thus reduces the code
generation workflow to two steps:

1. `buf push`
1. `go get` (or `go mod tidy`)

## 16.1 Remove `buf.gen.yaml` {#remove-bufgenyaml}

You won't need to generate any code locally at this stage, so you can remove the `buf.gen.yaml` as
well as the generated code in the `gen` directory:

```terminal
$ rm buf.gen.yaml
$ rm -rf gen
```

As expected, if you try to recompile your Go program, you'll notice a compilation error:

```terminal
$ go build ./...
---
client/main.go:10:2: no required module provides package github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1; to add it:
	go get github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1
```

## 16.2 Depend on `go.buf.build` {#depend-on-gobufbuild}

You can depend on the same Go/gRPC client and server stubs by adapting our import paths
to use [`buf.build/grpc/templates/go`](https://buf.build/grpc/templates/go),
which is one of the BSR's [hosted
templates](/bsr/remote-generation/overview.md#hosted-templates).

In short, the `go-grpc` template acts exactly like the local `buf.gen.yaml` template you just
removed. It executes the `protoc-gen-go` and `protoc-gen-go-grpc` plugins you used before, but with
the important difference that the execution happens remotely, on BSR.

The [Go module path](../bsr/remote-generation/overview.md#the-go-module-path) you need to use is
derived from the name of the module you want to generate *for* and the name of the template you want
to generate *with*:

<Syntax
	title="Generated Go module path syntax"
	examples={["go.buf.build/grpc/go/googleapis/googleapis"]}
	segments={[
    {"label": "go.buf.build", "kind": "static"},
    {"separator": "/"},
    {"label": "template owner", "kind": "variable"},
    {"separator": "/"},
    {"label": "template name", "kind": "variable"},
    {"separator": "/"},
    {"label": "module owner", "kind": "variable"},
    {"separator": "/"},
    {"label": "module name", "kind": "variable"},
  ]
} />

With the module `buf.build/$BUF_USER/petapis` and template `buf.build/grpc/templates/go`, for example, the
import path looks like this:

```
go.buf.build/grpc/go/$BUF_USER/petapis
```

Update your import paths accordingly:

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

Now if you run the command below, you'll notice that the remote-generated library is
successfully resolved:

```terminal
$ go mod tidy
---
go: finding module for package go.buf.build/grpc/go/$BUF_USER/petapis/pet/v1
go: found go.buf.build/grpc/go/$BUF_USER/petapis/pet/v1 in go.buf.build/grpc/go/$BUF_USER/petapis v1.4.4
go: downloading go.buf.build/grpc/go/$BUF_USER/paymentapis v1.4.1
```

The Go/gRPC client and server stubs are now included in your `go.mod` just like any other Go
library.

## 16.3 Run the Application {#run-the-application}

You can run the application again to verify that the remote-generated library works as expected.

First, start the server:

```terminal
$ go run server/main.go
---
... Listening on 127.0.0.1:8080
```

In a separate terminal, run the client and you'll see a successful `PutPet` operation:

```terminal
$ go run client/main.go
---
... Connected to 127.0.0.1:8080
... Successfully PutPet
```

You'll also notice this in the server logs (in the other terminal running the server):

```terminal
$ go run server/main.go
---
... Listening on 127.0.0.1:8080
... Got a request to create a PET_TYPE_SNAKE named Ekans
```

Everything works just as before, but you no longer have _any_ locally generated code:

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

## 16.4 Synthetic versions

Now that your Go code depends on a remote-generated library, it's important to be aware of how it's
versioned. The challenge with versioning Remote Generation is that the generated code is the product
of two inputs:

* The Protobuf module
* The [template](/bsr/remote-generation/overview.md#hosted-templates) version

The lowest common denominator of the language registry ecosystems we surveyed is "semantic
versioning without builds or pre-releases", so versions of the form `v1.2.3`.

To ensure that the BSR can create consistent, lossless synthetic versions, Buf simplifies the
versioning schemes of both inputs. Both the Protobuf module version and the template version are
represented as **monotonically increasing integers**.

  - For hosted templates, the BSR enforces a version of the form `v1`, `v2`, `vN...`.
  - For Protobuf modules, BSR uses the **commit sequence ID**, an integer that uniquely identifies a
    commit. It's calculated by counting the number of commits since the first commit of a module
    (the first commit has a sequence ID of `1`, the second commit has a sequence ID of `2`, and so
    on).

With these simplified versioning schemes, the BSR creates a synthetic version that takes this form:

import Syntax from "@site/src/components/Syntax";

<Syntax
  title="Synthetic version syntax"
  examples={["v1.3.5"]}
  segments={[
    {label: "v1", kind: "static"},
    {separator: "."},
    {label: "template version", kind: "variable"},
    {separator: "."},
    {label: "commit sequence ID", kind: "variable"},
  ]
} />

In the example above, the version `v1.3.5` represents the **3**rd version of a hosted template and the
**5**th commit of a Protobuf module. In the example `go.mod` below, the `petapis` module uses
the **4**th version of the Protobuf module and the **4**th version of the template:

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

When you update your module and push new commits, you can update your library version by
incrementing the final element in the synthetic version (described above).

To demonstrate, make a small change by adding a comment to the `PetStoreService`:

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

Push those changes:

```terminal
$ buf push
---
8535a2784a3a48f6b72f2cb80eb49ac7
```

Now edit your `go.mod` to use the latest version (the 5th commit):

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

If you run the command below, you'll notice that your `go.sum` is updated with
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
