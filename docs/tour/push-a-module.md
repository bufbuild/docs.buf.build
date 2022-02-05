---
id: push-a-module
title: 7 Push a Module
---

Now that you've authenticated with the [BSR](../bsr/overview.md), you can create a
repository and push a [module](../bsr/overview.md#module) that defines the
`PetStoreService` API.

## 7.1 Terminology {#terminology}

Before we continue, it's important that we cover some basic terminology.

### 7.1.1 Modules {#modules}

**Modules** are the core primitive of Buf and the BSR. A module is a collection of Protobuf
files that are configured, built, and versioned as a logical unit. You created a module when
you initialized a [`buf.yaml`](../configuration/v1/buf-yaml.md) at the beginning of the tour.

### 7.1.2 Repositories {#repositories}

A module is stored in a **repository**. A repository stores all versions of a module, where each
version is identified by a commit and (optionally) a tag.

While roughly analogous to Git repositories, a BSR repository is only a remote location - there is
no concept of a repository "clone". In other words, repositories do not exist in multiple locations.

### 7.1.3 Module Names {#module-names}

A module has a `name` and three other components:

  - **Remote**: The DNS name for the server hosting the BSR, such as `buf.build`.
  - **Owner**: The user or organization that owns the repository.
  - **Repository**: The repository's name.

Some example module names broken down into components:

Name | Remote | Owner | Repository
:----|:-------|:------|:----------
`buf.build/alice/tools` | `buf.build` | `alice` | `tools`
`buf.build/acme/weather` | `buf.build` | `acme` | `weather`
`my-private-bsr.io/omnicorp/biz` | `my-private-bsr.io` | `omnicorp` | `biz`

## 7.2 Create a Repository {#create-a-repository}

Create a new `petapis` repository for your module with the following command:

```terminal
$ buf beta registry repository create buf.build/$BUF_USER/petapis --visibility public
---
Full name                    Created
buf.build/$BUF_USER/petapis  ...
```

## 7.3 Configure a `name` {#configure-a-name}

Move back into the `petapis` directory:

```terminal
$ cd petapis
```

Update your `buf.yaml` so that its `name` matches the repository you just created:

```yaml title="buf.yaml" {2}
 version: v1
+name: buf.build/$BUF_USER/petapis
 lint:
   use:
     - DEFAULT
 breaking:
   use:
     - FILE
```

## 7.4 Push the Module {#push-the-module}

Push the module to the `buf.build/$BUF_USER/petapis` repository with the following command (in the
`petapis` directory containing your `buf.yaml`):

```terminal
$ buf push
---
19bcefa1a736428d9e64d21c9191b213
```

Behind the scenes, `buf` recognizes the `name` in your `buf.yaml` and pushes the module to the `buf.build/$BUF_USER/petapis`
repository. If successful, the generated commit identifies this current version of your module.

> The commit you see differs from the one shown here.
