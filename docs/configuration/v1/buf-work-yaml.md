---
id: buf-work-yaml
title: buf.work.yaml
---

The `buf.work.yaml` file is used to define a [workspace](../../reference/workspaces.md), where one or more modules can coexist
and interoperate within a common directory. Workspaces make it possible for local [modules](../../bsr/overview.md#module)
to import Protobuf files from other local modules, and unlock other powerful use cases that
operate on multiple modules at the same time.

The diagram and file below represent a complete example of a `buf.work.yaml` configuration file with
its accompanying tree layout containing the `buf.build/acme/petapis` and `buf.build/acme/paymentapis`
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

The `directories` key is **required**, and lists the directories that define modules
to be included in the workspace. The directory paths must be relative to the `buf.work.yaml`,
and cannot point to a location outside of your `buf.work.yaml`. For example, `../external` is invalid.
