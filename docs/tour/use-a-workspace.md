---
id: use-a-workspace
title: 12 Use a Workspace
---

In the last section, you used `buf generate` with a [module](../bsr/overview.md#modules) you
pushed to the [BSR](../bsr/overview.md) to implement a gRPC client and server in Go.
That's a great start, but product requirements always evolve and new features need to be built over
time.

In this section, you'll incorporate another dependency into your `PetStoreService` API
and use a [workspace](../reference/workspaces.md) to make better organize your Protobuf
definitions.

## 12.1 Create `paymentapis` {#create-paymentapis}

The next feature you'll build will enable people to purchase pets by calling a `PurchasePet`
endpoint. This endpoint requires some information about payment systems, so you'll create a separate
module for it that can be shared by other APIs. This is the kind of logical separate you often
find in larger organizations, where one team would own a `paymentapis` module while another would
own `petapis`.

You can enact a separation like this by creating a separate directory and initializing a Buf module
there:

```terminal
$ mkdir paymentapis
$ cd paymentapis
$ buf config init
```

That creates this config file:

```yaml title="paymentapis/buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

You can also provide a `name` for the module:

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

Now that the module is all set up, add an API:

```terminal
$ mkdir -p payment/v1alpha1
$ touch payment/v1alpha1/payment.proto
```

Copy and paste this content into that file:

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

If you try to build the `paymentapis` module in its current state, you'll get an error:

```terminal
$ buf build
---
payment/v1alpha1/payment.proto:7:8:google/type/money.proto: does not exist
```

To fix this, add the `buf.build/googleapis/googleapis` dependency and resolve it like before:

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

Now update your dependencies and try building again:

```terminal
$ buf mod update
$ buf build
```

The `paymentapis` module is ready to be used, but it's not yet clear if the API is stable.
Given that these APIs are meant to be used by other services, you need to test it in other
applications to make sure it's the API you should to commit to. In general, such APIs should
include an unstable [`PACKAGE_VERSION_SUFFIX`](../lint/rules.md#package_version_suffix), such
as the `v1alpha1` version used above, to convey that these packages are still in-development and
can have breaking changes.

However, you can also use a **workspace** so that you can iterate on multiple modules locally
without pushing anything to the BSR. Then, only after you've verified that the API is what you want
to move forward with, you can push the version to the BSR so that it can be used by others.

In summary, workspaces prevent you from pushing up a new version of your module to the BSR every
time you want to test the changes in another. Instead, you can do it all locally first.

## 12.3 Define a Workspace {#define-a-workspace}

A workspace is defined with a [`buf.work.yaml`](../configuration/v1/buf-work-yaml.md) file, which is
generally placed at the root of a version-controlled repository. Given that you're working from
within the root of the `start` directory, the `buf.work.yaml` should be placed there. For the
configuration, you only need to specify the paths of the modules you want to include in the
workspace. Here's what the config looks like for the `paymentapis` and `petapis` modules:

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

Your directory structure should now look like this:

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

With the workspace initialized, you can freely import `.proto` files between the `petapis`
and `paymentapis` modules.

Adapt the `PetStoreService` with the `PurhcasePet` endpoint like this:

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
failures, such as violating `FIELD_LOWER_SNAKE_CASE`. You can`lint` all of the modules defined
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
