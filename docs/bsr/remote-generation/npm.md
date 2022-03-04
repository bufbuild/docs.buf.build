---
id: npm
title: The BSR npm registry
---

> Remote code generation is an **alpha feature**. We started with [Go](../../tour/use-remote-generation.md) and have since added support for generated JavaScript and TypeScript code stubs. We intend to add support for other languages as well. [Let us know](/contact.md) which language we should tackle next.

Now that the BSR supports **remote code generation**, you no longer have to maintain Protobuf files, `protoc`-based plugins or generate code locally. This is especially useful for API clients, who just want a JS SDK to start consuming an API immediately.

First offering: Go module proxy
Why it was tricky: the npm registry needs to rewrite imports from local file paths to absolute paths

You no longer have to maintain Protobuf files, runtime library dependencies, and protoc-based plugins. And most importantly, you no longer need to generate code locally.

Implements the npm's [public registry API][registry]
It generates packages on the fly when you `npm install`.

## Package names

import Syntax from "@site/src/components/Syntax";

<Syntax
  title="Name syntax for BSR npm registry packages"
  examples={["@buf/grpc_web_googleapis_googleapis"]}
  segments={[
    {label: "@buf", kind: "static"},
    {separator: "/"},
    {label: "template owner", kind: "variable"},
    {separator: "_"},
    {label: "template name", kind: "variable"},
    {separator: "_"},
    {label: "module owner", kind: "variable"},
    {separator: "_"},
    {label: "module name", kind: "variable"},
  ]
} />

This package was created from the [`googleapis/googleapis`](https://buf.build/googleapis/googleapis)
module using the [`grpc/web` template](https://buf.build/grpc/templates/web).

## Installing packages {#install}

npm is configured to use the public npm registry at https://registry.npmjs.org by default. To configure npm to use Buf's npm registry at https://npm.buf.build, use the [`npm config set`][config_set] command:

```terminal
$ npm config set @buf:registry https://npm.buf.build
```

This binds the scope `@buf` to the Buf registry and updates your global [`.npmrc`][npmrc]. With this set, you can install `@buf/*` packages in any npm project with a `package.json` configuration.

```terminal
$ npm install @buf/grpc_web_googleapis_googleapis
```

### Time to install

You may notice that installing packages from the BSR npm registry using `npm install` typically takes longer than installing from the default public npm registry at https://registry.npmjs.org. That's the case because packages are generated "on the fly," that is, packages aren't pre-built

We provide more details around this [below](#how)

### Other package managers

Because the Buf npm registry implements npm's [public registry API][registry], you should be able to use it with package management tools outside of npm, such as [Yarn] and [pnpm], though with [some known limitations](#yarn).

## Generating private packages {#generate}

To generate npm packages from private Buf [modules], you need to configure npm to send an authentication token with each request to the BSR npm registry. Add a line with this syntax to your [`.npmrc`][npmrc] file:

<Syntax
  title="npmrc token syntax"
  examples={["//npm.buf.build/a75c6ca7a..."]}
  segments={[
    {separator: "//"},
    {label: "npm.buf.build", kind: "static"},
    {separator: "/"},
    {label: "token", kind: "variable"},
  ]}
/>

You can use an existing auth token or generate a new one. To create a new one, log into the [BSR], navigate to your [user settings][settings] page, and click **Create Token**.

## Restrictions

### Runtime dependencies

You can use [labels] to declare runtime dependencies for plugins. The BSR npm registry currently supports [semantic versioning][semver] for versions but _not_ semver [ranges] like `>=1.2.7` or `<1.3.0`.

### Yarn compatibility {#yarn}

[Yarn] versions greater than [v1.10.0][yarn_v1] and less than [v2.0.0] are _not_ supported. These versions of Yarn require the `shasum` field in the dist object to be set, but the BSR can't compute a digest without generating the code for all possible versions of the package.

### Import rewrites

The BSR rewrites import statements and `require()` calls in `.js` and `.d.ts` files. It matches generated files with their `.proto` sources based on their path. Generate files _must_ use the same path as the `.proto` counterpart, although suffixes like `_pb` and additional file extensions are allowed.

### Correctness

All generated code must be syntactically correct.

## How the npm registry works {#how}

When you request a package for a Buf [module][modules] using `npm install` or an analogous method, the BSR npm registry runs the Protobuf [plugins] specified in the module's [template].

> TODO: diagram

If the requested module has [dependencies][deps], the npm registry rewrites the relative import paths so that they point to the package with a full package name. Here's an example:

```javascript
// generated import
require("../../google/storage/v1/storage_pb.js");

// replacement
require("@buf/grpc_web_googleapis_googleapis/google/storage/v1/storage_pb.js");
```

Why it was tricky: the npm registry needs to rewrite imports from local file paths to absolute paths

Implements the npm's [public registry API][registry]
It generates packages on the fly when you `npm install`.

[bsr]: /bsr/overview
[config_set]: https://docs.npmjs.com/cli/v8/commands/npm-config#set
[deps]: /bsr/overview#dependencies
[labels]: /bsr/remote-generation/plugin-example#3-prepare-the-dockerfile
[modules]: /bsr/overview#modules
[npmrc]: https://docs.npmjs.com/cli/v8/configuring-npm/npmrc
[plugins]: /bsr/remote-generation/concepts#plugins
[pnpm]: https://pnpm.io
[ranges]: https://docs.npmjs.com/cli/v6/using-npm/semver#ranges
[registry]: https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md
[semver]: https://semver.org
[settings]: https://buf.build/settings/user
[template]: /bsr/remote-generation/concepts#templates
[yarn]: https://yarnkpkg.com
[yarn_v1]: https://github.com/yarnpkg/yarn/releases/tag/v1.10.0
[yarn_v2]: https://github.com/yarnpkg/yarn/releases/tag/v2.0.0
