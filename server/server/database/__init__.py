"""Module to interact with the database."""

import sqlalchemy as sqal
from sqlalchemy.sql.expression import bindparam
from sqlalchemy import MetaData, select, column
from sqlalchemy.sql.schema import Table
from sqlalchemy.sql.selectable import Select
from sqlalchemy.engine.base import Connection
from sqlalchemy.engine.cursor import CursorResult

class Database:
    """Class to interact with the database."""

    def __init__(
        self, host: str, port: int, db_name: str,
        user_name: str, password: str,
        debug: bool = False) -> None:
        """Connect to the database engine.

        Parameters:
	    -----------
        host:
            Name of the database hosting server.

        port:
            Number of the port to connect to the server.

        db_name:
            Name of the database.

        user_name
            A valid user name.

        password:
            A valid password.
        """

        self._host = host
        self._port = port
        self._db_name = db_name
        self._user_name = user_name
        self._password = password
        self._debug = debug

        self._conn = None

        url = "postgresql+psycopg2://{}:{}@{}:{}/{}".format(
            self._user_name, self._password,
            self._host, self._port, self._db_name
        )

        pool_debug = "debug" if self._debug else False

        if self._debug:
            print("Database connection URL:", url)

        engine = sqal.create_engine(url, echo_pool = pool_debug)

        try:
            self._conn = engine.connect()
        except:
            engine.dispose()
            raise

    def __del__(self):
        """Disconnect from the database
        when the object is deleted."""

        if self._conn is not None:
            self.disconnect()

    @property
    def connection(self) -> Connection:
        """Get the database connection object."""
        return self._conn

    def _compile_record(self, result: list, columns) -> dict:
        """Convert the data retrieved as the result of a query
        into a dictionary of field names and their values.
        """

        if len(result) == 0:
            return {}

        compiled = result[0] if isinstance(result, list) else result

        record = {}

        for idx, col in enumerate(columns):
            record.update({col.name: compiled[idx]})

        return record

    def _execute_query(self, query: Select|str, data: list = None) -> CursorResult:
        """Execute a database query and return the result."""

        try:
            if data is None:
                response = self._conn.execute(query)
            else:
                response = self._conn.execute(query, data)
        except:
            self._conn.connection.rollback()
            raise

        self._conn.connection.commit()

        return response

    def disconnect(self) -> None:
        """Disconnect from the database engine."""

        if self._conn is not None:
            self._conn.close()
            self._conn = None

    def get_table(self, name: str, schema: str = None) -> Table:
        """Get a database table.

        Parameters:
        -----------
        name:
            The name of the table

        schema:
            The name of the schema under which the table
            resides in the database (default: None).

            By default, the schema is not considered when
            detecting the table in the database. If a schema
            name is specified, then that schema will be used
            when searching for the specified table.

        Returns:
        --------
        An object that represents the database table.

        Raises:
        -------
        TableNotFoundError:
            When a table with the specified name does not exist in the database.
        """

        return Table(name, MetaData(), autoload_with = self._conn, schema = schema)

    def get_record(self, table: Table, key_column: str, key: any) -> dict:
        """Get a record from a database table.

        Parameters:
        -----------
        table:
            The name of the database table where the record is stored.

        key_column:
            The name of the column that contains the key value.

        key:
            The ID number of the record to be retrieved.

        Returns:
        --------
        The record retrieved from the database.

        Raises:
        -------
        RecordNotFoundError:
            When no record with the specified key is found in the database table.
        """

        query = select('*').where(table.c[key_column] == key)
        response = self._execute_query(query)
        result = response.fetchall()
        record = self._compile_record(result, table.columns)

        return record

    def create_record(self, table: Table, **params) -> int|None:
        """Create a new record in the database and return it's ID.

        Parameters:
        -----------
        table:
            Database table where the record is created.

        params:
            Names of table columns and the corresponding values to be stored.

        Returns:
        --------
        The ID number of the record created in the database table.
        If the operation fails, then None is returned.
        """

        query = table.insert().values(params)
        result = self._execute_query(query)

        # docasne riesenie. do buducna radsej sprait v tabulke primary key
        if len(result.inserted_primary_key) == 0:
            return None

        rec_id = result.inserted_primary_key[0]

        return rec_id

    def delete_record(self, table: Table, column: str, record_id: int) -> dict:
        """Delete a record from the database.

        Parameters:
        -----------
        table:
            The name of the database table where the record is stored.

        column:
            The name of the column that contains the key value.

        record_id:
            The ID number of the record to be deleted.

        Returns:
        --------
        The deleted record.
        """

        query = table.delete().where(table.c[column] == record_id).returning(table)
        response = self._execute_query(query)
        result = response.fetchall()
        record = self._compile_record(result, table.columns)

        return record

    def insert_value(
        self, table: Table, key_column: str, key: int,
        value_column: str, value: any) -> None:
        """Insert a value into a specific field
        in a database record.

        Parameters:
        -----------
        table:
            Database table where the record is stored.

        key:
            The ID number of the record.

        key_column:
            The name of the column that contains the key value.

        value_column:
            The name of the column where the value is stored.

        value:
            The value to be inserted into the field.

        Raises:
        -------
        RecordNotFoundError:
            When no record with the specified
            key is found in the database table.

        ConnectionError:
            When attempting to use the procedure
            when no connection to the database exists.

        ValueError:
            When the value to be inserted
            is of an unexpected type.
        """

        query = table.update().where(
            table.c[key_column] == key
        ).values({value_column: value})

        self._execute_query(query)


if __name__ == "__main__":

    import unittest

    class TestDatabase(unittest.TestCase):

        def setUp(self):

            self.db = Database(
                host="localhost",
                port=5432,
                db_name="postgres",
                user_name="postgres",
                password="Nios3eed",
                debug = True
            )

            self.user_table = self.db.get_table(name = "users", schema = "public")
            self.assertIsNotNone(self.user_table)

        def tearDown(self):
            self.db.disconnect()
            self.assertIsNone(self.db.connection)

        def test_create_record(self):
            self.db.create_record(
                self.user_table,
                user_name = "Dusan",
                user_email = "dusanpaal@gmail.com",
                user_password = "Nios3eed"
            )

        def test_get_record(self):
            record = self.db.get_record(self.user_table, "user_id", 1000001)
            self.assertIsNotNone(record)
            self.assertEqual(record["user_id"], 1000001)
            self.assertEqual(record["user_name"], "DusanPaal")
            self.assertEqual(record["user_email"], "dusanpaal@gmail.com")
            self.assertEqual(record["user_password"], "Nios3eed")

        # def test_insert_value(self):
        #     self.db.insert_value(self.user_table, "user_id", 1000001, "user_name", "DusanPaal")

        #     record = self.db.get_record(self.user_table, "user_id", 1000001)
        #     self.assertIsNotNone(record)
        #     self.assertEqual(record["user_id"], 1000001)
        #     self.assertEqual(record["user_name"], "DusanPaal")
        #     self.assertEqual(record["user_email"], "dusanpaal@gmail.com")
        #     self.assertEqual(record["user_password"], "Nios3eed")

        # def test_delete_record(self):

        #     record = self.db.delete_record(self.user_table, "user_id", 1000003)
        #     self.assertIsNotNone(record)
        #     self.assertEqual(record["user_id"], 1000003)
        #     self.assertEqual(record["user_name"], "Dusan")
        #     self.assertEqual(record["user_email"], "dusanpaal@gmail.com")
        #     self.assertEqual(record["user_password"], "Nios3eed")

    unittest.main()
