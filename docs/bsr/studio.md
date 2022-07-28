---
id: studio
title: Buf Studio
---

import Image from '@site/src/components/Image';
import Mermaid from "@site/src/components/Mermaid";

# Buf Studio: An interactive web UI for gRPC and Protobuf

## Overview

[Buf Studio](https://studio.buf.build) is an interactive web UI for all your gRPC and Protobuf services stored on the Buf Schema Registry. With Buf Studio you can:

- Select an endpoint from any BSR module to send requests to either [gRPC](#proxying)
  or [Connect](https://connect.build) APIs.
- Use the editor with schema-based autocompletion, validation and documentation
  to draft JSON based request messages.
- Configure headers to further customize outgoing requests.
- Optionally include cookies in outgoing request to send authenticated requests
  to private APIs (or Buf Studio Agent instances).
- Create sharable links for requests defined on Buf Studio to team members with access.

## Composing Requests

Start by selecting the Protobuf method you’re looking to make a request with.
With the “Select Method” menu you can choose a BSR module and use Buf Studio's fuzzy search to
select the desired service and method for you request:

<!-- TODO: make this into a gif -->
<Image alt="Studio method select demo" src="/img/bsr/studio-method-select.gif" width={90} />

Note that the streaming endpoints are currently greyed out as Buf Studio currently
only supports unary RPC. We intend to support streaming RPC in the future.

Once you’ve selected your RPC, declare the **target URL** of the Protobuf API
that you’re looking to make a request to. This should not include the service or
RPC path, which Buf Studio will append based on your selected RPC definition.

<Image alt="Studio target url input" src="/img/bsr/studio-target-url.png" />

Once you've configured your RPC and target URL, create the payload of your
request using the Buf Studio's built-in editor. Based on the schema for your RPC's
request message, the editor will give you:

- Autocompletion: use "ctrl + space" to trigger suggestions.
- Validation: invalid field types, invalid json, etc. The editor will underline the invalid
  region.
- Documentation: hover over fields, or use the "Docs" tab above the editor to view documentation
  for the Protobuf definition.

<Image alt="Studio request editor" src="/img/bsr/studio-request-editor.gif" width={60} />

You can also set the headers for your request. This can be useful for any
metadata you want to send through, authorization headers, etc.

<Image alt="Studio request headers" src="/img/bsr/studio-request-headers.png" />

## Sending Requests

Once you've composed the request and are ready to call the API, Buf Studio can
send it in two ways:

1. Directly from your browser to the target API, or
2. From your browser through a Buf Studio Agent proxy to the target API.

By making requests directly from the browser your requests stay private to you,
in neither case the request is routed through Buf servers.

### Direct

Without Buf Studio Agent, requests are made directly from the browser using the
standard `fetch()` API. This works great in combination with browser compatible
Protobuf servers such as [Connect](https://connect.build/).

<Mermaid chart={`
sequenceDiagram
	participant St as Studio
	participant S as Server (Target URL)
  St->>S: fetch({request headers and body})
	S->>St: {response headers and body}
`} id={1} />

The server should be setup with a [CORS (Cross-Origin Resource
Sharing)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) policy
permitting requests from `https://studio.buf.build`. CORS is a standard HTTP
mechanism used to indicate to browsers which origins are allowed to request a
resource. CORS has a variety of options and can be configured easily in most
popular server libraries and reverse proxies, it requires servers to
respond with the following header to make studio be able to receive a response:

```
Access-Control-Allow-Origin: https://studio.buf.build
```
Note that CORS policies can restrict the response headers studio is allowed to
access by the browser, be sure to configure `Access-Control-Allow-Headers` as
required by your use-case.

If you are unable to configure the target service to allow requests from studio,
you use `Buf Studio Agent` or a CORS proxy to reach the service instead.

Due to limitations in the design of the gRPC protocol, browsers are unable to
communicate with gRPC servers. To use Buf Studio with servers that only expose the
gRPC protocol, read on to the next section.

### Via Buf Studio Agent

Buf Studio agent is tool that can be used to expand the use of Buf Studio to protocols
and servers normally out of reach for browsers. It is OSS that ships as part of
the `buf` cli and uses [connect-go](https://github.com/bufbuild/connect-go) to implement a
small proxy to unlock this extra functionality.

With Buf Studio Agent, the request flow is as follows:

<Mermaid chart={`
sequenceDiagram
	participant St as Studio
	participant Sa as Studio Agent
	participant S as Service (Target URL)
	St->>Sa: fetch({request headers and body})
	Sa->>S: {request headers and body}
	S->>Sa: {response headers and body}
	Sa->>St: {response headers and body}
`} id={2} />

When using Buf Studio Agent, studio can now also reach:

1. gRPC servers: The gRPC protocol is not able to be used with any major browser, however
while browsers cannot use the gRPC protocol, Buf Studio Agent can!
Communication between Buf Studio Agent and Buf Studio is handled in a with a protocol
understandable by browsers, which Buf Studio Agent will dynamically reframe to
communicate with the target server.

2. Servers without the required CORS configuration: as CORS is abrowser specific limitation,
Buf Studio Agent can issue requests to any server. The required CORS config is built into Buf Studio
Agent by default, so the browser will be able to reach Buf Studio Agent which will forward your
request to the target server.

To use Buf Studio Agent, configure the Buf Studio Agent URL in the UI with a URL to a running instance
of Buf Studio Agent:

<Image alt="Studio Agent url" src="/img/bsr/studio-agent-url.png" width={60} />

For more information on running Buf Studio Agent, see the [reference section](#reference-studio-agent-flags) below.

## Advanced Setup

### Cookies

Some APIs use cookies to authenticate requests. You can configure Buf Studio to
include cookies with your requests by checking the following option:

<Image alt="Studio options tab with cookies option" src="/img/bsr/studio-cookies.png" />

Cookies for the target URL need to contain `SameSite=None; Secure` to be
included in requests from Buf Studio. Servers that accept cross-origin cookies for
authentication should also use CORS to indicate to the browser that Studio
requests may include credentials by using the
`Access-Control-Allow-Credentials` header:

```
Access-Control-Allow-Origin: https://studio.buf.build
Access-Control-Allow-Credentials: true
```

Note: allowing credentials puts limitations on other CORS features such as using
a wildcard for allowable response headers. Please refer to documentation on
[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) to understand the
requirements.

### Long-Running Buf Studio Agent Instances

At Buf we deploy long-running Buf Studio Agent instances with our internal infrastructure.
Their endpoint are protected by SSO and combined with the Cookies option
described above this allows us to reach any public or internal Protobuf endpoint
from Buf Studio. Together with our public and private
APIs on the BSR, this setup allows us to test and debug any endpoint with
ease.

With BSR Enterprise, administrators can configure default Buf Studio Agent URLs for
anyone on their cluster. Combined with Cookies & Buf Studio Agent header
forwarding, this transforms Buf Studio into the practical UI for any proto service
at the company. [Please reach out to learn more](https://buf.build/request-a-demo/).

### Reference: Buf Studio Agent flags

Buf Studio agent is included in the cli under `buf beta studio-agent`. This runs an
HTTP(S) server that forwards requests from the Buf Studio to the target URL.

`buf beta studio-agent` is available in CLI versions v1.5.0+

#### `buf beta studio-agent`

- Buf Studio Agent will start HTTP(S) server on the host and port provided:
  - `bind` - the hostname to bind to, defaults to `127.0.0.1`
  - `port` - the port to bind to, defaults to `8080`
- Buf Studio Agent can be configured to make TLS requests
  - `ca-cert` - The CA cert used in the client and server TLS configuration.
  - `client-cert` - The cert used in the client TLS configuration.
  - `client-key` - The key used in the client TLS configuration.
  - `server-cert` - The cert used in the server TLS configuration.
  - `server-key` - The key used in the server TLS configuration.
- Buf Studio Agent can be configured to trim disallowed headers from an incoming Buf Studio request
  (e.g. authorization headers, etc.)
  - `disallowed-header` - Disallowed header keys. Multiple headers are appended if
    specified multiple times.
- Buf Studio Agent can be configured to forward specific headers
  - `forward-header` - Forward headers are set in the format of
    `--forward-header=fromHeader=toHeader`. Multiple headers are append if specified
      multiple times.
- Buf Studio Agent can be configured to set specific accepted origins for CORS policies
    - `origin` - Allowed origin for CORS, defaults to “studio.buf.build”
- For a long-running instance of Buf Studio Agent, an indefinite timeout will need to be
  set with `--timeout=0s`.
