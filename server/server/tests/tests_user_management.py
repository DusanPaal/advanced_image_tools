"""Module to unit test the server app."""

from os.path import join, dirname, exists
import os
from unittest import TestCase, TextTestRunner, TestSuite
import datetime as dt
import logging

from werkzeug.security import generate_password_hash as gen_hash_func
from werkzeug.security import check_password_hash as chk_hash_func

from database import Database
from security import Credentials, XOREncryptor
from server.services.user_management import (
    UserManager, InvalidPasswordError,
    InvalidEmailError, InvalidUsernameError,
    UserAlreadyExistsError, DatabaseError,
    FolderCreationError, UserNotFoundError,
    InactiveUserError
)

# initialize logging for the tests
tag = dt.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
log_filename = f"logs/tests_user_management_{tag}.log"

logging.basicConfig(
    filename = log_filename,
    filemode = 'w',
    level = logging.DEBUG
)

log = logging.getLogger(__name__)

class TestUserManagemetService(TestCase):
    """Unit tests for the UserManagementService class."""

    db = None
    users_table = None
    data_storage = None
    manager = None
    user_ids = None

    def setUp(self) -> None:
        """Set up the test."""

        log.info("============================")
        log.info("Setting up new test...")
        log.info("Connecting to database...")

        env_key = 'PostgresDbCredentials'
        encryptor = XOREncryptor('my_secret_key')
        credentials_dir = os.getenv(env_key)
        credentials_path = os.path.join(
            credentials_dir, 'credentials.enc'
        )

        credentials_obj = Credentials(encryptor)
        credentials = credentials_obj.load(credentials_path)

        self.db = Database(
            host = 'localhost',
            port = 5432,
            db_name = 'postgres',
            user_name = credentials['user'],
            password = credentials['password'],
            debug = False
        )

        log.info("Fetching user data table...")
        self.users_table = self.db.get_table(
            name = "users", schema = "public"
        )

        log.info("Compiling path to the user file storage...")
        self.data_storage = join(
            dirname(__file__), "data", "users"
        )

        log.info("Instantiating user manager...")
        self.manager = UserManager(
            database = self.db,
            table_name = "users",
            schema = "public",
            user_id_column = "user_id",
            secret_key = "some_secret_key",

        )

        # a temporary cache to store the user IDs for cleanup
        log.info("Creating user ID cache...")
        self.user_ids = []

        log.info("Test setup completed...")

    def tearDown(self) -> None:
        """Tear down the test."""

        log.info("Tearing down test...")

        # remove the registered test user
        log.info("Removing the test users from database...")
        for user_id in self.user_ids:
            self.db.delete_record(self.users_table, "user_id", user_id)
            os.rmdir(join(self.data_storage, str(user_id)))
            log.info(f"\tUser with ID {user_id} removed.")

        log.info("Disconnecting from database...")
        self.db.disconnect()

        log.info("Setting the test attributes to None...")
        self.db = None
        self.users_table = None
        self.data_storage = None
        self.manager = None
        self.user_ids = None

        log.info("Test teardown completed.")
        log.info("============================\n")

    def register_user_with_valid_parameters(self):
        """Test the register_user method
        with valid user parameters."""

        log.info("***************************")
        log.info("Running test: register_user_with_valid_parameters()")

        result = self.manager.register_user(
            name = "Dasa_124",
            email = "bojnanska@ledvance.com",
            password = "dasenka125",
            create_password_hash = gen_hash_func,
            data_storage = self.data_storage
        )

        # check the result
        self.assertIsInstance(result, tuple)
        user_id, token = result
        self.assertIsInstance(user_id, int)
        self.assertIsInstance(token, str)

        # save the user_id for cleanup
        self.user_ids.append(user_id)

        # check the user record in the database
        record = self.db.get_record(
            table = self.users_table,
            key_column = "user_id",
            key = user_id
        )
        self.assertIsNotNone(record)

        # check the user record fields
        self.assertGreater(record["user_id"], 1000000)
        self.assertEqual(record["user_name"], "Dasa_124")
        self.assertEqual(record["user_email"], "bojnanska@ledvance.com")
        self.assertTrue(chk_hash_func(record["user_password"], "dasenka125"))
        self.assertEqual(record["user_token"], token)
        self.assertEqual(record["user_registration_date"], dt.datetime.now().date())
        self.assertTrue(record["user_active"])

        # finish test execution
        log.info("Test OK.")
        log.info("***************************")

    def register_user_with_invalid_parameters(self):
        """Test the register_user method
        with invalid user parameters."""

        log.info("***************************")
        log.info("Running test: register_user_with_invalid_parameters()")

        with self.assertRaises(InvalidUsernameError):
            self.manager.register_user(
                name = "Dasa",
                email = "bojnanska@ledvance.com",
                password = "dasenka125",
                create_password_hash = gen_hash_func,
                data_storage = self.data_storage
            )

        with self.assertRaises(InvalidEmailError):
            self.manager.register_user(
                name = "Dasa_124",
                email = "asfafdsfsfs",
                password = "dasenka125",
                create_password_hash = gen_hash_func,
                data_storage = self.data_storage
            )

        with self.assertRaises(InvalidPasswordError):
            self.manager.register_user(
                name = "Dasa_124",
                email = "bojnanska@ledvance.com",
                password = "ccc",
                create_password_hash = gen_hash_func,
                data_storage = self.data_storage
            )

        # finish test execution
        log.info("Test OK.")
        log.info("***************************")

    def register_already_existing_user(self):
        """Test the register_user method
        with valid user parameters when
        the user already exists."""

        log.info("***************************")
        log.info("Running test: register_already_existing_user()")

        user_id, _ = self.manager.register_user(
            name = "Dasa_127",
            email = "bojnanska@ledvance.com",
            password = "dasenka127",
            create_password_hash = gen_hash_func,
            data_storage = self.data_storage
        )

        # save the user_id for cleanup
        self.user_ids.append(user_id)

        # repeat the registration with the same user mail
        with self.assertRaises(UserAlreadyExistsError):
            self.manager.register_user(
                name = "InaDasa_127",
                email = "bojnanska@ledvance.com",
                password = "dasenka127",
                create_password_hash = gen_hash_func,
                data_storage = self.data_storage
            )

        # repeat the registration with the same user name
        with self.assertRaises(UserAlreadyExistsError):
            self.manager.register_user(
                name = "Dasa_124",
                email = "inabojnanska@ledvance.com",
                password = "dasenka125",
                create_password_hash = gen_hash_func,
                data_storage = self.data_storage
            )

        log.info("Test OK.")
        log.info("***************************")

    def test_02_login_user(self):
        """Test the login_user method."""

        log.info("***************************")
        log.info("Running test: test_02_login_user()")

        user_id, _ = self.manager.register_user(
            name = "Maria12578",
            email = "szaroazova@ledvance.com",
            password = "majka12575h585",
            create_password_hash = gen_hash_func,
            data_storage = self.data_storage
        )

        self.user_ids.append(user_id) # save the user_id for cleanup

        with self.assertRaises(InvalidUsernameError):
            self.manager.login_user(
                name = "maja",
                password = "majka12575h585",
                check_password_hash = chk_hash_func
            )

        with self.assertRaises(InvalidPasswordError):
            self.manager.login_user(
                name = "Maria12578",
                password = "majk",
                check_password_hash = chk_hash_func
            )

        log.info("Test OK.")
        log.info("***************************")

    def test_03_authenticate_user(self):
        """Test the authenticate_user method."""

        log.info("***************************")
        log.info("Running test: test_03_authenticate_user()")

        result = self.manager.authenticate_user(
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDAwMDI0LCJleHBpcmVzIjoiMjAyNC0wOS0wMiJ9.V-6xWYFM8a3nlrdsD2sVDj58_frXu03nnF8e7TqGLuk"
        )

        self.assertIsInstance(result, bool)
        self.assertTrue(result)

        # changing the first 3 character of the token
        # should cause the authentication to fail
        result = self.manager.authenticate_user(
            "xxxhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDAwMDI0LCJleHBpcmVzIjoiMjAyNC0wOS0wMiJ9.V-6xWYFM8a3nlrdsD2sVDj58_frXu03nnF8e7TqGLuk"
        )

        self.assertFalse(result)

        log.info("Test OK.")
        log.info("***************************")

    def test_04_user_user_exists(self):
        """Test the user_exists method."""

        log.info("***************************")
        log.info("Running test: test_04_user_user_exists()")

        user_id, _ = self.manager.register_user(
            name = "Ludmila",
            email = "HUgayeva@ledvance.com",
            password = "Luyda12575556516",
            create_password_hash = gen_hash_func,
            data_storage = self.data_storage
        )

        self.user_ids.append(user_id) # save the user_id for cleanup

        result = self.manager.exists_user(user_id)
        self.assertIsInstance(result, bool)
        self.assertTrue(result)

        result = self.manager.exists_user(user_id + 1)
        self.assertIsInstance(result, bool)
        self.assertFalse(result)

        log.info("Test OK.")
        log.info("***************************")

    def test_05_delete_user(self):
        """Test the delete_user method."""

        log.info("***************************")
        log.info("Running test: test_05_delete_user()")

        user_id, _ = self.manager.register_user(
            name = "JanaHavettova",
            email = "Havettova@ledvance.com",
            password = "kvietok2294944",
            create_password_hash = gen_hash_func,
            data_storage = self.data_storage
        )

        # create case when user does not exist
        with self.assertRaises(UserNotFoundError):
            self.manager.delete_user(user_id + 1, self.data_storage)

        # flag the user record as inactive and attempt to delete the user
        self.db.insert_value(
            self.users_table, "user_id", user_id, "user_active", False
        )

        with self.assertRaises(InactiveUserError):
            self.manager.delete_user(user_id, self.data_storage)

        # now flag the record back as active and attempt to delete the user
        self.db.insert_value(
            self.users_table, "user_id", user_id, "user_active", True
        )

        # delete the user form DB
        self.manager.delete_user(user_id, self.data_storage)

        # check thant the user no longer exists in the DB
        result = self.manager.exists_user(user_id)
        self.assertIsInstance(result, bool)
        self.assertFalse(result)

        # check that the user folder has been deleted
        self.assertFalse(exists(join(self.data_storage, str(user_id))))

        log.info("Test OK.")
        log.info("***************************")

    def test_06_deactivate_user(self):
        """Test the deactivate_user method."""

        log.info("***************************")
        log.info("Running test: test_06_deactivate_user()")

        # create a test user
        user_id, _ = self.manager.register_user(
            name = "LukasLidicky",
            email = "Lidicky@ledvance.com",
            password = "ag6565gfaag",
            create_password_hash = gen_hash_func,
            data_storage = self.data_storage
        )

        # save the user_id for cleanup
        self.user_ids.append(user_id)

        # check that the user is active
        record = self.db.get_record(self.users_table, "user_id", user_id)
        self.assertTrue(record["user_active"])

        # now deactivate the registered user in DB
        self.manager.deactivate_user(user_id)

        # check that the user is no longer active
        record = self.db.get_record(self.users_table, "user_id", user_id)
        self.assertFalse(record["user_active"])

        log.info("Test OK.")
        log.info("***************************")

    def test_07_change_user_password(self):
        """Test the change_user_password method."""

        log.info("***************************")
        log.info("Running test: test_07_change_user_password()")

        # create a test user
        user_id, _ = self.manager.register_user(
            name = "IrynaPan",
            email = "pankova@ledvance.com",
            password = "timotej1254545",
            create_password_hash = gen_hash_func,
            data_storage = self.data_storage
        )

        # store the user_id for cleanup
        self.user_ids.append(user_id)

        # change the password
        self.manager.change_user_password(
            user_id = user_id,
            new_value = "dimitriy1254545",
            create_password_hash = gen_hash_func
        )

        # check that the password has been changed
        record = self.db.get_record(self.users_table, "user_id", user_id)
        self.assertTrue(chk_hash_func(record["user_password"], "dimitriy1254545"))

        log.info("Test OK.")
        log.info("***************************")

def create_test_suite_01():

    log.info("Running the test suite 01...")
    suite = TestSuite()
    suite.addTest(TestUserManagemetService('register_valid_user'))
    suite.addTest(TestUserManagemetService('test_02_login_user'))
    suite.addTest(TestUserManagemetService('test_03_authenticate_user'))
    suite.addTest(TestUserManagemetService('test_04_user_user_exists'))
    suite.addTest(TestUserManagemetService('test_05_delete_user'))
    suite.addTest(TestUserManagemetService('test_06_deactivate_user'))
    suite.addTest(TestUserManagemetService('test_07_change_user_password'))

    return suite


if __name__ == '__main__':

    runner = TextTestRunner()
    runner.run(create_test_suite_01())
