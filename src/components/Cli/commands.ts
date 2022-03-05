import {
  Arg,
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
  trackArg,
} from './args';
import { link } from './links';

type Command = {
  name: string;
  description: string;
  arg?: Arg;
  args?: Arg[];
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
        arg: sourceArg
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
                arg: referenceArg
              },
              {
                name: "list",
                description: "",
                arg: moduleArg,
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
              },
              {
                name: "delete",
                description: "",
                arg: organizationArg,
              },
              {
                name: "get",
                description: "",
                arg: organizationArg,
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
              },
              {
                name: "delete",
                description: "",
                arg: pluginArg,
              },
              {
                name: "deprecate",
                description: "",
                arg: pluginArg,
              },
              {
                name: "list",
                description: "",
                arg: registryArg,
              },
              {
                name: "undeprecate",
                description: "",
                arg: pluginArg,
              },
              {
                name: "version",
                description: "",
                commands: [
                  {
                    name: "list",
                    description: "List versions.",
                    arg: pluginArg,
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
              },
              {
                name: "delete",
                description: "",
                arg: repositoryArg,
              },
              {
                name: "deprecate",
                description: "",
                arg: repositoryArg,
              },
              {
                name: "get",
                description: "",
                arg: repositoryArg,
              },
              {
                name: "list",
                description: "",
                arg: registryArg,
              },
              {
                name: "undeprecate",
                description: "",
                arg: repositoryArg,
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
                args: [commitArg, tagArg],
              },
              {
                name: "list",
                description: "",
                arg: repositoryArg,
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
              },
              {
                name: "delete",
                description: "",
                arg: templateArg,
              },
              {
                name: "deprecate",
                description: "",
                arg: templateArg
              },
              {
                name: "list",
                description: "",
                arg: registryArg
              },
              {
                name: "undeprecate",
                description: "",
                arg: templateArg,
              },
              {
                name: "version",
                description: "",
                commands: [
                  {
                    name: "create",
                    description: "Create a new template version",
                    arg: templateArg
                  },
                  {
                    name: "list",
                    description: "List versions for the specified template.",
                    arg: templateArg,
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
              },
              {
                name: "list",
                description: "",
                arg: repositoryArg,
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
  },
  {
    name: "build",
    description: "Build",
    arg: inputArg
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
    arg: inputArg
  },
  {
    name: "generate",
    description: "Generate code stubs",
    arg: inputArg
  },
  {
    name: "lint",
    description: "Lint Protobuf sources",
    arg: inputArg
  },
  {
    name: "ls-files",
    description: "List all Protobuf files for the input."
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
        description: ""
      },
      {
        name: "ls-breaking-rules",
        description: ""
      },
      {
        name: "ls-lint-rules",
        description: ""
      },
      {
        name: "open",
        description: "",
        arg: directoryArg,
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
      }
    ]
  },
  {
    name: "push",
    description: "Push a module to the BSR.",
    arg: sourceArg
  },
  {
    name: "registry",
    description: "Buf Schema Registry commands",
    commands: [
      {
        name: "login",
        description: ""
      },
      {
        name: "logout",
        description: ""
      }
    ]
  }
];

export {
  Command,
  commands,
  link
}
