/** External Dependencies */
import React, { memo, useCallback, useEffect, useState, useRef } from 'react';

/** Internal Dependencies */
import MainCanvas from 'components/MainCanvas';
import Topbar from 'components/Topbar';
import Tabs from 'components/Tabs';
import ToolsBar from 'components/ToolsBar';
import FeedbackPopup from 'components/FeedbackPopup';
import Spinner from 'components/common/Spinner';
import TabsDrawer from 'components/TabsDrawer';

import {
  HIDE_LOADER,
  RESET,
  SET_FEEDBACK,
  SET_ORIGINAL_IMAGE,
  SET_SHOWN_TABS_MENU,
  SHOW_LOADER,
  UPDATE_STATE,
} from 'actions';

import {
  usePhoneScreen,
  useResizeObserver,
  useStore,
  useTransformedImgData,
  useUpdateEffect
} from 'hooks';

import cloudimageQueryToDesignState from 'utils/cloudimageQueryToDesignState';
import finetunesStrsToClasses from 'utils/finetunesStrsToClasses';
import filterStrToClass from 'utils/filterStrToClass';
import isSameImage from 'utils/isSameImage';
import loadImage from 'utils/loadImage';
import styles from './App.module.css'


const App = () => {

  const {
    config,
    isLoadingGlobally,
    haveNotSavedChanges,
    dispatch,
    originalImage,
    shownImageDimensions,
    theme,
    feedback = {},
  } = useStore();

  const {
    loadableDesignState,
    useCloudImage,
    cloudimage,
    source,
    avoidChangesNotSavedAlertOnLeave,
    useBackendTranslations,
    language,
    defaultSavedImageName,
    observePluginContainerSize,
    showCanvasOnly,
    getCurrentImgDataFnRef,
    updateStateFnRef,
    noCrossOrigin,
    resetOnImageSourceChange,
  } = config;

  //EROR: React does not recognize the `showTabsDrawer` prop on a DOM element.
  //If you intentionally want it to appear in the DOM as a custom attribute,
  // spell it as lowercase `showtabsdrawer` instead.If you accidentally passed 
  //it from a parent component, remove it from the DOM element.
  const showTabsDrawer = window.matchMedia('(max-width: 760px)').matches;

  const [observeResize, unobserveElement] = useResizeObserver();
  const [rootSize, setRootSize] = useState({
    width: undefined,
    height: undefined,
  });
  const isPhoneScreen = usePhoneScreen();
  const pluginRootRef = useRef(null);
  const cloudimageQueryLoaded = useRef(false);
  const imageBeingLoadedSrc = useRef(null);
  // Hacky solution, For being used in beforeunload event
  // as it won't be possible to have the latest value of the state variable in js event handler.
  const haveNotSavedChangesRef = useRef(haveNotSavedChanges);
  const transformImgFn = useTransformedImgData();

  const setNewOriginalImage = useCallback((newOriginalImage) => {
    dispatch({
      type: SET_ORIGINAL_IMAGE,
      payload: {
        originalImage: newOriginalImage,
      },
    });
  }, []);

  const setError = useCallback((newError) => {
    dispatch({
      type: SET_FEEDBACK,
      payload: {
        feedback: {
          message: newError.message || newError,
          duration: 0,
        },
      },
    });
  }, []);

  // We are promisifying the image loading for mixing it with other promises
  const loadAndSetOriginalImage = (imgToLoad) =>
    new Promise((resolve) => {
      const imgSrc = imgToLoad?.src || imgToLoad;
      if (
        imageBeingLoadedSrc.current === imgSrc ||
        (!imgSrc && originalImage) ||
        isSameImage(imgSrc, originalImage)
      ) {
        if (!imageBeingLoadedSrc.current) {
          resolve();
        }
        return;
      }

      const triggerResolve = () => {
        imageBeingLoadedSrc.current = null;
        resolve();
      };

      imageBeingLoadedSrc.current = imgSrc;

      // This timeout is a workaround when re-initializing
      // the react app from vanilla JS. Due to a bug in react
      // the dispatch method that is called in setNewOriginalImage
      // still points to the old dispatch method after re-init,
      // so we need to wait for one tick to make sure it's updated.
      //
      // This applies to both URLs and HTMLImageElement, since URLs
      // may resolve immediately in some cases, e.g. memory cache.
      setTimeout(() => {
        if (typeof imgToLoad === 'string') {
          loadImage(imgToLoad, defaultSavedImageName, noCrossOrigin)
            .then(setNewOriginalImage)
            .catch(setError)
            .finally(triggerResolve);
        } else if (imgToLoad instanceof HTMLImageElement) {
          if (!imgToLoad.name && defaultSavedImageName) {
            // eslint-disable-next-line no-param-reassign
            imgToLoad.name = defaultSavedImageName;
          }
          if (!imgToLoad.complete) {
            imgToLoad.addEventListener('load', () => {
              setNewOriginalImage(imgToLoad);
              triggerResolve();
            });
            return;
          }

          setNewOriginalImage(imgToLoad);
          triggerResolve();
        } else {
          setError(t('invalidImageError'));
          triggerResolve();
        }
      }, 0);
    });

  const promptDialogIfHasChangeNotSaved = (e) => {
    if (haveNotSavedChangesRef.current) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  // loadingPromisesFn is a function for enabling the ability 
  // to show loader first then trigger requests not vice versa.
  const handleLoading = (loadingPromisesFn = () => []) => {
    dispatch({ type: SHOW_LOADER });

    return Promise.all(loadingPromisesFn()).finally(() => {
      dispatch({ type: HIDE_LOADER });
    });
  };

  const updateDesignStateWithLoadableOne = () => {
    if (loadableDesignState && Object.keys(loadableDesignState).length > 0) {
      dispatch({
        type: UPDATE_STATE,
        payload: {
          ...loadableDesignState,
          finetunes: finetunesStrsToClasses(loadableDesignState?.finetunes),
          filter: filterStrToClass(loadableDesignState?.filter),
        },
      });
    }
  };

  useUpdateEffect(() => {
    if (source && !isSameImage(source, originalImage)) {
      cloudimageQueryLoaded.current = false;
      handleLoading(() => [loadAndSetOriginalImage(source)]);
    }

    if (resetOnImageSourceChange) {
      dispatch({
        type: RESET,
        payload: { config },
      });
    }
  }, [source]);

  useUpdateEffect(() => {
    const newImgSrc = loadableDesignState?.imgSrc;
    if (newImgSrc && !isSameImage(newImgSrc, originalImage)) {
      handleLoading(() => [
        loadAndSetOriginalImage(newImgSrc).then(
          updateDesignStateWithLoadableOne,
        ),
      ]);
    } else {
      updateDesignStateWithLoadableOne();
    }
  }, [loadableDesignState]);

  useEffect(() => {
    if (
      Object.keys(shownImageDimensions || {}).length > 0 &&
      !Object.keys(shownImageDimensions).some(
        (k) => !shownImageDimensions[k],
      ) &&
      originalImage &&
      useCloudImage &&
      cloudimage?.loadableQuery &&
      !cloudimageQueryLoaded.current
    ) {
      dispatch({
        type: UPDATE_STATE,
        payload: cloudimageQueryToDesignState(
          cloudimage.loadableQuery,
          shownImageDimensions,
          originalImage,
        ),
      });
      cloudimageQueryLoaded.current = true;
    }
  }, [shownImageDimensions, originalImage, useCloudImage, cloudimage]);

  useEffect(() => {
    let isUnmounted = false;
    if (observePluginContainerSize && pluginRootRef.current) {
      observeResize(pluginRootRef.current.parentNode, ({ width, height }) =>
        setRootSize({ width, height }),
      );
    } else if (rootSize.width && rootSize.height && !isUnmounted) {
      setRootSize({ width: undefined, height: undefined });
    }

    return () => {
      if (observePluginContainerSize && pluginRootRef.current) {
        unobserveElement(pluginRootRef.current);
      }

      isUnmounted = true;
    };
  }, [observePluginContainerSize]);

  useEffect(() => {
    const initialRequestsPromisesFn = () => [
      loadAndSetOriginalImage(loadableDesignState?.imgSrc || source),
      ...(useBackendTranslations
        ? [getBackendTranslations(language, translations)]
        : []),
    ];

    handleLoading(initialRequestsPromisesFn);

    if (window && !avoidChangesNotSavedAlertOnLeave) {
      window.addEventListener('beforeunload', promptDialogIfHasChangeNotSaved);
    }

    return () => {
      if (window && !avoidChangesNotSavedAlertOnLeave) {
        window.removeEventListener(
          'beforeunload',
          promptDialogIfHasChangeNotSaved,
        );
      }
    };
  }, []);

  useEffect(() => {
    if (updateStateFnRef && typeof updateStateFnRef === 'object') {
      updateStateFnRef.current = (newStatePartObjOrFn) => {
        dispatch({
          type: UPDATE_STATE,
          payload: newStatePartObjOrFn,
        });
      };
    }
  }, [updateStateFnRef, dispatch]);

  useEffect(() => {
    if (getCurrentImgDataFnRef && typeof getCurrentImgDataFnRef === 'object') {
      getCurrentImgDataFnRef.current = transformImgFn;
    }
  }, [transformImgFn]);

  useEffect(() => {
    haveNotSavedChangesRef.current = haveNotSavedChanges;
  }, [haveNotSavedChanges]);

  const toggleMainMenu = (open) => {
    dispatch({
      type: SET_SHOWN_TABS_MENU,
      payload: {
        opened: open,
      },
    });
  };

  const renderContent = () => (
    <>
      {!showCanvasOnly && (
        <>
          {showTabsDrawer && <TabsDrawer toggleMainMenu={toggleMainMenu} />}
          <Topbar toggleMainMenu={toggleMainMenu} />
        </>
      )}
      {originalImage && feedback.duration !== 0 && (
        <div className={styles.mainContainer}>
          {!showCanvasOnly && !showTabsDrawer && (
            <div className={styles.tabs}>
              <Tabs toggleMainMenu={toggleMainMenu} />
            </div>
          )}
          <div
            className={styles.canvasAndTools}
            showTabsDrawer={showTabsDrawer}
          >
            <MainCanvas />
            {!showCanvasOnly && <ToolsBar isPhoneScreen={isPhoneScreen} />}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div
      className={styles.app}
      data-phone={isPhoneScreen}
      showTabsDrawer={showTabsDrawer}
      ref={pluginRootRef}
      size={rootSize}
    >
      {isLoadingGlobally && <Spinner/>}
      {renderContent()}
      <FeedbackPopup />
    </div>
  );

};

export default memo(App);