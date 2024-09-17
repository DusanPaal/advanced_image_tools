import { NoFileSelectedWarning, ValidationError } from './errors';

/**
 * @brief Prompts the user to select a local file and returns the selected file.
 * @param {string} filter - The file filter to apply when selecting a file.
 * @returns {Promise<File>} - A Promise that resolves with the selected file.
 * @throws {NoFileSelectedWarning} - If the user cancels the file selection.
 * @throws {ValidationError} - If the file filter is invalid.
 */
const selectLocalFile = (filter) => {

  return new Promise((resolve, reject) => {

    // Check if the file filter is valid
    if (typeof filter !== 'string' || filter === '') {
      reject(new ValidationError('Invalid file filter!'));
      return;
    }

    // Create a hidden file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = filter;
    input.click();

    // Listen for file selection
    input.onchange = (event) => {
      const file = event.target.files[0];

      if (file) {
        // Resolve with the file
        resolve(file);
      } else {
        // Reject if user cancels file selection
        reject(new NoFileSelectedWarning('No file selected by user!'));
      }
    };

  });

};

export default selectLocalFile;