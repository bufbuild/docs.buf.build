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
import { NavbarItem as ConfigNavbarItem, useThemeConfig } from "@docusaurus/theme-common";
import useHideableNavbar from "@theme/hooks/useHideableNavbar";
import useLockBodyScroll from "@theme/hooks/useLockBodyScroll";
import useThemeContext from "@theme/hooks/useThemeContext";
import useWindowSize, { windowSizes } from "@theme/hooks/useWindowSize";
import IconMenu from "@theme/IconMenu";
import Logo from "@theme/Logo";
import NavbarItem from "@theme/NavbarItem";
import SearchBar from "@theme/SearchBar";
import Toggle from "@theme/Toggle";
import clsx from "clsx";
import React, { useCallback, useEffect, useState } from "react";

import styles from "./styles.module.css";

// retrocompatible with v1
const DefaultNavItemPosition = "right";

// If split links by left/right
// if position is unspecified, fallback to right (as v1)
function splitNavItemsByPosition(items) {
  const leftItems = items.filter((item) => (item.position ?? DefaultNavItemPosition) === "left");
  const rightItems = items.filter((item) => (item.position ?? DefaultNavItemPosition) === "right");
  return {
    leftItems,
    rightItems
  };
}

function Navbar(): JSX.Element {
  const {
    navbar: { items, hideOnScroll, style },
    colorMode: { disableSwitch: disableColorModeSwitch }
  } = useThemeConfig();
  const [sidebarShown, setSidebarShown] = useState(false);
  const { isDarkTheme, setLightTheme, setDarkTheme } = useThemeContext();
  const { navbarRef, isNavbarVisible } = useHideableNavbar(hideOnScroll);

  useLockBodyScroll(sidebarShown);

  const showSidebar = useCallback(() => {
    setSidebarShown(true);
  }, [setSidebarShown]);
  const hideSidebar = useCallback(() => {
    setSidebarShown(false);
  }, [setSidebarShown]);

  const onToggleChange = useCallback(
    (e) => (e.target.checked ? setDarkTheme() : setLightTheme()),
    [setLightTheme, setDarkTheme]
  );

  const windowSize = useWindowSize();

  useEffect(() => {
    if (windowSize === windowSizes.desktop) {
      setSidebarShown(false);
    }
  }, [windowSize]);

  const hasSearchNavbarItem = items.some((item) => item.type === "search");
  const { leftItems, rightItems } = splitNavItemsByPosition(items);
  const bufSidebarItems = bufSplitSidebarNavItems(items);

  return (
    <nav
      ref={navbarRef}
      className={clsx("navbar", "navbar--fixed-top", styles.bufColors, {
        "navbar--dark": style === "dark",
        "navbar--primary": style === "primary",
        "navbar-sidebar--show": sidebarShown,
        [styles.navbarHideable]: hideOnScroll,
        [styles.navbarHidden]: hideOnScroll && !isNavbarVisible
      })}
    >
      <div className="navbar__inner">
        <div className="navbar__items">
          {items != null && items.length !== 0 && (
            <button
              aria-label="Navigation bar toggle"
              className={clsx("navbar__toggle clean-btn", styles.movedToggleButton)}
              type="button"
              tabIndex={0}
              onClick={showSidebar}
              onKeyDown={showSidebar}
            >
              <IconMenu />
            </button>
          )}
          <Logo
            className="navbar__brand"
            imageClassName="navbar__logo"
            titleClassName="navbar__title"
          />
          {leftItems.map((item, i) => (
            <NavbarItem {...item} key={i} />
          ))}
        </div>
        <div className="navbar__items navbar__items--right">
          {rightItems.map((item, i) => (
            <NavbarItem {...item} key={i} />
          ))}
          {!disableColorModeSwitch && (
            <Toggle
              className={styles.displayOnlyInLargeViewport}
              checked={isDarkTheme}
              onChange={onToggleChange}
            />
          )}
          {!hasSearchNavbarItem && <SearchBar />}
        </div>
      </div>
      <div role="presentation" className="navbar-sidebar__backdrop" onClick={hideSidebar} />
      <div className={clsx("navbar-sidebar", styles.bufNavbarSidebar)}>
        {/* We do not want the logo to show here */}
        {/*<div className="navbar-sidebar__brand">*/}
        {/*<Logo*/}
        {/*  className="navbar__brand"*/}
        {/*  imageClassName="navbar__logo"*/}
        {/*  titleClassName="navbar__title"*/}
        {/*  onClick={hideSidebar}*/}
        {/*/>*/}
        {!disableColorModeSwitch && sidebarShown && (
          <Toggle checked={isDarkTheme} onChange={onToggleChange} />
        )}
        {/*</div>*/}
        <div className={styles.bufNavbarSidebarHeader}>
          <span>Menu</span>
          <button onClick={hideSidebar} />
        </div>
        <div className="navbar-sidebar__items">
          <div className="menu">
            <ul className="menu__list">
              {bufSidebarItems.items.map((item, i) => (
                <NavbarItem mobile {...(item as any)} onClick={hideSidebar} key={i} />
              ))}
            </ul>
          </div>
          {/* If the navbar contains two items with the labels "Slack" and "Github", we render them separately. */}
          <div className="menu">
            <ul className={clsx("menu__list", styles.bufNavbarSidebarSocialList)}>
              {bufSidebarItems.slack ? (
                <NavbarItem mobile {...(bufSidebarItems.slack as any)} onClick={hideSidebar} />
              ) : null}
              {bufSidebarItems.github ? (
                <NavbarItem mobile {...(bufSidebarItems.github as any)} onClick={hideSidebar} />
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

function bufSplitSidebarNavItems(items: ConfigNavbarItem[]): {
  items: ConfigNavbarItem[];
  slack?: ConfigNavbarItem;
  github?: ConfigNavbarItem;
} {
  const slack = items.find((item) => (item.label ?? "").toLowerCase() === "slack");
  const github = items.find((item) => (item.label ?? "").toLowerCase() === "github");
  if (!slack || !github) {
    return { items, slack: undefined, github: undefined };
  }
  return {
    items: items.filter((item) => item !== slack && item !== github),
    slack,
    github
  };
}

export default Navbar;
