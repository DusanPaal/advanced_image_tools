export const CLEAR_ANNOTATIONS_SELECTIONS = 'CLEAR_ANNOTATIONS_SELECTIONS';

/**
 * Remove annotations selection frame
 * if no annotations are selected.
 */
const clearAnnotationsSelections = (state) =>
  state.selectionsIds.length === 0
    ? state
    : {
        ...state,
        selectionsIds: [],
      };

export default clearAnnotationsSelections;
