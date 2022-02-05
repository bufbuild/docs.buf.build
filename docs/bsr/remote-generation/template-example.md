---
id: template-example
title: Authoring a Template
---

> Remote code generation is an **experimental feature**. We started with Go and have plans to add support for other languages. [Let us know what language we should tackle next](../../contact.md).

A BSR Template is a collection of one or more plugins that facilitates remote code generation.

In this example we'll create a `twirp-go` template by combining 2 existing BSR plugins:

- An officially supported BSR plugin: [`protocolbuffers/go`](https://buf.build/protocolbuffers/plugins/go).
- A community plugin: [`demolab/twirp`](https://buf.build/demolab/plugins/twirp).

> The `demolab/twirp` plugin was prepared in the [Authoring a Plugin](plugin-example.md) section.

We'll conclude by **remotely generating Go code** for a Protobuf module hosted on the BSR by using the `twirp-go` template.

## Create a BSR template

You can create a BSR template through the UI or the `buf` CLI.

From the UI, click your avatar in the top-right corner, select Templates and click
the Create Template button. Follow the on-screen instructions.

For this example, we'll use the `buf` CLI.

### 1. Create template

Similar to `protoc` command-line flags, options are included in your template.

> **Once a template is created, options cannot be modified and become part of the template configuration. You can, however, continue to update plugin versions.**

For Go-based templates include `paths=source_relative` for all plugin options.

```terminal
$ buf beta registry template create buf.build/demolab/templates/twirp-go \
	--visibility public \
	--config '{"version":"v1","plugins":[{"owner":"library","name":"go","opt":["paths=source_relative"]},{"owner":"demolab","name":"twirp","opt":["paths=source_relative"]}]}'
---
Owner    Name
demolab  twirp-go
```

### 2. Set plugin versions

```terminal
$ buf beta registry template version create buf.build/demolab/templates/twirp-go \
	--name v1 \
	--config '{"version":"v1","plugin_versions":[{"owner":"library","name":"go","version":"v1.27.1-1"},{"owner":"demolab","name":"twirp","version":"v8.1.0-1"}]}'
---
Name  Template Owner  Template Name
v1    twirp-go        demolab
```

That's it, you published a BSR template. Check it out here: https://buf.build/demolab/templates/twirp-go

## Code generation example

The `twirp-go` template, combined with a BSR module, generates Go types and Twirp stubs that can be used by both producers and consumers. The producer writes an API implementation and the consumer interacts with the API. Both parties fetch generated source code from the BSR Go module proxy.

If you're feeling ambitious, run the Go code to expose the API in one terminal and then hit the endpoint with the client SDK in another terminal window.

### Producer (API)

Here is an example `.proto` file describing an rpc service. It is a Protobuf module that has been pushed to the BSR, located here:

https://buf.build/demolab/theweather

```proto title="weather.proto"
syntax = "proto3";

package weather;

service WeatherService {
    // GetWeather retrieves weather information for the requested city.
    rpc GetWeather(GetWeatherRequest) returns (GetWeatherResponse);
}

message GetWeatherRequest {
    string city_name = 1;
}

message GetWeatherResponse {
    // The temperature in degrees celsius.
    int32 temperature = 1;
}
```

The BSR remotely generates Go code for this module using the `twirp-go` template.

Code generation takes place on the fly when a user fetches code for the first time. You may notice a delay for the initial run, but the generated code is cached in the BSR Go module proxy and subsequent requests are much quicker.

```terminal
$ go get go.buf.build/demolab/twirp-go/demolab/theweather
$ go mod tidy
```

This updates your `go.mod` file with:

```
require (
	github.com/pkg/errors v0.9.1 // indirect
	go.buf.build/demolab/twirp-go/demolab/theweather v1.1.1
)
```

As you iterate on a Protobuf API and push to the BSR, you likely need to generate and update code. To do so, update the go.mod file by setting the desired version explicitly and then run `go mod tidy`. This once again remote generates code and caches the result.

```bash {4}
require (
	github.com/twitchtv/twirp v8.1.0+incompatible // indirect
- 	go.buf.build/demolab/twirp-go/demolab/theweather v1.1.1
+	go.buf.build/demolab/twirp-go/demolab/theweather v1.1.2
)
```

Here is a crude HTTP implementation of the Twirp server. Note the server stubs and Go types are imported from the BSR Go module proxy.

```go title="cmd/producer/main.go" {7}
package main

import (
	"context"
	"net/http"

	"go.buf.build/demolab/twirp-go/demolab/theweather/weather"
)

type weatherService struct{}

func (s *weatherService) GetWeather(context.Context, *weather.GetWeatherRequest,
) (*weather.GetWeatherResponse, error) {
	return &weather.GetWeatherResponse{Temperature: 24}, nil
}

func main() {
	mux := http.NewServeMux()
	weatherHandler := weather.NewWeatherServiceServer(&weatherService{})
	mux.Handle(weatherHandler.PathPrefix(), weatherHandler)
	http.ListenAndServe(":8080", mux)
}
```

You can now build and run your API as you normally would.

### Consumer (Client SDK)

The really neat feature of BSR Remote Generation is consumers of the Twirp API get JSON/Protobuf clients for free. No Protobuf files, no local protoc plugins. No hand writing clients. Simply fetch the generated code like any other library.

Here is a fully working Go client SDK for the above Twirp server. Again, we're importing remote generated code from the BSR Go module proxy.

```terminal title="cmd/consumer/main.go" {9}
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"go.buf.build/demolab/twirp-go/demolab/theweather/weather"
)

func main() {
	client := weather.NewWeatherServiceProtobufClient("http://localhost:8080", http.DefaultClient)
	resp, err := client.GetWeather(context.Background(),
		&weather.GetWeatherRequest{CityName: "Toronto"},
	)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("The temperature in Toronto is currently: %d°C\n", resp.GetTemperature())
}
---
The temperature in Toronto is currently: 24°C
```

You can now build and run your Go code as you normally would. Try it out by running the API in one terminal window, and then hitting the endpoint with the SDK client.