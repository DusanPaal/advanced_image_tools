/** External Dependencies */
import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@scaleflex/ui/theme/hooks';

/** Internal Dependencies */
import { useAppReducer } from 'hooks';
import appReducer from './appReducer';
import AppContext from './AppContext';
import getInitialAppState from './getInitialAppState';

let isFieMounted = true;

const AppProvider = ({ children, config = {} }) => {
  const [state, _dispatch] = useAppReducer(
    appReducer,
    getInitialAppState(config),
    config,
  );

  useEffect(() => {
    isFieMounted = true;

    return () => {
      isFieMounted = false;
    };
  }, []);

  const dispatch = useCallback(
    (...args) => {
      if (isFieMounted) {
        _dispatch(...args);
      }
    },
    [_dispatch],
  );


  const theme = useTheme();
  const providedValue = useMemo(
    () => ({
      ...state,
      config,
      theme,
      dispatch,
    }),
    [config, state],
  );

  return (
    <AppContext.Provider value={providedValue}>{children}</AppContext.Provider>
  );
};

AppProvider.defaultProps = {
  config: {},
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
  config: PropTypes.instanceOf(Object),
};

export default AppProvider;
