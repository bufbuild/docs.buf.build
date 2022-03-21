import React from 'react';

import Arg, { args } from './args';
import Command, { commands } from './commands';
import styles from './styles.module.css';

type CommandProps = {
  parent?: string;
  cmd: Command;
};

const Html = ({ text }: { text: string }) => {
  return <div className={styles.rawHtml} dangerouslySetInnerHTML={{ __html: text }} />;
};

const Cmd = ({ parent, cmd }: CommandProps) => {
  const name: string = parent ? `${parent} ${cmd.name}` : cmd.name;
  const id = name.replace(/ /g, "_");
  const href = `#${id}`;

  return (
    <div className={styles.cli} id={id}>
      <div className={styles.commandTitle}>
        <span className={styles.command}>
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
        </span>
      </div>

      <Html text={cmd.description} />

      {cmd.commands && (
        <div className={styles.commandList}>
          {cmd.commands.map((cmd) => (
            <Cmd cmd={cmd} parent={name} />
          ))}
        </div>
      )}
    </div>
  );
};

const Argument = ({ name, description, argDefault }: Arg) => {
  const id = `arg-${name}`;
  const href = `#arg-${name}`;

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Argument</th>
            <th>Description</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>

      <div id={id} className={styles.argument}>
        <a href={href}>
          <code>{name}</code>
        </a>

        <Html text={description} />

        {argDefault && (
          <div className={styles.default}>
            <span>
              Default: <code>{argDefault}</code>
            </span>
          </div>
        )}
      </div>
    </>
  );
};

const Cli = () => {
  return (
    <>
      <div className={styles.commandList}>
        {commands.map((cmd) => (
          <Cmd cmd={cmd} parent="buf" />
        ))}
      </div>

      <div className={styles.arguments}>
        <h2>Arguments</h2>

        <div>
          <table>
            <thead>
              <tr>
                <th>Argument</th>
                <th>Description</th>
                <th>Default</th>
              </tr>
            </thead>
            <tbody>
              {args.map((arg) => (
                <tr>
                  <td>
                    <a id={`arg-${arg.name}`}></a>
                    <code>{arg.name}</code>
                  </td>
                  <td>
                    <Html text={arg.description} />
                  </td>
                  <td>{arg.argDefault && <code>{arg.argDefault}</code>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Cli;
