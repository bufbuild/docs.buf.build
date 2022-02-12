---
id: implement-grpc-endpoints
title: 11 Implement gRPC Endpoints
---

In this section, you'll implement a `PetStoreService` client and server, both of which you can run
on the command line.

## 11.1 Initialize a `go.mod` {#initialize-a-gomod}

Before you write Go code, initialize a `go.mod` file with the `go mod init` command:

```terminal
$ go mod init github.com/bufbuild/buf-tour/petstore
```

Similar to the [`buf.yaml`](/configuration/v1/buf-yaml) config file, the `go.mod` file tracks your
code's Go dependencies.

## 11.2 Implement the Server {#implement-the-server}

You can start implementing a server by creating a `server/main.go` file:

```terminal
$ mkdir server
$ touch server/main.go
```

Copy and paste this content into that file:

```go title="server/main.go"
package main

import (
	"context"
	"fmt"
	"log"
	"net"

	// This import path is based on the name declaration in the go.mod,
	// and the gen/proto/go output location in the buf.gen.yaml.
	petv1 "github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1"
	"google.golang.org/grpc"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	listenOn := "127.0.0.1:8080"
	listener, err := net.Listen("tcp", listenOn)
	if err != nil {
		return fmt.Errorf("failed to listen on %s: %w", listenOn, err)
	}

	server := grpc.NewServer()
	petv1.RegisterPetStoreServiceServer(server, &petStoreServiceServer{})
	log.Println("Listening on", listenOn)
	if err := server.Serve(listener); err != nil {
		return fmt.Errorf("failed to serve gRPC server: %w", err)
	}

	return nil
}

// petStoreServiceServer implements the PetStoreService API.
type petStoreServiceServer struct {
	petv1.UnimplementedPetStoreServiceServer
}

// PutPet adds the pet associated with the given request into the PetStore.
func (s *petStoreServiceServer) PutPet(ctx context.Context, req *petv1.PutPetRequest) (*petv1.PutPetResponse, error) {
	name := req.GetName()
	petType := req.GetPetType()
	log.Println("Got a request to create a", petType, "named", name)

	return &petv1.PutPetResponse{}, nil
}
```

## 11.3 Implement the Client {#implement-the-client}

You can start implementing a client by creating a `client/main.go` file:

```terminal
$ mkdir client
$ touch client/main.go
```

Copy and paste this content into that file:

```go title="client/main.go"
package main

import (
	"context"
	"fmt"
	"log"

	// This import path is based on the name declaration in the go.mod,
	// and the gen/proto/go output location in the buf.gen.yaml.
	petv1 "github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1"
	"google.golang.org/grpc"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}
func run() error {
	connectTo := "127.0.0.1:8080"
	conn, err := grpc.Dial(connectTo, grpc.WithBlock(), grpc.WithInsecure())
	if err != nil {
		return fmt.Errorf("failed to connect to PetStoreService on %s: %w", connectTo, err)
	}
	log.Println("Connected to", connectTo)

	petStore := petv1.NewPetStoreServiceClient(conn)
	if _, err := petStore.PutPet(context.Background(), &petv1.PutPetRequest{
		PetType: petv1.PetType_PET_TYPE_SNAKE,
		Name:    "Ekans",
	}); err != nil {
		return fmt.Errorf("failed to PutPet: %w", err)
	}

	log.Println("Successfully PutPet")
	return nil
}
```

## 11.4 Resolve Go Dependencies {#resolve-go-dependencies}

Now that you have code for both a client and a server, run this command to resolve
some of the dependencies you need for the generated code:

```terminal
$ go mod tidy
```

You should notice these changes (the version pins may differ):

```sh title="go.mod" {4-9}
 module github.com/bufbuild/buf-tour/petstore

 go 1.16
+
+require (
+	google.golang.org/genproto v0.0.0-20210811021853-ddbe55d93216
+	google.golang.org/grpc v1.40.0
+	google.golang.org/protobuf v1.27.1
+)
```

## 11.5 Call `PutPet` {#call-putpet}

With the `server/main.go` and `client/main.go` implementations shown above, run the server and
call the `PutPet` endpoint from the client.

First, run the server:

```terminal
$ go run server/main.go
---
... Listening on 127.0.0.1:8080
```

In a separate terminal, run the client and you should see a success message:

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
