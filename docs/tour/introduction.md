---
id: introduction
title: Introduction
---

The tour introduces you to the `buf` CLI and the Buf Schema Registry ([BSR](../bsr/introduction.md)). Along the way, you
will enforce lint standards, detect breaking changes, generate code, create a [module](../bsr/overview.md#modules), manage a
non-trivial dependency graph, and publish the module to the BSR so that it can be consumed by others. The tour takes
approximately 20 minutes to complete.

At any time, you can see the help for a command using `--help`:

```sh
$ buf --help
$ buf build --help
$ buf generate --help
$ buf breaking --help
$ buf lint --help
$ buf mod ls-breaking-rules --help
$ buf mod ls-lint-rules --help
$ buf ls-files --help
```

## Prerequisites {#prerequisites}

 * Install [`git`](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
 * Install [`jq`](https://stedolan.github.io/jq)
 * Install [`buf`](../installation.md)
 * (Optional) [Editor Integration](../editor-integration.md)

## Clone the Git repository {#clone-the-git-repository}

First, clone the Git repository that contains the starter code for the `PetStore` service.
From the development directory of your choice, run this command:

```terminal
$ git clone https://github.com/bufbuild/buf-tour
```

You'll notice that the repository contains a `start` directory and a `finish` directory. During the tour
you'll work on files in the `start` directory, and at the end they should match the files in the `finish` directory.

```sh
buf-tour/
├── finish
│   ├── buf.gen.yaml
│   ├── buf.work.yaml
│   ├── client
│   │   └── main.go
│   ├── gen
│   │   └── proto
│   │       └── go
│   │           ├── payment
│   │           │   └── v1alpha1
│   │           │       └── payment.pb.go
│   │           └── pet
│   │               └── v1
│   │                   ├── pet.pb.go
│   │                   └── pet_grpc.pb.go
│   ├── go.mod
│   ├── go.sum
│   ├── paymentapis
│   │   ├── buf.lock
│   │   ├── buf.yaml
│   │   └── payment
│   │       └── v1alpha1
│   │           └── payment.proto
│   ├── petapis
│   │   ├── buf.lock
│   │   ├── buf.md
│   │   ├── buf.yaml
│   │   └── pet
│   │       └── v1
│   │           └── pet.proto
│   └── server
│       └── main.go
└── start
    └── petapis
        ├── google
        │   └── type
        │       └── datetime.proto
        └── pet
            └── v1
                └── pet.proto
```

To begin, move into the `start` directory and continue to the next step:

```terminal
$ cd buf-tour/start
```
