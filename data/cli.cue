package data

buf_cli: {
	name: "buf"

	flags: {
		debug: {
			description: "Turn on debug logging."
		}

		help: {
			description: "Help text for the CLI."

			_short: "h"
		}

		verbose: {
			description: "TODO"

			_short: "v"
		}
	}

	options: {
		"log-format": {
			description: "TODO"
			default:     "color"
			enum: {
				text:  "Text output"
				color: "Colored text output"
				json:  "JSON output"
			}
		}

		timeout: {
			description: "TODO"
			type:        "duration"
			default:     "20ms"
		}
	}

	commands: {
		registry: {
			description: "Interact with the Buf Schema Registry (BSR)."

			subcommands: {
				login: {
					description: """
						Log into the Buf Schema Registry (BSR).

						This prompts for your BSR username and a BSR token and updates your `.netrc` file with
						these credentials.
						"""

					flags: {
						"token-stdin": {
							description: """
                Read the token from stdin. By default, this command prompts for a token.
                """
						}
					}

					options: {
						username: {
							description: "The username to user. By default, this command prompts for a username."
							type:        "string"
						}
					}
				}

        logout: {
          description: """
            Log out of the Buf Schema Registry (BSR).

            This removes any BSR credentials from your `.netrc` file.
            """
        }
			}
		}
	}
}
