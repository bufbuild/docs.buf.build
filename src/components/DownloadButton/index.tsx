import React from "react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './styles.module.css';

export const mac = "buf-Darwin-x86_64";
export const linux = "buf-Linux-x86_64";
export const windows = "buf-Windows-x86_64.exe";

type Props = {
  os: string;
  children: JSX.Element;
};

const DownloadButton = ({ children, os }: Props) => {
  // siteConfig and customFields configured in the docusaurus.config.js
  const { siteConfig } = useDocusaurusContext();
  const { downloadRelease } = siteConfig && siteConfig.customFields;

  return (
    <a
      className={`button button--primary button--lg ${styles.bufButton}`}
      href={`https://github.com/bufbuild/buf/releases/download/v${downloadRelease}/${os}`}
    >
      <span className={styles.header}>Download</span>
      {children}
    </a>
  );
};

export default DownloadButton;
