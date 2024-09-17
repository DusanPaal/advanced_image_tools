import { FileUploadingError, ValidationError } from './errors.js';

/**
 * Stores a file by sending it to the specified endpoint.
 * 
 * @param {string} name - The name of the file.
 * @param {any} data - The data of the file.
 * @param {string} endpoint - The URL endpoint to send the file to.
 * @throws {TypeError} If the file name is not a string or the endpoint URL type is not a string.
 * @throws {ValidationError} If the file name is invalid, the endpoint URL is invalid, or the file data is missing.
 * @throws {FileUploadingError} If there is an error uploading the file.
 */
const storeFile = async (name, data, endpoint) => {

  // Input validation
  if (typeof name !== 'string' || name.trim() === '') {
    throw new ValidationError('Invalid file name!');
  }

  if (!data) {
    throw new ValidationError('File data is required!');
  }

  if (typeof endpoint !== 'string' || !endpoint.startsWith('http')) {
    throw new ValidationError('Invalid endpoint URL type!');
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ content: data, filename: name }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new FileUploadingError(
        `${errorText} (Status: ${response.status})`
      );
    }
  } catch (error) {
    throw new FileUploadingError(error);
  }

};

export default storeFile;