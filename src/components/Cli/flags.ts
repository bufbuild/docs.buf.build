type Flag = {
  name: string;
  short?: string;
  description: string;
  type?: string;
  default?: string;
  enum?: Record<string, string>;
  docLink?: {
    name: string;
    url: string;
  };
  multiple: boolean;
};

const allFlag: Flag = {
  name: "all",
  description: "List all available rules and not just those currently configured.",
  multiple: false
};

const configFlag: Flag = {
  name: "config",
  description: "The file or data to use for configuration.",
  type: "string",
  multiple: false
};

const debugFlag: Flag = {
  name: "debug",
  description: "Turn on debug logging.",
  multiple: false
};

const disableSymlinksFlag: Flag = {
  name: "disable-symlinks",
  description: "Do not follow symlinks when reading sources or configuration from the filesystem.",
  multiple: false
};

const errorFormatFlag: Flag = {
  name: "error-format",
  description: "The format for build errors printed to stderr.",
  type: "string",
  default: "text",
  enum: {
    text: "Plaintext output",
    json: "JSON output",
    msvs: "MSVS"
  },
  multiple: false
};

const excludeImportsFlag: Flag = {
  name: "exclude-imports",
  description: "Exclude imports from breaking change detection.",
  multiple: false
};

const excludePathFlag: Flag = {
  name: "exclude-path",
  description: `Exclude specific files or directories, such as <code>/proto/a/a.proto</code> or <code>proto/a</code>.
        
If specified more than once, the union is taken.`,
  type: "strings",
  multiple: true
};

const forceFlag: Flag = {
  name: "force",
  description: "Force deletion without confirming. Use with caution.",
  multiple: false
};

const formatFlag: Flag = {
  name: "format",
  description: "The output format to use.",
  type: "string",
  default: "text",
  enum: {
    text: "Plaintext output",
    json: "JSON output"
  },
  multiple: false
};

const inputFlag: Flag = {
  name: "input",
  description: "The location to read the input message.",
  type: "string",
  default: "-",
  enum: {
    bin: "Binary",
    json: "JSON"
  },
  multiple: false
};

const logFormatFlag: Flag = {
  name: "log-format",
  description: "The log format.",
  type: "string",
  default: "color",
  enum: {
    text: "Plaintext output",
    color: "Colored text output",
    json: "JSON output"
  },
  multiple: false
};

const lsConfigFlag: Flag = {
  name: "config",
  description:
    "The file or data to use for configuration. Ignored if <code>--all</code> or <code>--version</code> is specified.",
  multiple: false
};

const lsVersionFlag: Flag = {
  name: "version",
  description:
    "List all the rules for the given configuration version. Implies <code>--all</code>.",
  type: "string",
  enum: {
    v1beta1: "Version v1beta1.",
    v1: "Version v1."
  },
  multiple: false
};

const messageFlag: Flag = {
  name: "message",
  description: "The message to display with deprecation warnings.",
  type: "string",
  multiple: false
};

const outputFlag: Flag = {
  name: "output",
  description: "The location to write the converted result to.",
  type: "string",
  default: "-",
  enum: {
    bin: "Binary",
    json: "JSON"
  },
  multiple: false
};

const pageSizeFlag: Flag = {
  name: "page-size",
  description: "The page size",
  type: "uint32",
  default: "10",
  multiple: false
};

const pageTokenFlag: Flag = {
  name: "page-token",
  description:
    "The page token. If more results are available, a <code>next_page</code> key is present in the <code>--format=json</code> output.",
  type: "string",
  multiple: false
};

const pathFlag: Flag = {
  name: "path",
  description: `Limit to specific files or directories, such as <code>proto/a/a.proto</code> or <code>proto/a</code>.

If specified multiple times, the union is taken.`,
  type: "strings",
  multiple: true
};

const reverseFlag: Flag = {
  name: "reverse",
  description: "Reverse the results.",
  multiple: false
};

const templateConfigFlag: Flag = {
  name: "config",
  description:
    "The template file or data to use for configuration. Must be in either YAML or JSON format.",
  type: "string",
  multiple: false
};

const timeoutFlag: Flag = {
  name: "timeout",
  description: "The duration until timing out.",
  type: "duration",
  default: "2m0s",
  multiple: false
};

const typeFlag: Flag = {
  name: "type",
  description:
    "The full type name of the serialized message, such as <code>acme.weather.v1.Units</code>.",
  type: "string",
  multiple: false
};

const verboseFlag: Flag = {
  name: "verbose",
  short: "v",
  description: "Turn on verbose mode.",
  multiple: false
};

const visibilityFlag = (asset: string): Flag => {
  return {
    name: "visibility",
    description: `The ${asset}'s visibility setting.`,
    type: "string",
    enum: {
      public: "Make the asset publicly available.",
      private: "Make the asset only private available."
    },
    multiple: false
  };
};

const globalFlags: Flag[] = [debugFlag, logFormatFlag, timeoutFlag, verboseFlag];

export default Flag;

export {
  allFlag,
  configFlag,
  debugFlag,
  disableSymlinksFlag,
  errorFormatFlag,
  excludeImportsFlag,
  excludePathFlag,
  forceFlag,
  formatFlag,
  inputFlag,
  logFormatFlag,
  lsConfigFlag,
  lsVersionFlag,
  messageFlag,
  outputFlag,
  pageSizeFlag,
  pageTokenFlag,
  pathFlag,
  reverseFlag,
  templateConfigFlag,
  timeoutFlag,
  typeFlag,
  verboseFlag,
  visibilityFlag,
  // Grouped tags
  globalFlags
};
