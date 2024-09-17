@ECHO OFF

REM Runs the python Flask server using a virtual environment.
REM This script is used to run the server on Windows.

REM Activate the virtual environment
ECHO ^>^> Activating python environment...
CALL env\Scripts\activate.bat
ECHO ^>^> Python environment successfully activated.

ECHO ^>^> Setting environment variables...
set FLASK_APP=runserver.py
set FLASK_ENV=development
set FLASK_DEBUG=1
ECHO ^>^> Environment variables set.

REM Run the server
ECHO ^>^> Starting the FLASK server...
flask run

pause