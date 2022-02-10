import clsx from 'clsx';
import React from 'react';

import styles from './buf-badge.module.css';

export interface BufBadge {
  label: string;
  severity: "danger" | "warning" | "neutral" | "info";
}

export function isSidebarItemWithBufBadge<T>(
  item: T
): item is T & { customProps: { badge: BufBadge } } {
  if (typeof item !== "object" || item === null || !("customProps" in item)) {
    return false;
  }
  const customProps = (item as any).customProps;
  if (typeof customProps !== "object" || customProps === null || !("badge" in customProps)) {
    return false;
  }
  const badge = customProps.badge;
  return (
    typeof badge === "object" &&
    badge !== null &&
    typeof badge.label === "string" &&
    ["danger", "warning", "neutral", "info"].includes(badge.severity)
  );
}

export function BufBadge(props: BufBadge): JSX.Element {
  return (
    <span
      className={clsx({
        [styles.badge]: true,
        [styles.danger]: props.severity === "danger",
        [styles.warning]: props.severity === "warning",
        [styles.neutral]: props.severity === "neutral",
        [styles.info]: props.severity === "info"
      })}>
      {props.label}
    </span>
  );
}
