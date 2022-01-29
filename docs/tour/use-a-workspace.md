---
id: use-a-workspace
title: 12 Use a Workspace
---

We just learned how we can use `buf generate` with a [module](../bsr/overview.md#module)
pushed to the [BSR](../bsr/overview.md) to implement a gRPC client and server in Go.
This is a great start, but product requirements always evolve and new
features need to be built over time.

In this section, we'll see how to incorporate another dependency into
our `PetStoreService` API, and use a [workspace](../reference/workspaces.md) to make
our lives easier.

## 12.1 Create `paymentapis` {#create-paymentapis}

The next feature we build will enable people to purchase pets by calling a
`PurchasePet` endpoint. This endpoint requires some information about
payment systems, so we should create another module for it so that it
can be shared by other APIs later on. This logical separation is common
for monetary orders and payment providers. This logical separation is common
in larger organizations, for example the payments team in the `acme` organization
owns the `buf.build/acme/paymentapis` module.

We don't want the `.proto` files specific to `paymentapis` to coexist within
`petapis`, so we'll make another directory for it and initialize a module
there:

```terminal
$ mkdir paymentapis
$ cd paymentapis
$ buf config init
```

With this, you should have the following:

```yaml title="paymentapis/buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

You can also `name` the module like so:

```yaml title="paymentapis/buf.yaml" {2}
 version: v1
+name: buf.build/$BUF_USER/paymentapis
 lint:
   use:
     - DEFAULT
 breaking:
   use:
     - FILE
```

Now that the module is all set up, we can add an API with the following:

```terminal
$ mkdir -p payment/v1alpha1
$ touch payment/v1alpha1/payment.proto
```

```protobuf title="paymentapis/payment/v1alpha1/payment.proto"
syntax = "proto3";

package payment.v1alpha1;

option go_package = "github.com/bufbuild/buf-tour/petstore/gen/proto/go/payment/v1alpha1;paymentv1alpha1";

import "google/type/money.proto";

// PaymentProvider represents the supported set
// of payment providers.
enum PaymentProvider {
  PAYMENT_PROVIDER_UNSPECIFIED = 0;
  PAYMENT_PROVIDER_STRIPE = 1;
  PAYMENT_PROVIDER_PAYPAL = 2;
  PAYMENT_PROVIDER_APPLE = 3;
}

// Order represents a monetary order.
message Order {
  string order_id = 1;
  string recipient_id = 2;
  google.type.Money amount = 3;
  PaymentProvider payment_provider = 4;
}
```

## 12.2 Build the Module {#build-the-module}

If you try to build the `paymentapis` module in its current state, you'll notice the following:

```terminal
$ buf build
payment/v1alpha1/payment.proto:7:8:google/type/money.proto: does not exist
```

We know how to fix this though - we can simply add the `buf.build/googleapis/googleapis` dependency
and resolve it like before:

```yaml title="paymentapis/buf.yaml" {3-4}
 version: v1
 name: buf.build/$BUF_USER/paymentapis
+deps:
+  - buf.build/googleapis/googleapis
 lint:
   use:
     - DEFAULT
 breaking:
   use:
     - FILE
```

```terminal
$ buf mod update
$ buf build
```

The `paymentapis` module is ready to be used, but we're not quite sure if the API is stable.
Given that these APIs are meant to be used by other services, we need to test it in other
applications to make sure it's the API we should to commit to. In general, such APIs should
include an unstable [`PACKAGE_VERSION_SUFFIX`](../lint/rules.md#package_version_suffix), such
as the `v1alpha1` version used above, to convey that these packages are still in-development and
can have breaking changes.

However, we can also use a workspace so that we can iterate on multiple modules locally without pushing
anything to the BSR. Then, only after we've verified that the API is what we want to move forward with,
we can push the version to the BSR so that it can be used by others.

In summary, workspaces prevent us from pushing up a new version of our module to the BSR every time we want
to test the changes in another - we can do it all locally first.

## 12.3 Define a Workspace {#define-a-workspace}

A workspace is defined with the [`buf.work.yaml`](../configuration/v1/buf-work-yaml.md) file, which is generally
placed at the root of a VCS repository. Given that we're working from within the root of the `start` directory,
the `buf.work.yaml` should exist there. The configuration is simple: all you need to do is specify the paths to
the modules you want to include in the workspace. For `paymentapis` and `petapis`, this looks like the following:

```terminal
$ cd ..
$ touch buf.work.yaml
```

```yaml title="buf.work.yaml"
version: v1
directories:
  - paymentapis
  - petapis
```

```terminal
start/
├── buf.gen.yaml
├── buf.work.yaml
├── client
│   └── main.go
├── gen
│   └── proto
│       └── go
│           └── pet
│               └── v1
│                   ├── pet.pb.go
│                   └── pet_grpc.pb.go
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

## 12.4 Use `paymentapis` in `petapis` {#use-paymentapis-in-petapis}

With the workspace initialized, we can freely import `.proto` files between the `petapis`
and `paymentapis` modules.

Adapt the `PetStoreService` with the `PurhcasePet` endpoint like so:

```protobuf title="petapis/pet/v1/pet.proto" {7,12-18,23}
 syntax = "proto3";

 package pet.v1;

 option go_package = "github.com/bufbuild/buf-tour/petstore/gen/proto/go/pet/v1;petv1";

 +import "payment/v1alpha1/payment.proto";
 import "google/type/datetime.proto";

 ...

+message PurchasePetRequest {
+  string pet_id = 1;
+  payment.v1alpha1.Order order = 2;
+}
+
+message PurchasePetResponse {}
+
 service PetStore {
   rpc GetPet(GetPetRequest) returns (GetPetResponse) {}
   rpc PutPet(PutPetRequest) returns (PutPetResponse) {}
   rpc DeletePet(DeletePetRequest) returns (DeletePetResponse) {}
+  rpc PurchasePet(PurchasePetRequest) returns (PurchasePetResponse) {}
 }
```

Verify that the `petapis` module builds with the latest import:

```terminal
$ buf build petapis
```

We can illustrate how the `buf.work.yaml` is taking action by temporarily
removing the `paymentapis` module from the workspace and observing
the result:

```yaml title="buf.work.yaml" {3}
 version: v1
 directories:
-  - paymentapis
   - petapis
```

```terminal
$ buf build petapis
petapis/pet/v1/pet.proto:7:8:payment/v1alpha1/payment.proto: does not exist
```

Behind the scenes, `buf` recognizes that there is a `buf.work.yaml` in one of the
target input's parent directories (which so happens to be the current directory),
and creates a workspace that contains all of the files contained in each of the
modules. So when we include the `paymentapis` directory in the `buf.work.yaml` the local
copy of the `payment/v1alpha1/payment.proto` is available to all of the files contained
in the `petapis` module.

Before we continue, restore the `buf.work.yaml` to its previous state:

```yaml title="buf.work.yaml" {3}
 version: v1
 directories:
+  - paymentapis
   - petapis
```

## 12.5 Multiple Module Operations {#multiple-module-operations}

If the input for a `buf` command is a directory containing a `buf.work.yaml` file, the command will act
upon all of the modules defined in the `buf.work.yaml`.

For example, suppose that we update both the `paymentapis` and `petapis` directories with some `lint`
failures, such as violating `FIELD_LOWER_SNAKE_CASE`. We can easily `lint` all of the modules defined
in the `buf.work.yaml` with a single command:

```protobuf title="paymentapis/payment/v1/payment.proto" {2-3}
 message Order {
-  string order_id = 1;
+  string orderID = 1;
   string recipient_id = 2;
   google.type.Money amount = 3;
   PaymentProvider payment_provider = 4;
 }
```

```protobuf title="petapis/pet/v1/pet.proto" {2-3}
 message GetPetRequest {
-  string pet_id = 1;
+  string petID = 1;
 }
```

```terminal
$ buf lint
paymentapis/payment/v1alpha1/payment.proto:20:10:Field name "orderID" should be lower_snake_case, such as "order_id".
petapis/pet/v1/pet.proto:28:10:Field name "petID" should be lower_snake_case, such as "pet_id".
```

The same holds true for the other `buf` operations including `buf {breaking,build,generate,ls-files}`.

Again, before we continue, make sure to restore the `.proto` files to their previous state:

```protobuf title="paymentapis/payment/v1/payment.proto" {2-3}
 message Order {
-  string orderID = 1;
+  string order_id = 1;
   string recipient_id = 2;
   google.type.Money amount = 3;
   PaymentProvider payment_provider = 4;
 }
```

```protobuf title="petapis/pet/v1/pet.proto" {2-3}
 message GetPetRequest {
-  string petID = 1;
+  string pet_id = 1;
 }
```
