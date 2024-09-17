import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { DrawerItem } from '@scaleflex/ui/core/drawer';
import { useStore } from 'hooks';
import { SELECT_TAB } from 'actions';
import { AVAILABLE_TABS } from './Tabs.constants';
import Tab from './Tab';


const Tabs = ({ toggleMainMenu, isDrawer }) => {

  const {
    tabId = null,
    dispatch,
    config: { defaultTabId, useCloudImage },
  } = useStore();

  const currentTabId = tabId || defaultTabId;

  const selectTab = useCallback((newTabId) => {
    dispatch({
      type: SELECT_TAB,
      payload: {
        tabId: newTabId,
      },
    });
    toggleMainMenu(false);
  }, []);

  const createTab = ({ id, label, title, icon }) => (
    <Tab
      key={id}
      id={id}
      label={label}
      title={title}
      icon={icon}
      isSelected={currentTabId === id}
      onClick={selectTab}
    />
  );

  return (
    <>
      {AVAILABLE_TABS.map((tab) =>
        isDrawer ? (
          <DrawerItem key={tab.id}>{createTab(tab)}</DrawerItem>
        ) : (
            createTab(tab)
        ),
      )}
    </>
  );
};

Tabs.defaultProps = {
  toggleMainMenu: () => {},
  isDrawer: false,
};

Tabs.propTypes = {
  toggleMainMenu: PropTypes.func,
  isDrawer: PropTypes.bool,
};

export default Tabs;