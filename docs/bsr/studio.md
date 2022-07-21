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

- You can interact with all Protobuf definitions in public and private BSR modules you have
  access to.
- You can inspect and edit your request in JSON. The editor provides autocomplete based on
  the Protobuf definition selected.
- You can set headers for your request and view headers for your responses.
- You can also configure cookies on your requests.
- You can share the target URL, request body, and headers in a URL.

## Usage

### Setting Up Your  RPC and Target URL

Start by searching for the Protobuf definition of the RPC you’re looking to make a request
to. This is done through the “Select Method” menu, where you can search for the module that
contains the desired service and RPC definition.

<Image alt="Studio method select button" src="/img/bsr/studio-method-select-1.png" width={60} />
<Image alt="Studio method select modal, search for repository" src="/img/bsr/studio-method-select-2.png" width={60} />
<Image alt="Studio method select modal, method list" src="/img/bsr/studio-method-select-3.png" width={60} />

Note that Studio only supports unary RPCs currently.

Once you’ve selected your RPC, declare the **target URL** of the Protobuf API that you’re
looking to make a request to. This does not need to include the service or RPC path, since
Studio will set that based on your selected RPC definition.

<Image alt="Studio target url input" src="/img/bsr/studio-target-url.png" />

### Calling Your Target and RPC

There are two ways to make a request to your target URL.


#### Have Studio UI call the target service directly

Requests from Studio UI to the target service and RPC directly will be made from the browser,
so this does not support gRPC. This method works best of hitting Protobuf APIs that are not
using gRPC as the protocol.

<Mermaid chart={`
sequenceDiagram
	participant St as Studio UI
	participant S as Service (Target URL)
	St->>S: Request headers and body sent directly from Studio UI.
	S->>St: Response headers and body sent directly back to Studio UI.
`} id={1} />

#### Proxy the request from Studio UI through Studio Agent

Studio Agent is required to proxy requests to gRPC services. You can set the URL to your
Studio Agent and Studio will route the request to Studio Agent, which will forward the request
to the gRPC service with the appropriate protocol. For more information on the Studio Agent,
see the section on [Proxying](#proxying).

<Mermaid chart={`
sequenceDiagram
	participant St as Studio UI
	participant Sa as Studio Agent
	participant S as Service (Target URL)
	St->>Sa: Request for the gRPC service first directed to Studio Agent.
	Sa->>S: Request forwarded to gRPC service from Studio Agent.
	S->>Sa: Response from gRPC service to Studio Agent.
	Sa->>St: Response forwarded to Studio UI.
`} id={2} />

<Image alt="Studio Agent url" src="/img/bsr/studio-agent-url.png" width={60} />

For more information on configuring Studio to talk to your services, see the section below
on [Connecting Studio to Your Production Environment](bsr/studio).

### Making Your Request

You can edit the payload of your request using the built-in editor on Studio. The editor
also supports autocompletion to defaults.

You can also set the headers for your request. This can be useful for any metadata you want
to send through, authorization headers, etc.

<Image alt="Studio request editor" src="/img/bsr/studio-request-editor.png" width={60} />
<Image alt="Studio request headers" src="/img/bsr/studio-request-headers.png" />

Once everything is set, all you need to do is press “Send”, and Studio will serialize the
request, with the provided headers to the target and deserialize and display the response.

<Image alt="Studio full view with response" src="/img/bsr/studio-full-view-response.png" />

### Sharing Your Request

You can also share your request with the request body, headers, and options you have set.

<Image alt="Studio share modal" src="/img/bsr/studio-share.png" />

## Connecting Studio to Your Production Environment

When connecting Studio to your services and APIs, we'll need to handle the configurations
for access control and authentication.

### CORS Policies

[CORS (Cross-Origin Resource Sharing)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
is a mechanism built into HTTP headers that allow servers and clients to “declare” where a
request is coming from. Requests from Studio will have the origin https//studio.buf.build
set. CORS policies on the server-side are a way to restrict access based on the origin of
the request. In order to ensure that your API servers are able to take requests from Studio,
you’ll need to set your CORS policies to allow for them:

```
Access-Control-Allow-Origin: https://studio.buf.build
```

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

### Tokens via Request Headers

You can also add any authorization/bearer tokens to the headers of your request:

<Image alt="Studio headers with bearer token option" src="/img/bsr/studio-token-header.png" />

### Proxying

For internal Protobuf services, we made a proxy available for Studio in the `buf` CLI,
`buf beta studio-agent`.

This runs an HTTP(S) server that forwards requests from the Studio UI to the target URL.

`buf beta studio-agent` is available in CLI versions v1.5.0+

### `buf beta studio-agent`

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

### Collections

Currently Studio allows you access all of your BSR modules, however you can only set one
module and RPC at a given time. We want to add the ability to define "collections" of RPCs
across modules for easy access as you're working with Studio for your development. Also, we
want to make "collections" shareable across users with access to the same modules for better
collaboration on a project.

As always, if you have suggestions of features or any feedback in general, feel free to
[reach out to us](../contact).
