# The Buf documentation

This repo houses all of the assets used to build the [Buf] documentation available at
https://docs.buf.build.

## Running the documentation locally

To get started, make sure you have [Node] installed:

```terminal
brew install node
make install
```

To run a local dev server, run:

```terminal
make
```

or

```terminal
make run
```

This command starts a local development server on `localhost:3000`. The dev server
serves content dynamically and should pick up most changes live without
having to restart the server.

To view the fully built product, you can run:

```terminal
make serve
```

This command generates static content into the `build` directory and then serves
the static files on `localhost`. This doesn't update dynamically as with `make run`
but the content you view this way should be identical to the deployed docs.


## About the Docusaurus setup

We are using [version 2.0.0-beta.3](https://docusaurus.io/docs/2.0.0-beta.3) of
Docusaurus.

### Authoring code blocks

The project extends the capabilities of docusaurus to render code blocks:

- `sh` is recognized as an alias for `bash` and `shell` and enables shell script highlighting
- `proto` is recognized as an alias for `protobuf` and enables protocol buffers source highlighting
- `terminal` will use shell script highlighting, and:
  - strip `$ ` from every line of code copied to the clipboard
  - allow console output following a command to be separated by a line with three dashes `---`, and
    not copy only the part above this line to the clipboard
- adding the suffix `-nocopy` to any language identifier will hide the Copy button


### Badges in the sidebar

The project extends the docusaurus sidebar with badges.

To add a badge to a category, add the property `customProps` as follows:

```json
{
  "type": "category",
  "label": "Remote Generation",
  "customProps": {
    "badge": {
      "label": "experimental",
      "severity": "danger"
    }
  },
```

To add a badge to an item, change the string id to a `doc` object. I.e. for `"bsr/authentication"`:

```json
{
  "type": "doc",
  "id": "bsr/authentication",
  "customProps": {
    "badge": {
      "label": "beta",
      "severity": "warning"
    }
  }
},
```

The properties `label` and `severity` are mandatory. The severity can be one of:
- `danger` (red badge)
- `warning` (yellow badge)
- `neutral` (gray badge)
- `info` (blue badge)

> Note that long badge labels in combination with long item labels might cause a line break, which
> should be avoided for the sake of readability.

### Styling

All styles live in [`src/css/custom.css`](./src/css/custom.css) and CSS module files in
`src/theme/`. If a style cannot be manipulated in `custom.css` as required, theme components
can be [overridden](https://docusaurus.io/docs/2.0.0-beta.3/typescript-support#swizzling-typescript-theme-components)
and [wrapped](https://docusaurus.io/docs/2.0.0-beta.3/using-themes#wrapping-theme-components).

## Custom components

There are a few custom components that you may find useful when working on the docs:

### `Image`

Use this component for embedding [images](./src/components/Image/index.tsx). Here's an example:

```jsx
<Image src="/images/weird-al.png" alt="Funniest guy ever" />
```

Required fields are `alt` and `src`. Optional fields: `title`, `width`, `caption`.

[buf]: https://buf.build
[node]: https://nodejs.org