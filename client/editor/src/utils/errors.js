export class ValidationError extends Error {
  constructor(message) {
    super(message);
  }
}

export class NoFileSelectedWarning extends Error {
  constructor(message) {
    super(message);
  }
}

export class FileReadingError extends Error {
  constructor(message) {
    super(message);
  }
}

export class FileUploadingError extends Error {
  constructor(message) {
    super(message);
  }
}