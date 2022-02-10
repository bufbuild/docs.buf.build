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
import isInternalUrl from '@docusaurus/isInternalUrl';
import Link from '@docusaurus/Link';
import { isSamePath, useAnnouncementBar, usePrevious, useThemeConfig } from '@docusaurus/theme-common';
import { translate } from '@docusaurus/Translate';
import styles from '@site/node_modules/@docusaurus/theme-classic/src/theme/DocSidebar/styles.module.css';
import useLockBodyScroll from '@theme/hooks/useLockBodyScroll';
import useScrollPosition from '@theme/hooks/useScrollPosition';
import useWindowSize, { windowSizes } from '@theme/hooks/useWindowSize';
import IconArrow from '@theme/IconArrow';
import IconExternalLink from '@theme/IconExternalLink';
import IconMenu from '@theme/IconMenu';
import Logo from '@theme/Logo';
import clsx from 'clsx';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { BufBadge, isSidebarItemWithBufBadge } from './buf-badge';
import bufStyles from './styles.module.css';
import { useExpandAll } from './use-expand-all';

import type { Props } from "@theme/DocSidebar";
const MOBILE_TOGGLE_SIZE = 24;

const isActiveSidebarItem = (item, activePath) => {
  if (item.type === "link") {
    return isSamePath(item.href, activePath);
  }
  if (item.type === "category") {
    return item.items.some((subItem) => isActiveSidebarItem(subItem, activePath));
  }
  return false;
};

// Optimize sidebar at each "level"
const DocSidebarItems = memo(function DocSidebarItems({ items, ...props }: any): JSX.Element {
  return items.map((item, index) => (
    <DocSidebarItem
      key={index} // sidebar is static, the index does not change
      item={item}
      {...props}
    />
  ));
});

function DocSidebarItem(props): JSX.Element {
  const { listenExpandAll, ...rest } = props;
  switch (props.item.type) {
    case "category":
      return <DocSidebarItemCategory listenExpandAll={listenExpandAll} {...rest} />;
    case "link":
    default:
      return <DocSidebarItemLink {...rest} />;
  }
}

function DocSidebarItemCategory({
  item,
  onItemClick,
  collapsible,
  activePath,
  listenExpandAll,
  ...props
}) {
  const { items, label } = item;

  const isActive = isActiveSidebarItem(item, activePath);
  const wasActive = usePrevious(isActive);

  // active categories are always initialized as expanded
  // the default (item.collapsed) is only used for non-active categories
  const [collapsed, setCollapsed] = useState(() => {
    if (!collapsible) {
      return false;
    }
    return isActive ? false : item.collapsed;
  });

  const menuListRef = useRef<HTMLUListElement>(null);
  const [menuListHeight, setMenuListHeight] = useState<string | undefined>(undefined);
  const handleMenuListHeight = (calc = true) => {
    setMenuListHeight(calc ? `${menuListRef.current?.scrollHeight}px` : undefined);
  };

  // If we navigate to a category, it should automatically expand itself
  useEffect(() => {
    const justBecameActive = isActive && !wasActive;
    if (justBecameActive && collapsed) {
      setCollapsed(false);
    }
  }, [isActive, wasActive, collapsed]);

  // If expand all (or collapse all) was emitted, we apply the state
  useEffect(
    () =>
      listenExpandAll((expanded: boolean) => {
        if (!menuListHeight) {
          handleMenuListHeight();
        }
        setTimeout(() => setCollapsed(!expanded), 100);
      }),
    []
  );

  const handleItemClick = useCallback(
    (e) => {
      e.preventDefault();

      if (!menuListHeight) {
        handleMenuListHeight();
      }

      setTimeout(() => setCollapsed((state) => !state), 100);
    },
    [menuListHeight]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <li
      className={clsx("menu__list-item", {
        "menu__list-item--collapsed": collapsed
      })}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a
        className={clsx("menu__link", bufStyles.menuLink, {
          "menu__link--sublist": collapsible,
          "menu__link--active": collapsible && isActive,
          [styles.menuLinkText]: !collapsible
        })}
        onClick={collapsible ? handleItemClick : undefined}
        href={collapsible ? "#" : undefined}
        {...props}>
        <span>
          {label}
          {isSidebarItemWithBufBadge(item) ? <BufBadge {...item.customProps.badge} /> : null}
        </span>
      </a>
      <ul
        className="menu__list"
        ref={menuListRef}
        style={{
          height: menuListHeight
        }}
        onTransitionEnd={() => {
          if (!collapsed) {
            handleMenuListHeight(false);
          }
        }}>
        <DocSidebarItems
          items={items}
          tabIndex={collapsed ? "-1" : "0"}
          onItemClick={onItemClick}
          collapsible={collapsible}
          activePath={activePath}
          listenExpandAll={listenExpandAll}
        />
      </ul>
    </li>
  );
}

function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  collapsible: _collapsible,
  ...props
}) {
  const { href, label } = item;
  const isActive = isActiveSidebarItem(item, activePath);
  return (
    <li className="menu__list-item" key={label}>
      <Link
        className={clsx("menu__link", bufStyles.menuLink, {
          "menu__link--active": isActive
        })}
        to={href}
        {...(isInternalUrl(href) && {
          isNavLink: true,
          exact: true,
          onClick: onItemClick
        })}
        {...props}>
        <span>
          {label}
          {!isInternalUrl(href) ? <IconExternalLink /> : null}
          {isSidebarItemWithBufBadge(item) ? <BufBadge {...item.customProps.badge} /> : null}
        </span>
      </Link>
    </li>
  );
}

