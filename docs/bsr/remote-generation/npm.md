---
id: npm
title: BSR npm registry
---

> The BSR npm registry is currently an **alpha** feature. Although you're free to experiment with it, be aware that we're likely to make breaking changes that may affect your workflows.

The [Buf Schema Registry][bsr] (BSR) offers an [npm] registry that you can use to consume JavaScript and TypeScript packages generated from [Buf modules][modules]. It uses the BSR's [remote code generation](overview.md) feature to generate those packages upon request. With the BSR npm registry, you no longer need to maintain Protobuf files or runtime dependencies like [protoc] plugins—in fact, JavaScript and TypeScript developers can avoid local code generation altogether for any Buf modules that have been pushed to the BSR.

## Setup

npm is configured to use the public npm registry at [registry.npmjs.org][npm-registry] by default. To configure npm to use Buf's npm registry at [npm.buf.build][buf-npm] in addition to the default registry, use this command to [set][npm-config] your npm config:

```terminal
$ npm config set @buf:registry https://npm.buf.build
```

This binds the `@buf` package scope to the BSR and updates your global [`.npmrc`][npmrc] accordingly.

## Installing packages {#install}

With your npm config set, you can install `@buf/*` packages in any standard npm project.[^1] Here's an example installation command:

```terminal
$ npm install @buf/protocolbuffers_js_acme_paymentapis
```

:::info Slow installation?
You may notice that installing packages from the BSR npm registry using `npm install` can take longer than installing from the standard npm registry. This happens because packages are generated "on the fly"—that is, they're built upon request and then cached. The first `npm install` typically takes longer than subsequent requests.
:::

## Package names

The BSR npm registry has a special syntax for package names that you need to adhere to when installing packages:

import Syntax from "@site/src/components/Syntax";

<Syntax
  title="Syntax for BSR npm registry package names"
  examples={["@buf/protocolbuffers_js_acme_petapis"]}
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

In this example, the BSR npm registry generates the `@buf/protocolbuffers_js_acme_petapis` package applying the [`protocolbuffers/js`](https://buf.build/protocolbuffers/templates/js) template to the [`acme/petapis`](https://buf.build/acme/petapis) module.

This table shows some example template/module/package name combinations:

Template | Buf module | Package name
:--------|:-----------|:------------
`grpc/web` | `acme/petapis` | `@buf/grpc_web_acme_petapis`
`protocolbuffers/js` | `bufbuild/buf` | `@buf/protocolbuffers_js_bufbuild_buf`
`protocolbuffers/js` | `acme/paymentapis` | `@buf/protocolbuffers_js_acme_paymentapis`

## Using private packages {#private}

To install npm packages generated from private [Buf modules][modules], you need to configure npm to send an authentication token with each request to the BSR npm registry. Add a line with this syntax to your [`.npmrc`][npmrc] file:

<Syntax
  title="npmrc token syntax"
  examples={["//npm.buf.build/:_authToken=84612b6cbe8f4..."]}
  segments={[
    {separator: "//"},
    {label: "npm.buf.build", kind: "static"},
    {separator: "/:"},
    {label: "_authToken", kind: "static"},
    {separator: "="},
    {label: "token", kind: "variable"},
  ]}
/>

You can use an existing auth token or generate a new one. To create a new one, log into the [BSR], navigate to your [user settings][settings] page, and click **Create Token**.

## Other package managers

Because the Buf npm registry implements npm's [public registry API][registry], you should be able to use it with package management tools outside of npm, such as [Yarn] and [pnpm], though with [some known limitations](#yarn).

## Known limitations

The BSR npm registry has a few limitations that you should be aware of.

### Yarn compatibility {#yarn}

[Yarn] versions greater than [v1.10.0][yarn_v1] and less than [v2.0.0] are _not_ supported. These versions of Yarn require the `shasum` field in the dist object to be set, but the BSR can't compute a digest without generating the code for all possible versions of the package.

### Runtime dependencies

If you're [creating your own plugins](../remote-generation/plugin-example.md), you can use [labels] to declare runtime dependencies for plugins. The BSR npm registry currently supports [semantic versioning][semver] for versions, like `0.1.0` or `1.2.3-SNAPSHOT`,  but _not_ semver [ranges] like `>=1.2.7` or `<1.3.0`.

### Import rewrites

If the module you request has [dependencies][deps], the npm registry rewrites any relative import paths so that they point to the package with a full package name. Here's an example rewrite:

```javascript
// generated import
require("../../google/storage/v1/storage_pb.js");

// replacement
require("@buf/grpc_web_googleapis_googleapis/google/storage/v1/storage_pb.js");
```

What this means in practice is that files generated by Protobuf plugins _must_ use the same path as their `.proto` counterparts, although suffixes like `_pb` and additional file extensions are allowed. The table below shows an original Protobuf filepath (`foo/bar.proto`) and which generated filepaths would be acceptable (or not).

Proto filepath | Path of generated file | Acceptable?
:--------------|:-----------------------|:-----------
`foo/bar.proto` | `foo/bar.js` | ✅
`foo/bar.proto` | `foo/bar_pb.js` | ✅
`foo/bar.proto` | `foo/bar_pb.ts` | ✅
`foo/bar.proto` | `foo/bar_grpc.d.ts` | ✅
`foo/bar.proto` | `foo-bar.js` | ❌
`foo/bar.proto` | `some/other/path.ts` | ❌

If you're a plugin author, be sure to heed this naming structure; otherwise, consumers of your APIs are likely to experience broken imports.

[bsr]: /bsr/overview
[buf-npm]: https://npm.buf.build
[deps]: /bsr/overview#dependencies
[labels]: /bsr/remote-generation/plugin-example#3-prepare-the-dockerfile
[modules]: /bsr/overview#modules
[npm]: https://npmjs.org
[npm-config]: https://docs.npmjs.com/cli/v8/commands/npm-config#set
[npmrc]: https://docs.npmjs.com/cli/v8/configuring-npm/npmrc
[plugins]: /bsr/remote-generation/concepts#plugins
[protoc]: https://github.com/protocolbuffers/protobuf
[pnpm]: https://pnpm.io
[ranges]: https://docs.npmjs.com/cli/v6/using-npm/semver#ranges
[npm-registry]: https://registry.npmjs.org
[registry-api]: https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md
[semver]: https://semver.org
[settings]: https://buf.build/settings/user
[template]: /bsr/remote-generation/concepts#templates
[yarn]: https://yarnpkg.com
[yarn_v1]: https://github.com/yarnpkg/yarn/releases/tag/v1.10.0
[yarn_v2]: https://github.com/yarnpkg/yarn/releases/tag/v2.0.0
