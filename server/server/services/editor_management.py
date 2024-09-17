"""Editor management service."""
from os.path import join, splitext
from logging import getLogger
import base64

DirPath = str
FilePath = str

log = getLogger('master')

class InvalidImageFormatError(Exception):
    pass

class EditorManager:
    """Manager for the editor application."""

    def _validate_image_format(self, ext: str) -> None:
        """Validate the image format."""

        allowed_image_formats = [
            'jpg', 'jpeg', 'png', 'webp'
        ]

        ext = ext.lstrip('.').lower()

        if ext not in allowed_image_formats:
            raise InvalidImageFormatError(
                f'Unsupported image format: "{ext}"')

    def decode_image(self, img: str) -> bytes:
        """Decode the image data.

        Parameters:
        -----------
        img:
        The image data to decode.

        Returns:
        --------
        A tuple containing the image extension 
        and the decoded image data.
        """

        img_data = img.split(',', maxsplit = 1)[1]
        decoded = base64.b64decode(img_data)

        return decoded

    def save_file(self, dst: DirPath, name: str, file: bytes) -> FilePath:
        """Upload a file to the server storage.

        Parameters:
        -----------
        dst:
        The destination path to save the file.

        file:
        The file to save.

        name:
        The name of the file.

        Returns:
        --------
        The path to the saved file.

        Raises:
        -------
        InvalidImageFormatError:

        """

        ext = splitext(name)[1].lower()
        self._validate_image_format(ext)
        dst_file = join(dst, name)

        # save the file to the storage without error
        # handling fow now - the caller will handle
        # any exceptions
        with open(dst_file, 'wb') as stream:
            stream.write(file)

        return dst_file