function useShowAnnouncementBar() {
  const { isClosed } = useAnnouncementBar();
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(!isClosed);
  useScrollPosition(({ scrollY }) => {
    if (!isClosed) {
      setShowAnnouncementBar(scrollY === 0);
    }
  });
  return showAnnouncementBar;
}

function useResponsiveSidebar() {
  const [showResponsiveSidebar, setShowResponsiveSidebar] = useState(false);
  useLockBodyScroll(showResponsiveSidebar);

  const windowSize = useWindowSize();
  useEffect(() => {
    if (windowSize === windowSizes.desktop) {
      setShowResponsiveSidebar(false);
    }
  }, [windowSize]);

  const closeResponsiveSidebar = useCallback(
    (e) => {
      e.target.blur();
      setShowResponsiveSidebar(false);
    },
    [setShowResponsiveSidebar]
  );

  const toggleResponsiveSidebar = useCallback(() => {
    setShowResponsiveSidebar((value) => !value);
  }, [setShowResponsiveSidebar]);

  return {
    showResponsiveSidebar,
    closeResponsiveSidebar,
    toggleResponsiveSidebar
  };
}

function HideableSidebarButton({ onClick }) {
  return (
    <button
      type="button"
      title={translate({
        id: "theme.docs.sidebar.collapseButtonTitle",
        message: "Collapse sidebar",
        description: "The title attribute for collapse button of doc sidebar"
      })}
      aria-label={translate({
        id: "theme.docs.sidebar.collapseButtonAriaLabel",
        message: "Collapse sidebar",
        description: "The title attribute for collapse button of doc sidebar"
      })}
      className={clsx("button button--secondary button--outline", styles.collapseSidebarButton)}
      onClick={onClick}>
      <IconArrow className={styles.collapseSidebarButtonIcon} />
    </button>
  );
}

function ResponsiveSidebarButton({ responsiveSidebarOpened, onClick }) {
  return (
    <button
      aria-label={
        responsiveSidebarOpened
          ? translate({
              id: "theme.docs.sidebar.responsiveCloseButtonLabel",
              message: "Close menu",
              description: "The ARIA label for close button of mobile doc sidebar"
            })
          : translate({
              id: "theme.docs.sidebar.responsiveOpenButtonLabel",
              message: "Open menu",
              description: "The ARIA label for open button of mobile doc sidebar"
            })
      }
      aria-haspopup="true"
      className="button button--secondary button--sm menu__button"
      type="button"
      onClick={onClick}>
      {responsiveSidebarOpened ? (
        <span className={clsx(styles.sidebarMenuIcon, styles.sidebarMenuCloseIcon)}>&times;</span>
      ) : (
        <IconMenu
          className={styles.sidebarMenuIcon}
          height={MOBILE_TOGGLE_SIZE}
          width={MOBILE_TOGGLE_SIZE}
        />
      )}
    </button>
  );
}

function DocSidebar({
  path,
  sidebar,
  sidebarCollapsible = true,
  onCollapse,
  isHidden
}: Props): JSX.Element | null {
  const showAnnouncementBar = useShowAnnouncementBar();
  const {
    navbar: { hideOnScroll },
    hideableSidebar
  } = useThemeConfig();
  const { isClosed: isAnnouncementBarClosed } = useAnnouncementBar();

  const { showResponsiveSidebar, closeResponsiveSidebar, toggleResponsiveSidebar } =
    useResponsiveSidebar();

  const [emitExpandAll, listenExpandAll] = useExpandAll();

  return (
    <div
      className={clsx(styles.sidebar, {
        [styles.sidebarWithHideableNavbar]: hideOnScroll,
        [styles.sidebarHidden]: isHidden
      })}>
      {hideOnScroll && <Logo tabIndex={-1} className={styles.sidebarLogo} />}
      <nav
        className={clsx("menu", "menu--responsive", "thin-scrollbar", styles.menu, {
          "menu--show": showResponsiveSidebar,
          [styles.menuWithAnnouncementBar]: !isAnnouncementBarClosed && showAnnouncementBar
        })}
        aria-label={translate({
          id: "theme.docs.sidebar.navAriaLabel",
          message: "Sidebar navigation",
          description: "The ARIA label for documentation menu"
        })}>
        <ResponsiveSidebarButton
          responsiveSidebarOpened={showResponsiveSidebar}
          onClick={toggleResponsiveSidebar}
        />

        <div className={bufStyles.expandAllControls}>
          <button onClick={() => emitExpandAll(true)}>expand all</button>
          <button onClick={() => emitExpandAll(false)}>collapse all</button>
        </div>

        <ul className="menu__list">
          <DocSidebarItems
            items={sidebar}
            onItemClick={closeResponsiveSidebar}
            collapsible={sidebarCollapsible}
            activePath={path}
            listenExpandAll={listenExpandAll}
          />
        </ul>
      </nav>
      {hideableSidebar && <HideableSidebarButton onClick={onCollapse} />}
    </div>
  );
}

export default DocSidebar;
