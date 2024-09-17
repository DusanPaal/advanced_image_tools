export const ENABLE_TEXT_CONTENT_EDIT = 'ENABLE_TEXT_CONTENT_EDIT';

/**
 * Toggle text content edit mode.
 *
 */
const enableTextContentEdit = (state, payload) => ({
  ...state,
  textIdOfEditableContent: payload.textIdOfEditableContent || null,
});

export default enableTextContentEdit;
