import { FileReadingError, ValidationError } from './errors';

/**
 * @brief Reads a local file and returns its content as a Data URL.
 * @param {File} file : The file object to read.
 * @returns {Promise<string>} : A promise that resolves with the file content as a Data URL.
 * @throws {ValidationError} : If the file object is invalid.
 * @throws {FileReadingError} : If there is an error reading the file.
 */
const readLocalFile = (file) => {

  return new Promise((resolve, reject) => {

    // Check if the file is a valid File object
    if (!(file instanceof File)) {
      reject(new ValidationError('Invalid file object type!'));
      return;
    }

    // create a file reader
    const reader = new FileReader();

    // Listen for file reading completion
    reader.onload = (event) => {
      // get the file content as a Data URL
      const data = event.target.result;

      if (data) {
        // Resolve with the file data
        resolve(data);
      } else {
        // Reject if no data is available
        // e.g. file is empty or corrupted
        reject(new Error('No data read!'));
      }
    };

    // If the file reading fails, reject the
    // promise and pass the error up the call
    // stack to the caller for specific handling
    reader.onerror = (event) => {
      reject(
        new FileReadingError(
          `Error reading data from file: ${file.name}`,
          event.error
        ),
      );
    }

    // Start reading the file as a Data URL
    reader.readAsDataURL(file);

  });

}

export default readLocalFile;