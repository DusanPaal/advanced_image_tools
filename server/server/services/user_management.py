"""This module contains the classes and functions
used to manage the users of the system.
"""

import logging
import os
import datetime as dt
import re
from typing import Callable
from types import SimpleNamespace
from server.security import ExpiredTokenError, InvalidTokenError

log = logging.getLogger("master")

Path = str

class InvalidUsernameError(Exception):
    """Raised when the username is invalid."""

class InvalidPasswordError(Exception):
    """Raised when the password is invalid."""

class InvalidEmailError(Exception):
    """Raised when the email is invalid."""

class UserAlreadyExistsError(Exception):
    """Raised when the user already exists."""

class InactiveUserError(Exception):
    """Raised when the user is inactive."""

class UserNotFoundError(Exception):
    """Raised when the user is not found."""

class DatabaseError(Exception):
    """Raised when a database error occurs."""

class FolderCreationError(Exception):
    """Raised when a folder cannot be created."""

class FolderRemovalError(Exception):
    """Raised when a folder cannot be removed."""

class MaxLoginAttemptsExceededError(Exception):
    """Raised when the maximum login attempts are exceeded."""

class UserManager:
    """Registers a new user in the system."""

    def __init__(
        self, db: object, table: str,
        schema: str, uid_column: str,
        auth: object, max_login_tries: int,
        login_wnd: int, login_lock_wnd: int
        ) -> None:
        """Initialize the user manager.

        Parameters:
        -----------
        db:
        The database object used to interact with the database.

        table:
        The name of the table where the user records are stored.

        schema:
        The schema where the user records are stored.

        uid_column:
        The name of the column that contains the user ID.

        auth:
        The authentication object used to generate and validate
        authentication tokens.

        max_login_tries:
        The maximum number of login attempts allowed within
        the specified time frame. Set to 0 to disable the limit.

        login_wnd:
        The time frame in minutes within which the login
        attempts will be counted.

        login_lock_wnd:
        The time period (in minutes) for which the user account
        will be locked after the maximum failed login attempts
        are exceeded.
        """

        # validate the input parameters
        if db is None:
            raise TypeError("The database object must be provided!")

        if table == "":
            raise ValueError("The table name must be provided!")

        if schema == "":
            raise ValueError("The schema name must be provided!")

        if uid_column == "":
            raise ValueError("The user ID column name must be provided!")

        if auth is None:
            raise TypeError("The authentication object must be provided!")

        if max_login_tries < 0:
            raise ValueError("The maximum login attempts must be a positive integer!")

        if login_wnd < 0:
            raise ValueError("The login window must be a positive integer!")

        if login_lock_wnd < 0:
            raise ValueError("The login lock window must be a positive integer!")

        # set the user manager variables
        self._db = db
        self.users_table = self._db.get_table(table, schema)
        self._user_id_col = uid_column
        self._auth = auth
        self._max_login_tries = max_login_tries
        self._login_wnd = login_wnd
        self._login_lock_wnd = login_lock_wnd

        # set the user manager state variables
        self._failed_login_attempts = 0
        self._lock_time = None
        self._last_login_attempt = dt.datetime.now() # no login attempts yet
        self._locked_until = dt.datetime.now() # unlocked by default

    def _validate_user_name(self, name: str) -> None:
        """Validate the user name."""

        if name == "":
            raise InvalidUsernameError("User name is missing!")

        if len(name) < 5:
            raise InvalidUsernameError("User name too short!")

        if len(name) > 24:
            raise InvalidUsernameError("User name too long!")

    def _validate_user_password(self, password: str) -> None:
        """Validate the user password"""

        if password == "":
            raise InvalidPasswordError("Password is missing!")

        if len(password) < 8:
            raise InvalidPasswordError(f"Password too short!")

        if len(password) > 162:
            raise InvalidPasswordError(f"Password too long: {len(password)}")

    def _validate_user_email(self, email: str) -> None:
        """Validate the user email"""

        if email == "":
            raise InvalidEmailError("Email address is missing!")

        email_pattern = re.compile(r"[^@]+@[^@]+\.[^@]+")

        if not email_pattern.match(email):
            raise InvalidEmailError(f"Invalid email address: '{email}'")

    def _validate_user_record(self, user_id: int) -> None:
        """Check if a user exists in the database."""

        # check if the user exists before attempting to delete
        record = self._db.get_record(
            self.users_table, key_column = "user_id", key = user_id)

        if len(record) == 0:
            raise UserNotFoundError(f"No such user exists with ID: {user_id}")

    def _check_user_account(self, name: str, email: str) -> None:
        """Check if a user account already exists in the database."""

        try:
            record = self._db.get_record(
                self.users_table, key_column = "user_name", key = name
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while attempting to register user: {err}"
            ) from err

        if len(record) != 0:
            raise UserAlreadyExistsError(
                f"An account already exists for user name: {name}")

        try:
            record = self._db.get_record(
                self.users_table,key_column = "user_email", key = email
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while attempting to register user: {err}"
            ) from err

        if len(record) != 0:
            raise UserAlreadyExistsError(
                "A user account already exists associated "
                f"with the specified email address: {email}"
            )

    def _validate_login_attempts(self, login_wnd: int) -> None:
        """Validate the login attempts within a given time frame.

        Parameters:
        -----------
        login_wnd:
        The time frame in minutes within which
        the login attempts will be counted.

        Raises:
        -------
        MaxLoginAttemptsExceededError:
        If the maximum login attempts are exceeded within the
        """

        # check if the maximum login attempts are disabled
        log.debug("Maximum login attempts: %s", self._max_login_tries)
        if self._max_login_tries == 0:
            return

        # check if the maximum login attempts have been exceeded
        log.debug("Previous failed login attempts: %s", self._failed_login_attempts)
        if self._failed_login_attempts > self._max_login_tries:
            raise MaxLoginAttemptsExceededError(
                "Maximum login attempts exceeded!")

        # calculate the time of the next available login
        wait_next_login = dt.timedelta(minutes = login_wnd)

        # increment the login attempts counter only if the user attempts
        # to login within a certain time period to prevent brute force
        # attacks if the user attempts to login after the time period
        # has elapsed, reset the login attempts counter, so that the user
        # won't get locked out
        next_available_login = self._last_login_attempt + wait_next_login
        log.debug("Last login attempt: %s", self._last_login_attempt)
        log.debug("Next login wait time (h:m:s): %s", wait_next_login)
        log.debug("Next available login (h:m:s): %s", next_available_login)

        if next_available_login > dt.datetime.now():
            self._failed_login_attempts += 1
            log.debug(
                "Login attempts counter incremented to: %d",
                self._failed_login_attempts)
        else:
            self._failed_login_attempts = 0
            log.debug(
                "Login attempts counter reset to: %d",
                self._failed_login_attempts)

        # record the time of the last login attempt
        self._last_login_attempt = dt.datetime.now()
        log.debug("Last login attempt has been recorded: %s", self._last_login_attempt)

    def _create_user_data_folder(self, root: Path, user_id: int) -> Path:
        """Create a folder to store user files."""

        user_data_dir = os.path.join(root, str(user_id))

        assert not os.path.exists(user_data_dir), (
            f"User data directory already exists: '{user_data_dir}' "
            "This is unexpected since no directory should exist for "
            "a user registering for the first time. This issue might "
            "occur if users were removed manually instead of using "
            "the provided system functionality."
        )

        # create the user data directory with no error
        # handling - the caller will handle any exceptions
        os.mkdir(user_data_dir)

        return user_data_dir

    def register_user(
        self, name: str, email: str, password: str,
        create_password_hash: Callable[[str], str],
        data_storage: Path) -> tuple[int, str]:
        """Create a new user with the given user name and password.

        Parameters:
        -----------
        name:
            The name of the new user. Must be between 5 and 24 characters long.
            Raises `InvalidUsernameError` if the name length is out of the valid
            range.

        email:
            The email address of the new user. Must be a valid email format.
            Raises `InvalidEmailError` if the email format is invalid.

        password:
            The password for the new user. Must be between 8 and 24 chars long.
            Raises `InvalidPasswordError` if the password length is out of
            the valid range.

        create_password_hash:
            A callable function that takes a plain password string and returns
            its hashed version.

        Returns:
        --------
        A tuple containing the user ID and the authentication token.

        Raises:
        -------
        InvalidUsernameError
            If the provided `name` does not meet length requirements.

        InvalidEmailError
            If the provided `email` is not in a valid email format.

        InvalidPasswordError
            If the provided `password` does not meet length requirements.

        UserAlreadyExistsError
            If a user already exists with the provided `name` or `email`.

        DatabaseError
            If an error occurs while attempting to register the user
            in the database.

        FolderCreationError
            If an error occurs while creating the user data folder.
        """

        # validate input parameters
        self._validate_user_name(name)
        self._validate_user_password(password)
        self._validate_user_email(email)

        assert create_password_hash is not None, (
            "Hash function to create encrypted password must be provided!")

        assert os.path.exists(data_storage), (
            f"The user data directory not found: '{data_storage}'"
        )

        # check if the user already exists in the database
        self._check_user_account(name, email)

        # create a new database record for the user
        hashed_password = create_password_hash(password)

        try:
            user_id = self._db.create_record(
                self.users_table,
                user_name = name,
                user_email = email,
                user_password = hashed_password,
                user_registration_date = dt.datetime.now()
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while attempting to register user: {err}"
            ) from err

        # generate an authentication token for the user
        auth_token = self._auth.generate_authentication_token(user_id, 24)

        try:
            self._db.insert_value(
                table = self.users_table,
                key_column = self._user_id_col,
                key = user_id,
                value_column = "user_token",
                value = auth_token
            )
        except Exception as err:
            # rollback the user registration if
            # the attempt to store the token fails
            self.delete_user(user_id)
            raise DatabaseError(
                "An error occurred while attempting to store "
                f"the user authentication token to database: {err}"
            ) from err

        # create a new data folder where the user files will be stored
        try:
            self._create_user_data_folder(data_storage, user_id)
        except Exception as err:
            # rollback the user registration if
            # the attempt to create the folder fails
            self.delete_user(user_id)
            raise FolderCreationError(
                f"An error occurred while creating the user data folder: {err}"
            ) from err

        # record the first user login time for the validation of login
        # attempts, which is performed each time the user attempts to log in
        self._last_login_attempt = dt.datetime.now()

        # return the user ID and the authentication token
        return (user_id, auth_token)

    def authenticate_user(self, auth_token: str) -> bool:
        """Authenticate a user using the provided authentication token.

        Parameters:
        -----------
        auth_token:
            The authentication token to validate.

        Returns:
        --------
        `True` if the token is valid, otherwise `False`.
        """

        # ten token management cely este premysliet

        try:
            user_id = self._auth.validate_authentication_token(auth_token)
        except ExpiredTokenError:
            return None
        except InvalidTokenError:
            return False

        if user_id is None:
            return False

        # compare the used token with the
        # token stored in the database
        try:
            record = self._db.get_record(
                self.users_table,
                key_column = "user_id",
                key = user_id
            )
        except Exception as err:
            raise DatabaseError(
            f"An error occurred while attempting to log in: {err}"
        ) from err

        return record["user_token"] == auth_token and record["user_active"]

    def login_user(
        self, name: str, password: str,
        check_password_hash: Callable[[str, str], bool]
        ) -> int:
        """Authenticate and log in a user using the provided credentials.

        Parameters:
        -----------
        name:
            The name of the user attempting to log in.
            Raises `InvalidUsernameError` if the user name is not
            found.

        password:
            The password provided by the user for authentication.
            Raises `InvalidPasswordError` if the password does not
            match the stored hash.

        check_password_hash:
            A callable function that takes the stored password hash
            and the provided password, returning `True` if the password
            is correct, and `False` otherwise.

        Returns:
        --------
        The ID of the logged-in user.


        Raises:
        -------
        InvalidUsernameError
        If the provided `name` does not match any registered user.

        InvalidPasswordError
        If the provided `password` is incorrect.

        DatabaseError
        If an error occurs while attempting to log in the user.

        InactiveUserError
        If the user is inactive and cannot log in.

        MaxLoginAttemptsExceededError
        If the maximum login attempts are exceeded within the
        specified time frame.
        """

        assert check_password_hash is not None, (
            "Hash function to compare user passwords must be provided!")

        try:
            record = self._db.get_record(
                self.users_table, key_column = "user_name", key = name
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while attempting to log in: {err}"
            ) from err

        # validate login attemps to prevent brute force attacks
        self._validate_login_attempts(self._login_wnd)

        if len(record) == 0:
            raise InvalidUsernameError(
                f"No such user exists: {name}!")

        if not record["user_active"]:
            raise InactiveUserError(
                f"User: {name} is inactive and cannot log in!")

        if not check_password_hash(record["user_password"], password):
            raise InvalidPasswordError(
               f'Invalid password: "{password}" for user: "{name}"')

        return record['user_id']

    def lock_user(self, user_name: str) -> None:
        """Lock the user account for a specified time period.

        Parameters:
        -----------
        user_name:
        The name of the user to be locked.
        """

        # calculate the time when the user account will be unlocked
        lock_time = dt.timedelta(minutes = self._login_lock_wnd)
        self._locked_until = dt.datetime.now() + lock_time

        # lock the user account in the database
        try:
            self._db.insert_value(
                table = self.users_table,
                key_column = "user_name",
                key = user_name,
                value_column = "user_locked_until",
                value = self._locked_until
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while locking the user: {err}"
            ) from err

    def unlock_user(self, user_name: str) -> None:
        """Lock the user account for a specified time period.

        Parameters:
        -----------
        user_name:
        The name of the user to be unlocked.
        """

        # by setting the "locked until" time to the current time
        # the user account will be unlocked immediately
        self._locked_until = dt.datetime.now()

        # unlock the user account in the database
        try:
            self._db.insert_value(
                table = self.users_table,
                key_column = "user_name",
                key = user_name,
                value_column = "user_locked_until",
                value = self._locked_until
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while locking the user: {err}"
            ) from err

    def user_is_locked(self, user_name: str) -> bool:
        """Check if the user account is locked.

        Parameters:
        -----------
        user_name:
        The name of the user to check.

        Returns:
        --------
        `True` if the user account is locked, otherwise `False`.
        """

        try:
            record = self._db.get_record(
                self.users_table,
                key_column = "user_name",
                key = user_name
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while checking if the user is locked: {err}"
            ) from err

        if record["user_locked_until"] is None:
            return False

        return record["user_locked_until"] > dt.datetime.now()

    def exists_user(self, user_id: int) -> bool:
        """Check if a user exists in the system.

        Parameters:
        -----------
        user_id:
            The Id of the user to be deactivated.
        """
        try:
            self._validate_user_record(user_id)
        except UserNotFoundError:
            return False
        else:
            return True

    def delete_user(self, user_id: int, data_storage: Path) -> None:
        """Delete the user from the system.

        Deleted will be the user record from
        the database and the user's data folder.

        Parameters:
        -----------
        user_id:
            The Id of the user to be deleted.

        Raises:
        -------
        UserNotFoundError
        If no user exists with the provided `user_id`.

        DatabaseError
        If an error occurs while attempting to delete
        the user from the database.

        InactiveUserError
        If the user is inactive and cannot be deleted.

        FolderRemovalError
        If an error occurs while deleting the user data folder.
        """

        # check if the user exists before attempting to delete
        self._validate_user_record(user_id)

        try:
            record = self._db.get_record(
                self.users_table, key_column = "user_id", key = user_id
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while attempting to log in: {err}"
            ) from err

        if not record["user_active"]:
            raise InactiveUserError(
                f"User: {user_id} is inactive and cannot be deleted!")

        # delete the user from the database
        try:
            self._db.delete_record(
                self.users_table,
                self._user_id_col,
                user_id
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while deleting the user: {err}"
            ) from err

        # delete the user data folder
        user_folder = os.path.join(data_storage, str(user_id))
        assert os.path.exists(user_folder), (
            f"User data directory not found: '{user_folder}'"
        )

        # delete the user data directory with no error
        # handling - the caller will handle any exceptions
        try:
            os.rmdir(user_folder)
        except Exception as err:
            raise FolderRemovalError(
                f"An error occurred while deleting the user data folder: {err}"
            ) from err

    def deactivate_user(self, user_id: int) -> None:
        """Deactivate the user in the database.

        Parameters:
        -----------
        user_id:
            The Id of the user to be deactivated.

        Raises:
        -------
        UserNotFoundError
            If no user exists with the provided `user_id`.

        DatabaseError
            If an error occurs while attempting to delete
            the user from the database.
        """

        # check if the user exists before attempting to delete
        self._validate_user_record(user_id)

        try:
            record = self._db.get_record(
                self.users_table,
                key_column = "user_id",
                key = user_id
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while attempting to log in: {err}"
            ) from err

        if not record["user_active"]:
            raise InactiveUserError(
                f"User: {user_id} is already inactive!")

        # deactivate the user in the database
        try:
            self._db.insert_value(
                table = self.users_table,
                key_column = self._user_id_col,
                key = user_id,
                value_column = "user_active",
                value = False
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while deactivating the user: {err}"
            ) from err

    def change_user_password(
        self, user_id: int, new_value: str,
        create_password_hash: Callable[[str], str]
        ) -> None:
        """Change the password for a user with the specified user ID.

        Parameters:
        -----------
        user_id:
            The ID of the user whose password is to be changed.

        new_value:
            The new password for the user. Must be between 8 and 24 chars long.
            Raises `InvalidPasswordError` if the password length is out of the
            valid range.

        create_password_hash:
            A callable function that takes the new password and returns its
            hashed version.

        Raises:
        -------
        UserNotFoundError
            If no user exists with the provided `user_id`.

        InvalidPasswordError
            If the provided `new_value` does not meet the password
            policy requirements.

        DatabaseError
            If an error occurs while updating the user's password in
            the database.
        """

        assert create_password_hash is not None, (
            "Hash function to create encrypted password must be provided!")

        # validate the new password with the password policy
        self._validate_user_password(new_value)

        # check if the user exists before attempting to delete
        self._validate_user_record(user_id)

        # update the user's password in the database
        try:
            self._db.insert_value(
                table = self.users_table,
                key_column = self._user_id_col,
                key = user_id,
                value_column = "user_password",
                value = create_password_hash(new_value)
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while updating the user's password: {err}"
            ) from err


    @property
    def login_attempts(self) -> int:
        """Return the number of login attempts."""
        return self._login_attempts

    @property
    def max_login_attempts(self) -> int:
        """Return the maximum number of login attempts."""
        return self._max_login_tries

    @property
    def next_login_window(self) -> int:
        """Return the time frame in minutes within
        which the login attempts will be counted."""
        return self._login_wnd

    @property
    def login_lock_window(self) -> int:
        """Return the time period for which the user account
        will be locked in minutes after the maximum login
        attempts are exceeded."""
        return self._login_lock_wnd

    def calculate_next_login_timeout(self, user_name: str) -> SimpleNamespace:
        """Return the time until the
        next login attempt is allowed."""

        # retrieve the user lockout time from the database
        # to prevent data inconsistency if server restarts
        try:
            record = self._db.get_record(
                table = self.users_table,
                key_column = "user_name",
                key = user_name,
            )
        except Exception as err:
            raise DatabaseError(
                f"An error occurred while locking the user: {err}"
            ) from err

        # calculate the time until the next login attempt is allowed
        time_difference = record["user_locked_until"] - dt.datetime.now()

        # extract the days, hours, minutes,
        # and seconds from the time difference
        days = time_difference.days
        hours, remainder = divmod(time_difference.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        # compile the time units as a namespace
        time_units = SimpleNamespace(
            days = days, hours = hours,
            minutes = minutes, seconds = seconds
        )

        return time_units
