/**
 * This file is a swizzled and wrapped component, generated and adapted from the
 * docusaurus source code, copyright of Facebook, Inc.
 *
 * The adapted content is licensed under the MIT licence; and the licence can be
 * found at https://github.com/facebook/docusaurus/blob/master/LICENSE
 *
 * To learn more about component swizzling, see:
 * https://docusaurus.io/docs/using-themes#wrapping-theme-components
 *
 * For original sources see:
 * https://github.com/facebook/docusaurus/tree/v2.0.0-beta.3/packages/docusaurus-theme-classic/src/theme
 */
import OriginalLogo from "@theme-original/Logo";
import type { Props } from "@theme/Logo";
import React from "react";

import styles from "./styles.module.css";

function Logo(props: Props): JSX.Element | null {
  return (
    <div className={styles.swizzled}>
      <OriginalLogo {...props} />
    </div>
  );
}

export default Logo;
