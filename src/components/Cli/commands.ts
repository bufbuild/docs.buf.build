import { Command } from '.';


const links: Record<string, string> = {
  bsr: "/bsr/overview",
};

const link = (name: string, text?: string): string => {
  const txt = (text) ? text : name;
  return `<a href="${links[name]}">${txt}</a>`
}

export const commands: Command[] = [
  {
    name: "beta",
    description: "Beta commands. Unstable and likely to change.",
    commands: [
      {
        name: "convert",
        description: "Use a source reference to convert a binary or JSON-serialized message supplied through stdin or the input flag."
      },
      {
        name: "migrate-v1beta1",
        description: "Migrate any v1beta1 configuration files in the current directory to the latest version."
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
                description: ""
              },
              {
                name: "list",
                description: ""
              }
            ]
          },
          {
            name: "organization",
            description: "",
            commands: [
              {
                name: "create",
                description: ""
              },
              {
                name: "delete",
                description: ""
              },
              {
                name: "get",
                description: ""
              }
            ]
          },
          {
            name: "plugin",
            description: "",
            commands: [
              {
                name: "create",
                description: ""
              },
              {
                name: "delete",
                description: ""
              },
              {
                name: "deprecate",
                description: ""
              },
              {
                name: "list",
                description: ""
              },
              {
                name: "undeprecate",
                description: ""
              },
              {
                name: "version",
                description: ""
              }
            ]
          },
          {
            name: "repository",
            description: "",
            commands: [
              {
                name: "create",
                description: ""
              },
              {
                name: "delete",
                description: ""
              },
              {
                name: "deprecate",
                description: ""
              },
              {
                name: "get",
                description: ""
              },
              {
                name: "list",
                description: ""
              },
              {
                name: "undeprecate",
                description: ""
              }
            ]
          },
          {
            name: "tag",
            description: "",
            commands: [
              {
                name: "create",
                description: ""
              },
              {
                name: "list",
                description: ""
              }
            ]
          },
          {
            name: "template",
            description: "",
            commands: [
              {
                name: "create",
                description: ""
              },
              {
                name: "delete",
                description: ""
              },
              {
                name: "deprecate",
                description: ""
              },
              {
                name: "list",
                description: ""
              },
              {
                name: "undeprecate",
                description: ""
              },
              {
                name: "version",
                description: ""
              }
            ]
          },
          {
            name: "track",
            description: "",
            commands: [
              {
                name: "delete",
                description: ""
              },
              {
                name: "list",
                description: ""
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "breaking",
    description: "Breaking change detection"
  },
  {
    name: "build",
    description: "Build"
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
    description: "Export"
  },
  {
    name: "lint",
    description: "Lint Protobuf sources"
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
        description: ""
      },
      {
        name: "prune",
        description: ""
      },
      {
        name: "update",
        description: ""
      }
    ]
  },
  {
    name: "push",
    description: "Push a module to the BSR."
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
