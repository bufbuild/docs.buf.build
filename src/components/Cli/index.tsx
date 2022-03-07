import React from 'react';

import { args } from './args';
import Command, { commands } from './commands';
import styles from './styles.module.css';

type Props = {
  parent?: string;
  cmd: Command;
};

const Html = ({ text }: { text: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: text }} />;
};

const CommandEl = ({ parent, cmd }: Props) => {
  const name: string = parent ? `${parent} ${cmd.name}` : cmd.name;
  const id = name.replace(/ /g, "_");
  const href = `#${id}`;

  return (
    <div className={styles.cli} id={id}>
      <div className={styles.commandTitle}>
        <a href={href}>{name}</a>

        {cmd.arg && (
          <>
            {" "}
            {"<"}
            <a href={`#arg-${cmd.arg.name}`}>{cmd.arg.name}</a>
            {">"}
          </>
        )}

        {cmd.args && (
          <span>
            {cmd.args.map((arg) => (
              <>
                {" "}
                {"<"}
                <a href={`#arg-${arg.name}`}>{arg.name}</a>
                {">"}
              </>
            ))}
          </span>
        )}
      </div>

      <Html text={cmd.description} />

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

      <div>
        <h2>Arguments</h2>

        <div>
          {args.map((arg) => (
            <div id={`arg-${arg.name}`}>
              <a href={`#arg-${arg.name}`}>
                <code>{arg.name}</code>
              </a>

              <Html text={arg.description} />

              {arg.default && (
                <p>
                  Default: <code>{arg.default}</code>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cli;
