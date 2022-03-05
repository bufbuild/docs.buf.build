import Arg, {
  commitArg,
  directoryArg,
  inputArg,
  moduleArg,
  organizationArg,
  pluginArg,
  referenceArg,
  registryArg,
  repositoryArg,
  sourceArg,
  tagArg,
  templateArg,
  trackArg
} from "./args";
import Flag, {
  allFlag,
  configFlag,
  disableSymlinksFlag,
  errorFormatFlag,
  excludeImportsFlag,
  excludePathFlag,
  forceFlag,
  formatFlag,
  inputFlag,
  lsConfigFlag,
  lsVersionFlag,
  messageFlag,
  outputFlag,
  pageSizeFlag,
  pageTokenFlag,
  pathFlag,
  reverseFlag,
  templateConfigFlag,
  typeFlag,
  visibilityFlag
} from "./flags";
import { link } from "./links";

type Command = {
  name: string;
  description: string;
  arg?: Arg;
  args?: Arg[];
  flags?: Flag[];
  commands?: Command[];
};

const commands: Command[] = [
  {
    name: "beta",
    description: "Beta commands. Unstable and likely to change.",
    commands: [
      {
        name: "convert",
        description:
          "Use a source reference to convert a binary or JSON-serialized message supplied through stdin or the input flag.",
        arg: sourceArg,
        flags: [errorFormatFlag, inputFlag, outputFlag, typeFlag]
      },
      {
        name: "migrate-v1beta1",
        description:
          "Migrate any v1beta1 configuration files in the current directory to the latest version.",
        arg: directoryArg
      },
      {
        name: "registry",
        description: `Manage assets on the ${link("bsr", "Buf Schema Registry")} (BSR).`,
        commands: [
          {
            name: "commit",
            description: "",
            commands: [
              {
                name: "get",
                description: "",
                arg: referenceArg,
                flags: [formatFlag]
              },
              {
                name: "list",
                description: "",
                arg: moduleArg,
                flags: [formatFlag, pageSizeFlag, pageTokenFlag, reverseFlag]
              }
            ]
          },
          {
            name: "organization",
            description: "",
            commands: [
              {
                name: "create",
                description: "",
                arg: organizationArg,
                flags: [formatFlag]
              },
              {
                name: "delete",
                description: "",
                arg: organizationArg,
                flags: [forceFlag]
              },
              {
                name: "get",
                description: "",
                arg: organizationArg,
                flags: [formatFlag]
              }
            ]
          },
          {
            name: "plugin",
            description: "",
            commands: [
              {
                name: "create",
                description: "",
                arg: pluginArg,
                flags: [formatFlag, visibilityFlag("plugin")]
              },
              {
                name: "delete",
                description: "",
                arg: pluginArg,
                flags: [forceFlag]
              },
              {
                name: "deprecate",
                description: "",
                arg: pluginArg,
                flags: [messageFlag]
              },
              {
                name: "list",
                description: "",
                arg: registryArg,
                flags: [formatFlag, pageSizeFlag, pageTokenFlag, reverseFlag]
              },
              {
                name: "undeprecate",
                description: "",
                arg: pluginArg
              },
              {
                name: "version",
                description: "",
                commands: [
                  {
                    name: "list",
                    description: "List versions.",
                    arg: pluginArg,
                    flags: [formatFlag, pageSizeFlag, pageTokenFlag, reverseFlag]
                  }
                ]
              }
            ]
          },
          {
            name: "repository",
            description: "",
            commands: [
              {
                name: "create",
                description: "",
                arg: repositoryArg,
                flags: [formatFlag, visibilityFlag("repository")]
              },
              {
                name: "delete",
                description: "",
                arg: repositoryArg,
                flags: [forceFlag]
              },
              {
                name: "deprecate",
                description: "",
                arg: repositoryArg,
                flags: [messageFlag]
              },
              {
                name: "get",
                description: "",
                arg: repositoryArg,
                flags: [formatFlag]
              },
              {
                name: "list",
                description: "",
                arg: registryArg,
                flags: [formatFlag, pageSizeFlag, pageTokenFlag, reverseFlag]
              },
              {
                name: "undeprecate",
                description: "",
                arg: repositoryArg
              }
            ]
          },
          {
            name: "tag",
            description: "",
            commands: [
              {
                name: "create",
                description: "",
                args: [commitArg, tagArg]
              },
              {
                name: "list",
                description: "",
                arg: repositoryArg
              }
            ]
          },
          {
            name: "template",
            description: "",
            commands: [
              {
                name: "create",
                description: "",
                arg: templateArg,
                flags: [templateConfigFlag, formatFlag, visibilityFlag("template")]
              },
              {
                name: "delete",
                description: "",
                arg: templateArg,
                flags: [forceFlag]
              },
              {
                name: "deprecate",
                description: "",
                arg: templateArg,
                flags: [messageFlag]
              },
              {
                name: "list",
                description: "",
                arg: registryArg,
                flags: [formatFlag, pageSizeFlag, pageTokenFlag, reverseFlag]
              },
              {
                name: "undeprecate",
                description: "",
                arg: templateArg
              },
              {
                name: "version",
                description: "",
                commands: [
                  {
                    name: "create",
                    description: "Create a new template version",
                    arg: templateArg,
                    flags: [templateConfigFlag, formatFlag]
                  },
                  {
                    name: "list",
                    description: "List versions for the specified template.",
                    arg: templateArg,
                    flags: [formatFlag, pageSizeFlag, pageTokenFlag, reverseFlag]
                  }
                ]
              }
            ]
          },
          {
            name: "track",
            description: "",
            commands: [
              {
                name: "delete",
                description: "",
                arg: trackArg,
                flags: [forceFlag]
              },
              {
                name: "list",
                description: "",
                arg: repositoryArg,
                flags: [formatFlag, pageSizeFlag, pageTokenFlag, reverseFlag]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "breaking",
    description: "Breaking change detection",
    arg: inputArg,
    flags: [
      {
        name: "against",
        description: "The source, module, or image to check against.",
        type: "string",
        enum: {
          bin: "Binary",
          dir: "Directory",
          git: "Git repository",
          json: "JSON",
          mod: "Buf module",
          protofile: "Protobuf file",
          tar: "Tarball",
          zip: "ZIP file"
        },
        multiple: false
      },
      {
        name: "against-config",
        description: "The file or data to use to configure the against source, module, or image.",
        type: "string",
        multiple: false
      },
      configFlag,
      disableSymlinksFlag,
      errorFormatFlag,
      excludeImportsFlag,
      excludePathFlag,
      {
        name: "limit-to-input-files",
        description: `Only run breaking change detection against the files in the input.

When set, the against input contains only the files in the input. This overrides the <code>--path</code> setting.`,
        multiple: false
      },
      pathFlag
    ]
  },
  {
    name: "build",
    description: "Build",
    arg: inputArg,
    flags: [
      {
        name: "as-file-descriptor-set",
        description: `Output as a <code>google.protobuf.FileDescriptorSet</code> instead of a Buf image.

Note that Buf images are wire compatible with <code>FileDescriptorSet</code>s, but this flag strips the additional metadata added for Buf usage.`,
        multiple: false
      },
      configFlag,
      disableSymlinksFlag,
      errorFormatFlag,
      excludeImportsFlag,
      excludePathFlag,
      {
        name: "exclude-source-info",
        description: "Exclude source info.",
        multiple: false
      },
      {
        name: "output",
        description: "The output location for the built Buf image.",
        type: "string",
        default: "/dev/null",
        enum: {
          bin: "Binary",
          json: "JSON"
        },
        multiple: false
      },
      {
        name: "type",
        description:
          "The types (message, enum, service) that should be included in this Buf image. When specified, the resulting image includes only the descriptors needed to describe the requested types.",
        type: "strings",
        docLink: {
          name: "Limit to specific types",
          url: "/build/usage#limit-to-specific-types"
        },
        multiple: true
      }
    ]
  },
  {
    name: "completion",
    description: "Shell auto-complete scripts",
    commands: [
      {
        name: "bash",
        description: "Generate auto-completion scripts for bash."
      },
      {
        name: "fish",
        description: "Generate auto-completion scripts for fish."
      },
      {
        name: "powershell",
        description: "Generate auto-completion scripts for Powershell."
      },
      {
        name: "zsh",
        description: "Generate auto-completion scripts for zsh."
      }
    ]
  },
  {
    name: "export",
    description: "Export",
    arg: inputArg,
    flags: [
      configFlag,
      disableSymlinksFlag,
      excludeImportsFlag,
      excludePathFlag,
      {
        name: "output",
        description: "The output directory for exported files.",
        short: "o",
        type: "string",
        multiple: false
      },
      {
        name: "path",
        description: `Limit to specific files or directories, such as <code>proto/a/a.proto</code> or <code>proto/a</code>.

If specified multiple times, the union is taken.`,
        multiple: false
      }
    ]
  },
  {
    name: "generate",
    description: "Generate code stubs",
    arg: inputArg,
    flags: [
      configFlag,
      disableSymlinksFlag,
      errorFormatFlag,
      excludePathFlag,
      {
        name: "include-imports",
        description: "Also generate all imports except for Well-Known Types.",
        multiple: false
      },
      {
        name: "include-wkt",
        description:
          "Also generate Well-Known Types. Can't be set without <code>--include-imports</code>.",
        multiple: false
      },
      {
        name: "ouput",
        description:
          "The base directory to generate to. This is prepended to the <code>out</code> directories in the generation template.",
        type: "string",
        default: ".",
        multiple: false
      },
      pathFlag,
      {
        name: "template",
        description:
          "The generation template file or data to use. Must be in either YAML or JSON format.",
        type: "string",
        multiple: false
      }
    ]
  },
  {
    name: "lint",
    description: "Lint Protobuf sources",
    arg: inputArg,
    flags: [configFlag, disableSymlinksFlag, errorFormatFlag, excludePathFlag, pathFlag]
  },
  {
    name: "ls-files",
    description: "List all Protobuf files for the input.",
    flags: [
      {
        name: "as-import-paths",
        description: "Strip local directory paths and print filepaths as they're imported.",
        multiple: false
      },
      configFlag,
      disableSymlinksFlag,
      errorFormatFlag,
      {
        name: "include-imports",
        description: "Include imports.",
        multiple: false
      }
    ]
  },
  {
    name: "mod",
    description: "Modules",
    commands: [
      {
        name: "clear-cache",
        description: ""
      },
      {
        name: "init",
        description: "",
        flags: [
          {
            name: "doc",
            description:
              "Write inline documentation in the form of comments in the resulting configuration <code>buf.yaml</code> file.",
            multiple: false
          }
        ]
      },
      {
        name: "ls-breaking-rules",
        description: "",
        flags: [allFlag, lsConfigFlag, formatFlag, lsVersionFlag]
      },
      {
        name: "ls-lint-rules",
        description: "",
        flags: [allFlag, lsConfigFlag, formatFlag, lsVersionFlag]
      },
      {
        name: "open",
        description: "",
        arg: directoryArg
      },
      {
        name: "prune",
        description: "",
        arg: directoryArg
      },
      {
        name: "update",
        description: "",
        arg: directoryArg,
        flags: [
          {
            name: "only",
            description:
              "The name of the dependency to update. When set, only this dependency is updated, along with any of its sub-dependencies.",
            type: "strings",
            multiple: true
          }
        ]
      }
    ]
  },
  {
    name: "push",
    description: "Push a module to the BSR.",
    arg: sourceArg,
    flags: [
      disableSymlinksFlag,
      errorFormatFlag,
      {
        name: "tag",
        description:
          "Create a tag for the pushed commit. Multiple tags are created if specified multiple times.",
        short: "t",
        type: "strings",
        multiple: true
      },
      {
        name: "track",
        description:
          "Append the pushed module to this track. Multiple tracks are appended if specified multiple times.",
        type: "strings",
        multiple: true
      }
    ]
  },
  {
    name: "registry",
    description: "Buf Schema Registry commands",
    commands: [
      {
        name: "login",
        description: `Log into the ${link("bsr", "Buf Schema Registry")}.`,
        flags: [
          {
            name: "token-stdin",
            description:
              "Read the BSR token from stdin. This command prompts for a token by default.",
            multiple: false
          },
          {
            name: "username",
            description: "Your BSR username. This command prompts for a username by default.",
            multiple: false
          }
        ]
      },
      {
        name: "logout",
        description: `Log out of the ${link("bsr", "Buf Schema Registry")}.`
      }
    ]
  }
];

export default Command;

export { commands, link };
