import React from 'react';

import { commands } from './commands';
import styles from './styles.module.css';

export type Command = {
  name: string;
  description: string;
  commands?: Command[];
};

type Props = {
  parent?: string;
  cmd: Command;
};

const CommandEl = ({ parent, cmd }: Props) => {
  const name: string = parent ? `${parent} ${cmd.name}` : cmd.name;
  const id = name.replace(/ /g, "_");

  return (
    <div className={styles.cli}>
      <div className={styles.commandTitle}>
        <a id={id} href={`#${id}`}>
          <code>{name}</code>
        </a>
      </div>

      <div dangerouslySetInnerHTML={{ __html: cmd.description }} />

      {cmd.commands && (
        <div className={styles.commandList}>
          {cmd.commands.map((cmd) => (
            <CommandEl cmd={cmd} parent={name} />
          ))}
        </div>
      )}
    </div>
  );
};

const Cli = () => {
  return (
    <div className={styles.cli}>
      <p className={styles.title}>
        The <code>buf</code> command-line interface
      </p>

      <div className={styles.commandList}>
        {commands.map((cmd) => (
          <CommandEl cmd={cmd} parent="buf" />
        ))}
      </div>
    </div>
  );
};

export default Cli;
