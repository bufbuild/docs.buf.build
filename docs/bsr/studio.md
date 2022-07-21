---
id: studio
title: Studio
---

import Image from '@site/src/components/Image';
import Mermaid from "@site/src/components/Mermaid";

# Studio: A Production UI for Your Protobuf Services

Studio allows you to interact with APIs directly from your browser using Protobuf definitions
host on the BSR.

## Features

- You can use Protobuf definitions hosted on the BSR to compose and send requests to any API.
- You can create and edit your request in JSON. The editor provides autocomplete based on
  the Protobuf definition selected.
- You can set headers for your request and view headers for your responses.
- You can also configure cookies on your requests.
- When using Studio to directly call an API server that uses cookies for authentication, you
  can configure that server to share cookies with Studio and instruct Studio to send authenticated
  API requests with those cookies.
- You can share the target URL, request body, and headers in a URL.

## Usage

This section walks the ways you can use Studio and the steps involved.

### Composing Requests

Start by searching for the Protobuf definition of the RPC you’re looking to make a request
to. This is done through the “Select Method” menu, where you can search for the module that
contains the desired service and RPC definition.

<Image alt="Studio method select button" src="/img/bsr/studio-method-select-1.png" width={60} />
<Image alt="Studio method select modal, search for repository" src="/img/bsr/studio-method-select-2.png" width={60} />
<Image alt="Studio method select modal, method list" src="/img/bsr/studio-method-select-3.png" width={60} />

Note that currently Studio only supports unary RPCs.

Once you’ve selected your RPC, declare the **target URL** of the Protobuf API that you’re
looking to make a request to. This does not need to include the service or RPC path, since
Studio will set that based on your selected RPC definition.

<Image alt="Studio target url input" src="/img/bsr/studio-target-url.png" />

Once you've set your RPC and target URL, you can edit the payload of your request using the
built-in editor on Studio. The editor also supports autocompletion to defaults.

<Image alt="Studio request editor" src="/img/bsr/studio-request-editor.png" width={60} />

You can also set the headers for your request. This can be useful for any metadata you want
to send through, authorization headers, etc.

<Image alt="Studio request headers" src="/img/bsr/studio-request-headers.png" />

This may be used to send any authorization tokens you may want to attach to your request,
for example:

<Image alt="Studio headers with bearer token option" src="/img/bsr/studio-token-header.png" />

Lastly, you can select a protocol for sending your request. This is dependent on your target
server and the method you use to send your request, covered in detail in the following section.

<Image alt="Studio protocol selection" src="/img/bsr/studio-protocol-selection.png" width={75} />

### Sending Requests

Once your request has been configured, there are two ways to send your request using Studio:

1. Directly to your server using the Connect protocol, or
2. Through the Studio Agent proxy.

In both cases, Buf is **not** in the request path in any way.

#### Have Studio call the target server directly

Requests from Studio made directly to your target server and RPC use the fetch API through
the browser, thus gRPC is not supported:

<Mermaid chart={`
sequenceDiagram
	participant St as Studio
	participant S as Server (Target URL)
	St->>S: fetch({request headers and body})
	S->>St: {response headers and body}
`} id={1} />

If you are sending requests directly to your server using Studio, make sure that your server
is configured with the correct [CORS (Cross-Origin Resource Sharing)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
policies.

CORS is a browser mechanism using HTTP headers that allow servers and clients to declare
where a request is coming from and apply restrictions to these requests. Requests from Studio
will have the origin `https//studio.buf.build` set. CORS policies on the server-side are a
way to restrict access based on the origin of the request. In order to ensure that your API
servers are able to take requests from Studio, you’ll need to set your CORS policies to allow
for them:

```
Access-Control-Allow-Origin: https://studio.buf.build
```

It is also important to note that CORS policies can restrict the headers set on your request,
so ensure that your policies allow for any headers set on your request.

#### Proxy the request through Studio Agent

The other way is to proxy the request through Studio Agent. This is useful for two different
use cases:

1. gRPC servers: the browser is unable to talk to gRPC servers directly, so you'll need to
  proxy your request through Studio Agent.
2. Services that do not have CORS configured to allow `studio.buf.build`: Studio Agent has
  the CORS setup by default to accept requests from `studio.buf.build`, and since Studio Agent
  does not operate within the browser, requests from Studio Agent are not restricted by CORS.


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

To route your request through Studio Agent, you can configure the Studio Agent URL:

<Image alt="Studio Agent url" src="/img/bsr/studio-agent-url.png" width={60} />

For more information on the Studio Agent, see the section on [Proxying](#proxying).

## Advanced Setup

This section provides information on more advanced settings you could configure in Studio.

### Cookies

In addition to CORS policies, your service may use cookies to authenticate a request. If so,
you can pass on the cookies from your Studio request by checking the following option:

<Image alt="Studio options tab with cookies option" src="/img/bsr/studio-cookies.png" />

You’ll also need to set the following CORS policies on your server to allow the Studio
request origin and credentials:

```
Access-Control-Allow-Origin: https://studio.buf.build
Access-Control-Allow-Credentials: true
```

### Proxying

For internal Protobuf services, we made a proxy available for Studio in the `buf` CLI,
`buf beta studio-agent`.

This runs an HTTP(S) server that forwards requests from the Studio UI to the target URL.

`buf beta studio-agent` is available in CLI versions v1.5.0+

#### `buf beta studio-agent`

- Studio Agent will start HTTP(S) server on the host and port provided:
  - `bind` - the hostname to bind to, defaults to `127.0.0.1`
  - `port` - the port to bind to, defaults to `8080`
- Studio Agent can be configured to make TLS requests
  - `ca-cert` - The CA cert used in the client and server TLS configuration.
  - `client-cert` - The cert used in the client TLS configuration.
  - `client-key` - The key used in the client TLS configuration.
  - `server-cert` - The cert used in the server TLS configuration.
  - `server-key` - The key used in the server TLS configuration.
- Studio Agent can be configured to trim disallowed headers from an incoming Studio request
  (e.g. authorization headers, etc.)
  - `disallowed-header` - Disallowed header keys. Multiple headers are appended if
    specified multiple times.
- Studio Agent can be configured to forward specific headers
  - `forward-header` - Forward headers are set in the format of
    `--forward-header=fromHeader=toHeader`. Multiple headers are append if specified
      multiple times.
- Studio Agent can be configured to set specific accepted origins for CORS policies
    - `origin` - Allowed origin for CORS, defaults to “studio.buf.build”
- For a long-running instance of Studio Agent, an indefinite timeout will need to be
  set `--timeout=0s`.

## Roadmap

### Streaming

Currently, Studio only supports communications with unary RPCs. We plan on expanding this
experience to streaming RPCs. By first restricting Studio to unary APIs, we can gather
feedback on the overall experience and incorporate it in building out our feature set for
streaming.

As always, if you have suggestions of features or any feedback in general, feel free to
[reach out to us](../contact).
