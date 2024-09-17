export const CHANGE_ROTATION = 'CHANGE_ROTATION';

/**
 * Change rotation of the image if
 * it's not the same as the current one.
 */
const changeRotation = (state, payload) =>
  state.adjustments.rotation !== payload.rotation
    ? {
        ...state,
        isDesignState: !payload.dismissHistory,
        adjustments: {
          ...state.adjustments,
          rotation: payload.rotation,
        },
      }
    : state;

export default changeRotation;
