import clsx from 'clsx';
import React from 'react';

type Props = {
  subject: string;
  projects: string[];
};

const projectUrl = (project: string): string => {
  return `https://github.com/bufbuild/buf-examples/tree/main/${project}`;
};

const Examples = ({ subject, projects }: Props) => {
  const multiple = projects.length > 1;
  const title = `Example project${multiple ? "s" : ""}`;

  return (
    <div className={clsx("admonition", "admonition-info", "alert", "alert--info")}>
      <h5 className="admonition-heading">{title}</h5>

      {!multiple && (
        <p>
          For a more practical look at {subject}, see the{" "}
          <a href={projectUrl(projects[0])} target="_blank" rel="noreferrer">
            <code>{projects[0]}</code>
          </a>{" "}
          example project.
        </p>
      )}

      {multiple && (
        <>
          <p>For a more practical look at {subject}, see these example projects:</p>

          <ul>
            {projects.map((project) => (
              <li>
                <a href={projectUrl(project)} target="_blank" rel="noreferrer">
                  <code>{project}</code>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Examples;
