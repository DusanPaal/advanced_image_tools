"""Module to unit test the server app."""

import datetime as dt
import logging
import os
from unittest import TestCase, TextTestRunner, TestSuite
from security import Credentials, XOREncryptor

# initialize logging for the tests
tag = dt.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
log_filename = f"logs/tests_user_management_{tag}.log"

logging.basicConfig(
    filename=log_filename,
    filemode='w',
    level=logging.DEBUG
)

log = logging.getLogger(__name__)

class TestSecurityXorEncryptor(TestCase):
    """Unit tests for the UserManagementService class."""

    def setUp(self) -> None:
        """Set up the test."""

        log.info("============================")
        log.info("Setting up new test...")
        env_key = 'PostgresDbCredentials'
        credentials_dir = os.getenv(env_key)
        assert credentials_dir is not None, (
            "Could not find the environment "
            f"variable for key: {env_key}"
        )
        self.credentials_path = os.path.join(
        credentials_dir, 'credentials.enc')
        self.encryptor = XOREncryptor('my_secret_key')
        log.info("Test setup completed...")

    def tearDown(self) -> None:
        """Tear down the test."""

        log.info("Tearing down test...")
        self.credentials_path = None
        log.info("Test teardown completed.")
        log.info("============================\n")

    def store_valid_credentials(self):
        """Test the register_user method."""

        Credentials(self.encryptor).store({
            'user': 'postgres',
            'password': 'Nios3eed'
        }, self.credentials_path)

    def load_valid_credentials(self):
        """Test the register_user method."""

        credentials = Credentials(self.encryptor).load(
            self.credentials_path)

        self.assertIsInstance(credentials, dict)
        self.assertEqual(credentials['user'], 'postgres')
        self.assertEqual(credentials['password'], 'Nios3eed')

    def store_invalid_credentials(self):
        """Test the register_user method."""

        with self.assertRaises(ValueError):
            Credentials(self.encryptor).store({
                'user': '',
                'password': 'Nios3eed'
            }, self.credentials_path)

        with self.assertRaises(ValueError):
            Credentials(self.encryptor).store({
                'user': 'postgres',
                'password': ''
            }, self.credentials_path)

        with self.assertRaises(TypeError):
            Credentials(self.encryptor).store({
                'user': 1,
                'password': ''
            }, self.credentials_path)

        with self.assertRaises(TypeError):
            Credentials(self.encryptor).store({
                'user': 'postgres',
                'password': 1
            }, self.credentials_path)

        with self.assertRaises(TypeError):
            Credentials(self.encryptor).store({
                'user': 1,
                'password': 1
            }, self.credentials_path)

def create_test_suite_01():

    print("Running the test suite 01...")
    suite = TestSuite()
    suite.addTest(TestSecurityXorEncryptor('store_valid_credentials'))
    suite.addTest(TestSecurityXorEncryptor('load_valid_credentials'))
    suite.addTest(TestSecurityXorEncryptor('store_invalid_credentials'))
    return suite


# separate test suite for the authenticator

if __name__ == '__main__':

    runner = TextTestRunner()
    runner.run(create_test_suite_01())
