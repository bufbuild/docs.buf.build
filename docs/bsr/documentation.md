---
id: documentation
title: Generated documentation
---

import Image from '@site/src/components/Image';

The BSR comes with complete documentation for your Protobuf files through a browsable UI with syntax highlighting, one click navigation between definitions and references. Navigate to a repository within the BSR and click the **Docs** tab. 

<Image alt="BSR module" src="/img/bsr/gen_docs-3.png" caption="The documentation link in the BSR interface" />

For an example see the `demolab/theweather` module by visiting [https://buf.build/demolab/theweather/docs](https://buf.build/demolab/theweather/docs).

## Module documentation

Most documentation comes directly from comments associated with your Protobuf definitions. But there also needs to be a way for authors to *describe their module* for others to understand its functionality.

To accomplish this, you add a `buf.md` file to the same directory as your module's `buf.yaml` file and push it to the BSR like normal. Since documentation is part of your module, any updates to your `buf.md` result in new commits in the BSR.

The `buf.md` file is analogous to a GitHub repository's `README.md` and currently supports all of the
[CommonMark](https://commonmark.org) syntax.

<Image alt="BSR module" src="/img/bsr/gen_docs-2.png" caption="Documentation generated from Markdown" />

## Package documentation

The package level documentation provides Protobuf type definitions and comments for all package files. Clicking through the type definitions takes you to the referenced item.

You can quickly navigate from the docs to the Protobuf file by clicking the filename on the right-hand side.

Each type definition has a unique placeholder within the page, an anchor tag, enabling you to share links to the exact item.

### Package description

When sharing packages it is often useful to provide an overview of the package. You can do so by adding comments above the `package` directive in your .proto file.

Comments on the package directive are not merged across files. Files are parsed alphabetically, and only the first file with a non-empty comment is displayed in the generated documentation.

<Image alt="BSR module" src="/img/bsr/gen_docs-1_v2.png" caption="Generated package documentation" />
