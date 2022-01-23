package data

_vals: {
	registry: "Interact with the Buf Schema Registry (BSR)."
}

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

		version: {
			description: "Print the Buf CLI version."
		}
	}

	options: {
		"log-format": {
			description: "The output format for log messages."
			default:     "color"
			enum: {
				text:  "Text output"
				color: "Colored text output"
				json:  "JSON output"
			}
		}

		timeout: {
			description: "The duration until timing out."
			type:        "duration"
			default:     "2m0s"
		}
	}

	commands: {
		beta: {
			description: "Beta commands. Unstable and likely to change."

			commands: {
				registry: {
					description: _vals.registry
				}
			}
		}

		registry: {
			description: _vals.registry

			commands: {
				login: {
					description: """
						Log into the Buf Schema Registry (BSR).

						This prompts for your BSR username and a BSR token and updates your `.netrc` file with
						these credentials.
						"""

					_flags: {
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
