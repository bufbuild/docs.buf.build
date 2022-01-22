package data

files: {
	"buf.yaml": {
		description: """
      		Defines a Buf [module](\(urls.module)). The `buf.yaml` file is the primary configuration file,
      		responsible for the module's name, dependencies, and [`lint`](\(urls.lint)) and
      		[`breaking`](\(urls.breaking)) configuration.
      		"""
		fields: {
			version: {
				description: "Defines the current Buf version."
				required:    true
				type: string: {
					default: #V1
					allowed: [#V1Beta1, #V1]
				}
			}

			name: {
				description: """
					A unique identifier for your module. Must be a valid [module name](\(urls.module)) and is
					directly associated with the repository that owns it.
					"""
				required:    false
				type: string: {}
			}

			deps: {
				description: """
					Declares one or more [modules](\(urls.module)) that your own module depends on. Each
					`deps` entry **must** be a module reference and is directly associated with a repository
					as well as a [reference](\(urls.reference)), which is either a tag or a commit.
					"""

				type: string_array: {
					default: []
				}
			}
		}
		_default: {
			version: fields.version.type.string.default
			deps: fields.deps.type.string_array.default
		}
	}

	"buf.lock": {
		description: """
			Contains the [module](\(urls.module))'s dependency manifest and represents a single,
			reproducible build of your module's dependencies.
			"""
	}

	"buf.gen.yaml": {
		description: """
			Used to define a **local generation template** that works directly with the
			[`buf generate`](\(urls.buf_generate)) command. The `buf.gen.yaml` file is used to generate
			code with [`protoc`](\(urls.protobuf)) and simplifies the `protoc` experience significantly.
			"""
	}

	"buf.work.yaml": {
		description: """
			Used to define a [workspace](\(urls.workspace)), which is an advanced local development
			feature. The `buf.work.yaml` file makes it possible to consolidate one or more modules into a
			single buildable unit. Workspaces also enable you to run `buf` operations across multiple
			modules with a single execution, for example [`buf lint`](\(urls.lint)).
			"""
	}
}
