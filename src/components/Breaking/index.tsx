import clsx from 'clsx';
import React from 'react';

type Props = {
  feature: string;
  version: string;
};

const Breaking = ({ feature, version }: Props) => {
  return (
    <div className={clsx("admonition", "admonition-warning", "alert", "alert--warning")}>
      <h5 className="admonition-heading">Breaking changes</h5>

      <p>
        {feature} is currently in <strong>{version}</strong>. Although you're free to experiment
        with it, be aware that Buf may introduce breaking changes that could impact your workflows.
      </p>
    </div>
  );
};

export default Breaking;
