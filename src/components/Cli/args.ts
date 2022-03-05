import { link } from './links';

type Arg = {
  name: string;
  description: string;
  default?: string;
};

const commitArg: Arg = {
  name: "commit",
  description: "BSR commit"
};

const directoryArg: Arg = {
  name: "directory",
  description: "A directory.",
  default: "."
};

const inputArg: Arg = {
  name: "input",
  description: `The ${link("inputs", "Buf input")}.`,
  default: "."
};

const moduleArg: Arg = {
  name: "module",
  description: "A reference to a Buf module."
};

const organizationArg: Arg = {
  name: "organization",
  description: "The BSR organization."
};

const pluginArg: Arg = {
  name: "plugin",
  description: "The BSR plugin."
};

const referenceArg: Arg = {
  name: "reference",
  description: "A reference."
};

const registryArg: Arg = {
  name: "registry",
  description: "The schema registry.",
  default: "buf.build"
};

const repositoryArg: Arg = {
  name: "repository",
  description: "The BSR repository."
};

const sourceArg: Arg = {
  name: "source",
  description: "A Buf source."
};

const tagArg: Arg = {
  name: "tag",
  description: "A BSR tag."
};

const templateArg: Arg = {
  name: "template",
  description: "A BSR code generation template."
};

const trackArg: Arg = {
  name: "track",
  description: "A BSR track."
};

const args: Arg[] = [
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
];

export default Arg;

export {
  args,
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
}
