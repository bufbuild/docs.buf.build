---
id: workspaces
title: Workspaces
---

A workspace is a collection of one or more local modules that coexist and interoperate within a
common directory. Workspaces make it possible for local [modules](../bsr/overview.md#modules) to import
Protobuf files from other local modules, and unlock other powerful use cases that operate on multiple
modules at the same time.

## Background

As you develop `buf` modules, you might find yourself in a situation where you own multiple modules
that depend on each other. When you want to make a change to one of your modules, you normally need
to push the update up to the [BSR](../bsr/overview.md) so that the other module can update its dependency
and use it locally, potentially using an `alpha` branch to do so. This workflow incurs a frustrating
feedback loop, and invites more opportunities for simple mistakes in each pushed module commit.

If you're familiar with `protoc`, a workspace is similar to specifying multiple include `-I` paths.
For example, if the Pet team manually vendored the `acme/payment/v2/payment.proto` file from the Payment
team's API, you might have had something like this:

```sh
$ protoc \
    -I petapis \
    -I paymentapis \
    -o /dev/null \
    $(find proto -name '*.proto')
```

In `v1beta1`, `buf` solved this problem with [`build.roots`](../configuration/v1beta1/buf-yaml.md#roots):

```yaml title="buf.yaml"
version: v1beta1
name: buf.build/acme/petapis
build:
  roots:
    - paymentapis
    - petapis
```

Unfortunately, `build.roots` encourage users to explicitly vendor their dependencies and include them alongside
their primary module files, which makes it impossible to compile multiple modules together that make the same
mistake. For example, if another team explicitly vendored `acme/payment/v2/payment.proto`, the two modules could not
interoperate because the same filename would be included twice.

Now that `build.roots` are deprecated and removed in `v1`, users are encouraged to specify their dependencies as
[`deps`](../configuration/v1/buf-yaml.md#deps):

```yaml title="buf.yaml"
version: v1
name: buf.build/acme/petapis
deps:
  - buf.build/acme/paymentapis
```

However, `deps` require that the dependencies already exist in the BSR, which reduces to the same feedback
cycle problem illustrated above.

The `buf` module workspace was created to solve exactly these problems (and more).

## Configuration

The [`buf.work.yaml`](../configuration/v1/buf-work-yaml.md) file defines a workspace, and is
generally placed at the root of a VCS repository.

The diagram and file below represent a complete example of a `buf.work.yaml` configuration file
along with an example file tree layout containing the `buf.build/acme/petapis` and `buf.build/acme/paymentapis`
modules:

```sh
.
├── buf.work.yaml
├── paymentapis
│   ├── acme
│   │   └── payment
│   │       └── v2
│   │           └── payment.proto
│   └── buf.yaml
└── petapis
    ├── acme
    │   └── pet
    │       └── v1
    │           └── pet.proto
    └── buf.yaml
```

```yaml title="buf.work.yaml"
version: v1
directories:
  - paymentapis
  - petapis
```

The `buf.work.yaml` file currently supports two options:

### `version`

The `version` key is **required**, and defines the current configuration version. The only accepted
value is `v1`.

### `directories`

The `directories` key is **required**, and lists the directories that define modules to be included
in the workspace. The directory paths must be relative to the `buf.work.yaml`, and cannot point to a
location outside of your `buf.work.yaml`. For example, `../external` is invalid.

Each directory is included as an independent module, such that all of the Protobuf files defined within
the `paymentapis` and `petapis` directories are included in the workspace, relative to the respective module
root (that is, `paymentapis/acme/payment/v2/payment.proto` is included in the workspace as `acme/payment/v2/payment.proto`).

## File discovery

If a `buf.work.yaml` file exists in a parent directory (up to the root of the filesystem), the workspace defined
in the `buf.work.yaml` file is enabled for the given `buf` operation (for example `buf build`).

With this, modules can import from one another, and a variety of commands work on multiple modules rather than
one. For example, if `buf lint` is run for an [input](../reference/inputs.md) that contains a `buf.work.yaml`,
each of the modules contained within the workspace is linted. Other commands, such as `buf build`, merge
workspace modules into one, so that all of the files contained are consolidated into a single [image](../reference/images.md).

## Importing across modules

In a workspace, **imports are resolved relative to each module's root**, or the placement of the `buf.yaml` (similar to
include `-I` paths for `protoc`). For the example layout shown above, the `petapis/acme/pet/v1/pet.proto` file would import
the `paymentapis/acme/payment/v2/payment.proto` file with this:

```protobuf title="petapis/acme/pet/v1/pet.proto"
import "acme/payment/v2/payment.proto";

message PurchasePetRequest {
  string pet_id = 1;
  acme.payment.v2.Order order = 2;
}
```

Also note that you do **not** need to add the `buf.build/acme/paymentapis` module to your `deps` to use it within a workspace;
the `buf.work.yaml` should suffice. Adding the module to your `deps` is only relevant when you're ready to push your modules to
the BSR, which is described [here](#pushing-modules).

## Workspace requirements

There are two additional requirements that `buf` imposes on your `.proto` file structure
for compilation to succeed that are not enforced by `protoc`, both of which are very
important for successful modern Protobuf development across a number of languages

**1. Workspace modules must not overlap, that is one workspace module can not be a sub-directory of another workspace module.**

This, for example, is **not** a valid configuration:

```yaml title="buf.work.yaml"
version: v1
# THIS IS INVALID AND RESULTS IN A PRE-COMPILATION ERROR
directories:
  - foo
  - foo/bar
```

This is important to make sure that across all your `.proto` files, imports are consistent
In the above example, for a given file `foo/bar/bar.proto`, it would be valid to import
this file as either `bar/bar.proto` or `bar.proto`. Having inconsistent imports leads
to a number of major issues across the Protobuf plugin ecosystem.

**2. All `.proto` file paths must be unique relative to each workspace module.**

Consider this configuration:

```yaml title="buf.work.yaml"
version: v1
directories:
  - foo
  - bar
```

*Given the above configuration, it's invalid to have these two files:*

  - `foo/baz/baz.proto`
  - `bar/baz/baz.proto`

This results in two files having the path `baz/baz.proto`. Now add this file to the mix:

```protobuf title="bar/baz/bat.proto"
// THIS IS DEMONSTRATING SOMETHING BAD
syntax = "proto3";

package bar.baz;

import "baz/baz.proto";
```

Which file is being imported? Is it `foo/baz/baz.proto`? `bar/baz/baz.proto`? The answer depends
on the order of the `-I` flags given to `protoc`, or (if `buf` didn't error in this scenario
pre-compilation, which `buf` does) the order of the imports given to the internal compiler. If
the authors are being honest, we can't remember if it's the first `-I` or second `-I` that wins -
we have outlawed this in our own builds for a long time.

While the above example is relatively contrived, a common error comes up when you vendor `.proto`
files. For example, [grpc-gateway](https://github.com/grpc-ecosystem/grpc-gateway/tree/master/third_party/googleapis/google)
has it's own copy of the [google.api](https://github.com/googleapis/googleapis/tree/master/google/api) definitions it needs.
While these are usually in sync, the `google.api` schema can change. Imagine that we allowed this:

```yaml
version: v1
# THIS IS INVALID AND RESULTS IN A PRE-COMPILATION ERROR
directories:
  - proto
  - vendor/github.com/googleapis/googleapis
  - vendor/github.com/grpc-ecosystem/grpc-gateway/third_party/googleapis
```

Which copy of `google/api/*.proto` wins? The answer: no one wins. Buf doesn't allow this.

## Multiple module operations

If the input for the command is a directory containing a `buf.work.yaml` file, the command acts upon all
of the modules defined in the `buf.work.yaml`.

For example, suppose that we update both the `paymentapis` and `petapis` directories with some `lint` failures,
such as violating `FIELD_LOWER_SNAKE_CASE`. We can easily `lint` all of the modules defined in a `buf.work.yaml`
with a single command:

```sh
$ ls
buf.work.yaml  paymentapis  petapis
$ buf lint
paymentapis/acme/payment/v2/payment.proto:29:10:Field name "recipientID" should be lower_snake_case, such as "recipient_id".
petapis/acme/pet/v1/pet.proto:51:27:Field name "orderV2" should be lower_snake_case, such as "order_v2".
```

The same holds true for the other `buf` operations including `buf {breaking,build,generate,ls-files}`. Give it a try!

> When using `buf breaking` in workspace mode, the target input and the input you're comparing against **must** contain the
> same number of modules. For example, if the target input has a `buf.work.yaml` that specifies two modules, the input you're
> comparing against must also contain a `buf.work.yaml` that specifies two modules. Otherwise, `buf` cannot reliably verify
> compatibility between the workspaces.

## Module cache override

As mentioned above, workspaces make it easier to work on multiple modules simultaneously, such as introducing
a new `message` in one module, and depending on it in another. Normally, the `buf` command relies on the module's
[`buf.lock`](../configuration/v1/buf-lock.md) manifest to determine read its dependencies from the local [module cache](../bsr/overview.md#module-cache).
However, this requires that the latest change has been pushed to the [BSR](../bsr/overview.md) and the user has run `buf mod update`
to update their dependencies and fetch the latest change.

When a `buf.work.yaml` exists, the module cache is only used for dependencies **not defined in the workspace**.
This is an important detail, so we'll describe it in more detail with an example.

Suppose you are working on both the `buf.build/acme/petapis` and `buf.build/acme/paymentapis` modules simultaneously
and want to introduce a new `message` to the `buf.build/acme/paymentapis` module. The structure of the repository is
shown below:

```sh
.
├── paymentapis
│   ├── acme
│   │   └── payment
│   │       └── v2
│   │           └── payment.proto
│   └── buf.yaml
└── petapis
    ├── acme
    │   └── pet
    │       └── v1
    │           └── pet.proto
    └── buf.yaml
```

We want to add the `OrderV2` message to the `paymentapis/acme/payment/v2/payment.proto` file and use it in
`petapis/acme/pet/v1/pet.proto`. The corresponding `git diff` looks like this:

```protobuf title="paymentapis/acme/payment/v2/payment.proto" {8-15}
// Order represents a monetary order.
message Order {
  string order_id = 1;
  string recipient_id = 2;
  google.type.Money amount = 3;
  PaymentProvider payment_provider = 4;
}
+
+// OrderV2 is the new monetary order.
+message OrderV2 {
+  string order_id = 1;
+  string recipient_id = 2;
+  google.type.Money amount = 3;
+  PaymentProvider payment_provider = 4;
+}
```

```protobuf title="petapis/acme/pet/v1/pet.proto" {3-4}
 message PurchasePetRequest {
   string pet_id = 1;
-  acme.payment.v2.Order order = 2;
+  acme.payment.v2.OrderV2 order = 2;
 }

 message PurchasePetResponse {}
```

Now if we try to build the `buf.build/acme/petapis` module, we'll notice this error:

```sh
$ buf build petapis
petapis/acme/pet/v1/pet.proto:51:3:field acme.pet.v1.PurchasePetRequest.order: unknown type acme.payment.v2.OrderV2
```

We can define a `buf.work.yaml` at the root of the directory , so that the `buf.build/acme/petapis` module can use the
latest changes made to the `buf.build/acme/paymentapis` module like so:

```sh
.
├── buf.work.yaml
├── paymentapis
│   ├── acme
│   │   └── payment
│   │       └── v2
│   │           └── payment.proto
│   └── buf.yaml
└── petapis
    ├── acme
    │   └── pet
    │       └── v1
    │           └── pet.proto
    └── buf.yaml
```

```yaml title="buf.work.yaml"
version: v1
directories:
  - paymentapis
  - petapis
```

If we try to build the `petapis` module again, you'll notice that it succeeds:

```sh
$ buf build petapis
```

> This is possible because `buf` recognizes that the `buf.build/acme/paymentapis` dependency listed in the
> `buf.build/acme/petapis` module is defined in the local workspace via the `paymentapis/buf.yaml` file. If the
> `paymentapis/buf.yaml` file did **not** configure the `buf.build/acme/paymentapis` `name`, then the module cache
> would be used instead of the local copy. In other words, the workspace takes precedence over the module cache,
> but only when the workspace provides named modules.

## Pushing modules

It's important to note that **workspaces only apply to local operations**. When you are ready to push updates you've made
in a local workspace, you'll need to push each module independently, starting with the upstream modules first. Once the
upstream module's changes are published, you can run the `buf mod update` command in the downstream module to fetch the
latest version, and continue to push each of your modules until all of your local changes are published to the BSR.
