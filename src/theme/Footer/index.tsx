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
import Link, { LinkProps } from "@docusaurus/Link";
import { FooterLinkItem, useThemeConfig } from "@docusaurus/theme-common";
import useBaseUrl from "@docusaurus/useBaseUrl";
import React, { PropsWithChildren } from "react";

import IconMail from "./icon-envelope--gray.svg";
import IconLinkedIn from "./icon-linkedin--gray.svg";
import IconTwitter from "./icon-twitter--gray.svg";
import styles from "./styles.module.css";

const linkGroupTitleSocial = "Social";
const linkGroupTitleLegal = "Legal";

function FooterLink(
  props: PropsWithChildren<FooterLinkItem & { className?: string; ariaLabel?: string }>
): JSX.Element {
  const linkProps: {
    href?: LinkProps["href"];
    to?: LinkProps["to"];
  } = {};
  if (props.to) {
    linkProps.to = useBaseUrl(props.to);
  }
  if (props.href) {
    if (props.prependBaseUrlToHref) {
      linkProps.href = useBaseUrl(props.href, { forcePrependBaseUrl: true });
    } else {
      linkProps.href = props.href;
    }
  }
  return (
    <Link {...linkProps} aria-label={props.ariaLabel} className={props.className}>
      {props.children}
    </Link>
  );
}

function SocialFooterLink(props: FooterLinkItem): JSX.Element {
  let icon = undefined;
  if (props.href && props.href.startsWith("mailto:")) {
    icon = <IconMail />;
  } else if (props.href && props.href.includes("twitter.com")) {
    icon = <IconTwitter />;
  } else if (props.href && props.href.includes("linkedin.com")) {
    icon = <IconLinkedIn />;
  }
  let ariaLabel = undefined;
  if (icon !== undefined) {
    ariaLabel = props.label;
  }
  return (
    <FooterLink {...props} ariaLabel={ariaLabel} className={styles.xx}>
      {icon || props.label || props.html}
    </FooterLink>
  );
}

function LegalFooterLink(props: FooterLinkItem): JSX.Element {
  return (
    <FooterLink {...props} className={styles.legalLink}>
      {props.label || props.html}
    </FooterLink>
  );
}

function Footer(): JSX.Element | null {
  const { footer } = useThemeConfig();

  const { copyright, links: linkGroups = [] } = footer || {};

  const socialLinks = linkGroups.filter((g) => g.title === linkGroupTitleSocial)[0]?.items;
  const legalLinks = linkGroups.filter((g) => g.title === linkGroupTitleLegal)[0]?.items;

  if (!footer) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.socialGroup}>
          {socialLinks.map((item: FooterLinkItem, index: number) => {
            return (
              <div key={index}>
                <SocialFooterLink {...item} />
              </div>
            );
          })}
        </div>

        <div className={styles.legalGroup}>
          {legalLinks.map((item: FooterLinkItem, index: number) => {
            return (
              <div key={index}>
                <LegalFooterLink {...item} />
              </div>
            );
          })}
        </div>

        <div
          className={styles.copyright}
          // Developer provided the HTML, so assume it's safe.
          // eslint-disable-next-line react/no-danger
          // ^^^ comment by FB
          dangerouslySetInnerHTML={{
            __html: copyright
          }}
        />
      </div>
    </footer>
  );
}

export default Footer;
