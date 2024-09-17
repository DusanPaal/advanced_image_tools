"""
This module provides security functionalities.

The credentials are stored in a file using XOR encryption,
which is not suitable for real-world applications due to its
inherent lack of security, regardless of key length. This is
merely a basic implementation to demonstrate a working solution.
In a production environment, more secure encryption algorithms
will be employed.
"""

import datetime as dt
import hashlib
import json
from abc import abstractmethod, ABCMeta
import jwt


# ====== encryptor ======
class IEncryptor(metaclass=ABCMeta):
    """An interface for encryptor classes."""

    @abstractmethod
    def __init__(self, key: str) -> None:
        """Initialize the encryptor object.

        Parameters:
        -----------
        key:
        The key to use for encryption.
        """

    @abstractmethod
    def encrypt(self, data: bytes) -> bytes:
        """Encrypt the data.

        Parameters:
        -----------
        data:
        The data to encrypt.

        Returns:
        --------
        The encrypted data.
        """

    @abstractmethod
    def decrypt(self, data: bytes) -> bytes:
        """Decrypt the data.

        Parameters:
        -----------
        data:
        The data to decrypt.

        Returns:
        --------
        The decrypted data.
        """


class XOREncryptor(IEncryptor):
    """A class to encrypt and decrypt
    data using XOR encryption."""

    def __init__(self, key: str):
        """Initialize the XOREncryptor object.

        Parameters:
        -----------
        key:
        The key to use for encryption.
        """

        min_key_len = 8

        if len(key) < min_key_len:
            raise ValueError(
                f"The key must be at least {min_key_len} characters long!"
            )

        # Derive a key from the provided string
        self.key = hashlib.sha256(key.encode()).digest()

    def encrypt(self, data: bytes) -> bytes:
        """Encrypt data using XOR with the derived key."""
        key_repeated = (self.key * (len(data) // len(self.key) + 1))[:len(data)]
        return bytes(a ^ b for a, b in zip(data, key_repeated))

    def decrypt(self, data: bytes) -> bytes:
        """Decrypt data using XOR with the derived key."""
        return self.encrypt(data)


class Credentials:
    """A class to manage storing and retrieving
    credentials with simple XOR encryption."""

    def __init__(self, encryptor: IEncryptor):
        """Initialize the Credentials object.

        Parameters:
        -----------
        key:
        The key to use for encryption.
        """

        self._encryptor = encryptor

    def _validate_credentials(self, credentials: dict) -> None:
        """Validate the credentials dictionary."""

        # Check if the credentials dictionary has the required keys
        required_keys = {'user', 'password'}
        missing_keys = required_keys.difference(credentials.keys())

        # check that the required keys are present
        if len(missing_keys) != 0:
            raise ValueError(
                f"Missing required keys in the credentials: {missing_keys}"
            )

        # Check if the values of the required keys are strings
        if not all(isinstance(credentials[key], str) for key in required_keys):
            raise TypeError(
                "The 'user' and 'password' keys must be strings."
            )

        # check that the required keys are not empty
        if not all(credentials[key] for key in required_keys):
            raise ValueError(
                "The 'user' and 'password' keys must not be empty."
            )

    def store(self, credentials: dict, file_path: str) -> None:
        """Store database credentials in a file.

        Parameters:
        -----------
        credentials:
        A dictionary containing the database credentials.

        The dictionary must have the keys 'user' and 'password'.
        The values of the keys must be non-empty strings.

        file_path:
        The path to the file where the credentials will be stored.
        """

        # Validate the credentials dictionary
        self._validate_credentials(credentials)

        # Convert the credentials dictionary to a JSON string
        credentials_bin = json.dumps(credentials).encode('utf-8')

        # Encrypt the credentials using XOR
        encr_credentials = self._encryptor.encrypt(credentials_bin)

        # Store the encrypted credentials in a file
        with open(file_path, 'wb') as file:
            file.write(encr_credentials)

    def load(self, file_path: str) -> dict:
        """Get the database credentials from a file.

        Parameters:
        -----------
        file_path:
        The path to the file containing the encrypted credentials.

        Returns:
        --------
        A dictionary containing the database credentials.

        The dictionary has the keys 'user' and 'password'.
        The values of the keys are non-empty strings.
        """

        # Read the encrypted credentials from the file
        with open(file_path, 'rb') as file:
            encr_credentials = file.read()

        # Decrypt the credentials using XOR
        decr_credentials = self._encryptor.decrypt(encr_credentials)

        # Decode the credentials to a dictionary and return it
        credentials = json.loads(decr_credentials.decode('utf-8'))

        # Validate the credentials dictionary
        self._validate_credentials(credentials)

        return credentials


# ====== authenticator ======
class ExpiredTokenError(Exception):
    """Raised when a token has expired."""

class InvalidTokenError(Exception):
    """Raised when a token is invalid."""


class IAlgorithm:
    """An interface for authenticator classes."""

    @staticmethod
    @abstractmethod
    def generate_token(secret_key: str, user_id: int, expiration_time: int) -> str:
        """Generate an authentication token.

        Parameters:
        -----------
        secret_key:
        The secret key to use for token generation.

        user_id:
        The ID of the user to authenticate.

        expiration_time:
        The time in hours until the token expires.

        Returns:
        --------
        The authentication token.
        """

    @staticmethod
    @abstractmethod
    def validate_token(secret_key: str, token: str) -> int:
        """Validate an authentication token.

        Parameters:
        -----------
        secret_key:
        The secret key to use for token validation.

        token:
        The authentication token to validate.

        Returns:
        --------
        The user ID number.

        Raises:
        -------
        ExpiredTokenError:
        If the token has expired.

        InvalidTokenError:
        If the token is invalid.
        """

class HS256Algorithm(IAlgorithm):
    """A class to generate and validate
    authentication tokens using the HS256 algorithm."""

    @staticmethod
    def generate_token(
        secret_key: str, user_id: int, expiration_time: int) -> str:
        """Generate an authentication token.

        Parameters:
        -----------
        secret_key:
        The secret key to use for token generation.

        user_id:
        The ID of the user to authenticate.

        expiration_time:
        The time in hours until the token expires.

        Returns:
        --------
        The authentication token.
        """

        if expiration_time <= 0:
            raise ValueError("Expiration time must be greater than 0!")

        exp_time = dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=expiration_time)
        payload = {'user_id': user_id, 'exp': exp_time.timestamp()}
        token = jwt.encode(payload, secret_key, algorithm='HS256')

        return token

    @staticmethod
    def validate_token(secret_key: str, token: str) -> int:
        """Validate an authentication token.

        Parameters:
        -----------
        secret_key:
        The secret key to use for token validation.

        token:
        The authentication token to validate.

        Returns:
        --------
        The user ID number.

        Raises:
        -------
        ExpiredTokenError:
        If the token has expired.

        InvalidTokenError:
        If the token is invalid.
        """

        try:
            decoded_payload = jwt.decode(
                token, secret_key, algorithms=['HS256']
            )
        except jwt.ExpiredSignatureError as err:
            raise ExpiredTokenError("Token has expired!") from err
        except jwt.InvalidTokenError:
            raise InvalidTokenError("Token is invalid!")

        return decoded_payload.get('user_id')


class Authenticator():
    """Generates and validates user authentication tokens."""

    def __init__(self, secret_key: str, algorithm: IAlgorithm) -> None:
        """Initialize the authenticator with a secret key

        Parameters:
        -----------
        secret_key:
            The secret key used to sign the authentication token.

        algorithm:
            The algorithm used to sign the authentication token.
        """
        self._secret_key = secret_key
        self._algorithm = algorithm

    def generate_authentication_token(self, user_id: int, expiration_time: int) -> str:
        """Generate an authentication token.

        Parameters:
        -----------
        user_id:
            The ID of the user to authenticate.

        expiration_time:
            The time in hours until the token expires.

        Returns:
        --------
        The authentication token.
        """

        return self._algorithm.generate_token(self._secret_key, user_id, expiration_time)

    def validate_authentication_token(self, token: str) -> int:
        """Validate an authentication token.

        Parameters:
        -----------
        token:
            The authentication token to validate.

        Returns:
        --------
        The user ID number.

        Raises:
        -------
        ExpiredTokenError:
        If the token has expired.

        InvalidTokenError:
        If the token is invalid
        """

        return self._algorithm.validate_token(self._secret_key, token)
