---
id: editor-integration
title: Editor integration
---

`buf` produces structured machine readable error output for [build](build/usage), [lint](lint/overview),
and [breaking change](breaking/overview) errors which integrate with IDEs, scripts, and other tools.

We currently provide Vim and Visual Studio Code integrations and intend to support Emacs and
Intellij in the future. [Contact us](contact) if you are interested in any of these, or others
not already listed here.

## Vim

Vim integration for linting is available using the [ALE](https://github.com/dense-analysis/ale)
lint engine via the [vim-buf](https://github.com/bufbuild/vim-buf) plugin.

To use Vim integration `buf` must be [installed](installation.md). Using [vim-plug](https://github.com/junegunn/vim-plug),
add this to your `.vimrc`:

```vim
Plug 'dense-analysis/ale'
Plug 'bufbuild/vim-buf'
let g:ale_linters = {
\   'proto': ['buf-lint',],
\}
let g:ale_lint_on_text_changed = 'never'
let g:ale_linters_explicit = 1
```

The extension runs `buf lint --path` on save and reveals errors on a per-file basis. To detect package-level
problems, be sure to run a module-wide `buf lint` as part of your [CI](ci-cd/setup) process.

## Visual Studio Code  [![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/bufbuild.vscode-buf?color=2048ff&label=Buf&logo=visual-studio-code&style=flat-squar)](https://marketplace.visualstudio.com/items?itemName=bufbuild.vscode-buf)

The Visual Studio Code extension can be downloaded from the in-editor extension browser under the name "Buf"
or manually via [the extension page](https://marketplace.visualstudio.com/items?itemName=bufbuild.vscode-buf). You need to have `buf` [installed](installation.md) to use it.

Our Buf extension currently supports [linting] your `.proto` files. It runs `buf lint --path` on save and reveals errors on a per-file basis. To detect package-level problems, be sure to run a module-wide `buf lint` as part of your CI process.

The roadmap for the extension includes full Language Server Protocol ([LSP]) support, formatting, syntax highlighting, and more.

> `buf` is executed in the root of your workspace, which means `buf` is configured by the [`buf.yaml`](configuration/v1/buf-yaml) or
> [`buf.work.yaml`](configuration/v1/buf-work-yaml) in the root of your workspace.

## JetBrains IDEs

IntelliJ IDEA, GoLand and other JetBrains IDEs can be configured with a File Watcher that runs `buf lint --path` on
save and optionally surface issues as warnings or errors in your editor.

Make sure `buf` is [installed](installation.md) on your PATH, then configure your buf lint FileWatcher according to
[JetBrains' documentation](https://www.jetbrains.com/help/idea/using-file-watchers.html) using these values:

| setting           | value                                   |
|-------------------|-----------------------------------------|
| Program           | `buf`                                   |
| Arguments         | `lint --path $FilePath$`                |
| Working directory | `$ProjectFileDir$`                      |
| Output filters    | `$FILE_PATH$:$LINE$:$COLUMN$:$MESSAGE$` |

> `buf` is executed in your project root, which means `buf` is configured by the
> [`buf.yaml`](configuration/v1/buf-yaml) or [`buf.work.yaml`](configuration/v1/buf-work-yaml) in your project root.

## editorconfig suggestions

If you use [EditorConfig] files to enforce consistent styles in your code, we recommend these settings for your `.proto` files:

```editorconfig
[*.proto]
indent_size = 2
indent_style = space
insert_final_newline = true
```

These settings aren't semantically meaningful in Protobuf but are commonly used throughout the ecosystem.

## Formatting options

`buf` supports these formatting options (passed using the `--error-format` flag) to support other integrations:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="text"
  values={[
    { label: 'text', value: 'text', },
    { label: 'msvs', value: 'msvs', },
    { label: 'json', value: 'json', },
  ]
}>
<TabItem value="text">

```
path/to/file.proto:1:10:syntax value must be "proto2" or "proto3"
```

</TabItem>
<TabItem value="msvs">

```
path/to/file.proto(1,10) : error COMPILE : syntax value must be "proto2" or "proto3"`
```

</TabItem>
<TabItem value="json">

```
{"path":"path/to/file.proto","start_line":1,"start_column":10,"end_line":1,"end_column":10,"type":"COMPILE","message":"syntax value must be \"proto2\" or \"proto3\""}
```

</TabItem>
</Tabs>

[editorconfig]: https://editorconfig.org
[linting]: https://docs.buf.build/lint/overview
[lsp]: https://code.visualstudio.com/api/language-extensions/language-server-extension-guide
