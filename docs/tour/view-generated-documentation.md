---
id: view-generated-documentation
title: 8 View generated documentation
---

You can browse generated documentation for your [module](../bsr/overview.md#modules) in the
[BSR](../bsr/overview.md).

Navigate to the `/docs` page for the module you just created in your browser. If your
`$BUF_USER` variable is set to `acme` and you created the `buf.build/acme/petapis`
module, you can visit the [https://buf.build/acme/petapis/docs](https://buf.build/acme/petapis/docs)
page (replace `acme` with your `$BUF_USER` in this link).

## 8.1 Add a `buf.md` {#add-a-bufmd}

The page you see above serves as the primary entrypoint for your module's documentation. But
as you can see from the default `buf.md` content, we currently don't have any module-level
documentation.

You can update the module-level documentation page by creating a `buf.md` in the same directory
as your module's [`buf.yaml`](../configuration/v1/buf-yaml.md), and pushing it up to the BSR.
In this way, the `buf.md` file is analogous to a GitHub repository's `README.md`. The `buf.md` file
currently supports all of the [CommonMark](https://commonmark.org) syntax.

Let's start by adding a quick note:

```terminal
$ touch buf.md
```

```markdown title="buf.md"
## PetAPIs

This module contains all of the APIs required to interact with the `PetStoreService`.
```

Your `petapis` directory should now look like this:

```sh
petapis/
├── buf.md
├── buf.yaml
├── google
│   └── type
│       └── datetime.proto
└── pet
    └── v1
        └── pet.proto
```

Now if you push your module again, you'll notice a new commit and that the documentation has been
updated to reflect the latest changes:

```terminal
$ buf push
---
4514ddced0584e73a100e82096c7958c
```

If you refresh the documentation page you visited above, you should see the changes you just
introduced with your `buf.md` documentation.

## 8.2 Package documentation {#package-documentation}

As you can see from the module documentation page, both the `pet.v1` and `google.type`
packages are available as links. Click on the `pet.v1` link to navigate to its
package documentation at [https://buf.build/acme/petapis/docs/4514ddced0584e73a100e82096c7958c/pet.v1](https://buf.build/acme/petapis/docs/4514ddced0584e73a100e82096c7958c/pet.v1).

From here, you can click through each of the Protobuf type definitions and see all of
the comments associated with each type. In fact, if you click on the `google.type.DateTime`
message referenced in the `Pet` message, you'll be brought to the `google.type.v1` package
documentation for the same commit.

For an example of API documentation, check out [googleapis](https://buf.build/googleapis/googleapis/docs).
