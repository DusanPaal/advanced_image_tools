"""The Flask application package (cmpatible with Flask version: 3.0.2)

1. Run the runserver.bat script in the server folder to start the FLASK server.

2. start Vite servers for the image editor and scanner:
    cd client
    npm run dev

3. Load home page: http://localhost:5000/home

4. Run the web application:
    image editor: http://localhost:5174/
    image scanner: http://localhost:5173/


User Authentication and Security Measures:
------------------------------------------
If the user tampers with the login parameters, the server should respond
with an appropriate error message and take necessary security measures:

1.  Invalid Username or Password (implemented):
    If the user provides an invalid username or password, the server should
    respond with a generic error message like "Invalid username or password"
    without providing specific details. This helps prevent potential attackers
    from guessing valid usernames or passwords.

2.	Brute-Force Protection (implemented):
    To protect against brute-force attacks, where an attacker repeatedly
    tries different login combinations, the server can implement measures
    like rate limiting or account lockouts. For example, after a certain
    number of failed login attempts, the server can temporarilylock the
    account or introduce a delay before allowing further login attempts.

3.	Logging and Monitoring (implemented):
    It's important for the server to log any suspicious login attempts or tampering
    activities. This can help in identifying potential security threats and taking
    appropriate actions to mitigate them.

4.	Session Management (implementation pending):
    If the server detects tampering with session data or authentication tokens,
    it should immediately invalidate the session and log out the user. This
    prevents unauthorized access to sensitive information or actions.

5.	Security Auditing:
    Regular security audits should be conducted to identify and fix any
    vulnerabilities in the login system. This includes checking for common
    security issues like SQL injection, cross-site scripting (XSS), and
    cross-site request forgery (CSRF).
"""

# python-builtin modules
import datetime as dt
from logging import config, getLogger, FileHandler
import os
from os.path import join, dirname
from datetime import datetime
from http.client import UNAUTHORIZED, INTERNAL_SERVER_ERROR
from functools import wraps

# third-party modules
import yaml
from flask import (
    Flask, redirect, render_template,
    request, session, make_response,
    url_for
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash as gen_hash_func
from werkzeug.security import check_password_hash as chk_hash_func

# local custom modules
from server.security import (
    Credentials, XOREncryptor,
    Authenticator, HS256Algorithm
)
from server.database import Database
from server.services.user_management import (
    UserManager, InvalidPasswordError,
    InvalidEmailError, InvalidUsernameError,
    UserAlreadyExistsError, DatabaseError,
    FolderCreationError, MaxLoginAttemptsExceededError
)

from server.services.editor_management import (
    EditorManager, InvalidImageFormatError
)

# ==== initialize the logging system ====
log_tag = dt.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
log_path = f"logs/runtime/server_{log_tag}.log"
log_cfg_path = "logconfig.yaml"

with open(log_cfg_path, encoding = "utf-8") as fs:
    log_config = yaml.safe_load(fs.read())

config.dictConfig(log_config)
log = getLogger("master")

assert log.handlers, "Logger has no handlers!"
prev_filehandler = log.handlers.pop(1)
new_filehandler = FileHandler(log_path)
new_filehandler.setFormatter(prev_filehandler.formatter)
log.addHandler(new_filehandler)


log.info("======= Server START =======")

# ==== create the Flask application and set the secret key ====
log.info("Initializing FLASK application...")
app = Flask(__name__)
CORS(app)
env_secret_key = 'SECRET_KEY'
app.secret_key = os.getenv(env_secret_key)
assert app.secret_key is not None, (
    f"The environment key '{env_secret_key}' not found!")
log.info("Application initialized successfully.")


# ==== compile the path to the user data storage root folder ====
log.info("Setting up user data storage...")
data_storage = join(dirname(__file__), "data", "users")
log.info("User data storage setup completed.")


# ==== create a database connection ====
log.info("Establishing connection to database...")
credentials_dir = os.getenv('PostgresDbCredentials')
credentials_path = os.path.join(credentials_dir, 'credentials.enc')
encryptor = XOREncryptor('my_secret_key')
credentials = Credentials(encryptor).load(credentials_path)

database = Database(
    host='localhost',
    port=5432,
    db_name='postgres',
    user_name=credentials['user'],
    password=credentials['password'],
    debug = False
)
log.info("Database connection established successfully.")


# ==== create a user manager instance ====
log.info("Initializing service: User Management ...")
authenticator = Authenticator("some_secret_key", HS256Algorithm)

user_manager = UserManager(
    db = database,
    table = "users",
    schema = "public",
    uid_column = "user_id",
    auth = authenticator,
    max_login_tries = 3,
    login_wnd = 1,
    login_lock_wnd = 60
)
log.info("Service initialized successfully.")


log.info("Initializing service: Editor Management ...")
editor_manager = EditorManager()
log.info("Service initialized successfully.")


log.info("======= Server RUNNING =======")

# decorator to check if the user is logged in
def login_required(func):
    """Decorator to check if the user is logged in."""

    @wraps(func)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('authentication'))
        return func(*args, **kwargs)

    return decorated_function


# endpoints
@app.route('/')
@app.route('/home')
def home():
    """Renders the home page."""

    return render_template(
        'home.html',
        title = 'AIP tools', # Advanced Image Processing
        year = datetime.now().year,
        user_logged_in = session.get('user_id') is not None,
        user_name = session.get('user_name', '')
    )


@app.route('/contact')
def contact():
    """Renders the contact page."""

    return render_template(
        'contact.html',
        title='Developer contact info',
        year=datetime.now().year
    )


@app.route('/about')
def about():
    """Renders the about page."""

    return render_template(
        'about.html',
        title='About the project',
        year=datetime.now().year,
        message='Advanced Image Processing Tools'
    )


@app.route('/register', methods = ['POST', 'GET'])
def register():
    """Registers a new user."""

    if request.method == 'GET':
        return render_template('register.html')

    user_name = request.form['username']
    user_email = request.form['email']
    user_password = request.form['password']

    log.info(
        "Registering new user: name = '%s'; email = '%s'; password = '%s'",
        user_name, user_email, user_password
    )

    try:
        user_id, auth_token = user_manager.register_user(
            user_name, user_email, user_password,
            gen_hash_func, data_storage)
    except InvalidPasswordError as err:
        log.exception(err)
        # should highlight the error in the password field on the form
        return str(err)
    except InvalidEmailError as err:
        log.exception(err)
        # should highlight the error in the email field on the form
        return str(err)
    except InvalidUsernameError as err:
        log.exception(err)
        # should highlight the error in the username field on the form
        return str(err)
    except UserAlreadyExistsError as err:
        log.exception(err)
        # should highlight the error in the username or email field on the form
        return str(err)
    except (DatabaseError, FolderCreationError) as err:
        log.exception(err)
        return "An error occurred while registering the user!"

    # store the user ID in the session
    session['user_id'] = user_id
    session['user_name'] = user_name

    log.info("User registered successfully under ID: %d!", user_id)

    # redirect the webside to the home page
    response = make_response(redirect(url_for('home')))
    response.set_cookie('auth_token', auth_token) #, httponly = True, secure = True, samesite='Lax')

    # final check to ensure that the user ID and name are stored in the session
    assert session.get('user_id') is not None, "User ID not stored in session!"
    assert session.get('user_name') is not None, "User name not stored in session!"

    # send the response to the client browser
    return response


@app.route('/authenticate', methods = ['POST',  'GET'])
def authenticate():
    """Authenticates users who access
    an application directly via the URL.

    The endpoint is called from the React application.
    """

    response = make_response()

    log.debug(request.authorization)
    token = str(request.authorization).replace("Bearer ", "")

    try:
        token_valid = user_manager.authenticate_user(token)
    except Exception as err:
        print(err)
        response.ok = False
        response.status_code = INTERNAL_SERVER_ERROR
        return response

    if not token_valid:
        response.ok = True
        response.status_code = UNAUTHORIZED

    # send the response to the client browser
    return response

@app.route('/login', methods = ['POST', 'GET'])
def login():
    """Logs in an existing user."""

    if request.method == 'GET':
        return render_template('login.html', message = "")

    user_name = request.form['username']
    user_password = request.form['password']

    log.info("Logging in user: %s", user_name)

    if user_manager.user_is_locked(user_name):
        log.warning("User account locked: %s", user_name)
        return render_template('login.html', message = (
            f"The account is temporarily locked due to multiple failed "
            "login attempts within a short time window. Next login possible in "
            f"{user_manager.calculate_next_login_timeout(user_name).minutes} minutes "
            f"{user_manager.calculate_next_login_timeout(user_name).seconds} seconds."
        ))

    try:
        user_id = user_manager.login_user(
            user_name, user_password, chk_hash_func)
    except (InvalidUsernameError, InvalidPasswordError) as err:
        # should display the error message in the login form
        log.error(err)
        log.debug(request)
        return render_template('login.html', message = (
            "Invalid user name or password."
        ))
    except MaxLoginAttemptsExceededError as err:
        log.error(err)
        log.warning(
            "The user '%s' has reached the maximum of %d "
            "allowed login times within a short time window. "
            "This may indicate suspicious activity.", user_name,
            user_manager.max_login_attempts)
        log.warning("Locking user account...")
        user_manager.lock_user(user_name)
        log.info(
            "User account is locked until: %s",
            user_manager.get_lock_time(user_name)
        )
        return render_template('login.html', message = (
            f"The account is temporarily locked due to multiple failed "
            "login attempts within a short time window. Next login possible in "
            f"{user_manager.calculate_next_login_timeout(user_name).minutes} minutes "
            f"{user_manager.calculate_next_login_timeout(user_name).seconds} seconds."
        ))
    except DatabaseError as err:
        log.exception(err)
        return render_template(
            'login.html', message = "An error occurred while logging in the user!"
        )

    log.info('User successfully logged in: %s', user_name)

    # store the user ID in the session
    session['user_id'] = user_id
    session['user_name'] = user_name

    # redirect the webside to the home page
    response = make_response(redirect(url_for('home')))

    # final check to ensure that the user ID and name are stored in the session
    assert session.get('user_id') is not None, "User ID not stored in session!"
    assert session.get('user_name') is not None, "User name not stored in session!"

    # send the response to the client browser
    return response


@app.route('/logout')
def logout():
    """Logs out an active user."""

    user_id = session.get('user_id')
    user_name = session.get('user_name')

    assert user_id is not None, "User is not logged in!"
    assert user_name is not None, "User is not logged in!"

    log.info("Logging out user: %d", user_id)

    # remove all session data for the current
    # user, without resetting the session ID
    session.clear()

    assert session.get('user_id') is None, "User ID not removed from session!"
    assert session.get('user_name') is None, "User name not removed from session!"

    # redirect the webside to the home page
    response = make_response(redirect(url_for('home')))

    log.info("User successfully logged out.")

    # send the response to the client browser
    return response

@app.route('/delete_account')
def delete_account():
    """Logs out an active user."""

    user_id = session.get('user_id')
    user_name = session.get('user_name')

    assert user_id is not None, "User is not logged in!"
    assert user_name is not None, "User is not logged in!"

    # remove all session data for the current
    # user, without resetting the session ID
    session.clear()

    assert session.get('user_id') is None, "User ID not removed from session!"
    assert session.get('user_name') is None, "User name not removed from session!"

    # delete the user account
    log.info("Deleting account for user: %d ...", user_id)

    try:
        user_manager.delete_user(user_id, data_storage)
    except InvalidUsernameError as err:
        log.error(err)
        return "Cannot delete the account. The user does not exist!"
    except DatabaseError as err:
        log.exception(err)
        return "An error occurred while deleting the user account!"

    # redirect the webside to the home page
    response = make_response(redirect(url_for('home')))

    log.info("Account successfully deleted.")

    # send the response to the client browser
    return response

@app.route('/change_password', methods = ['POST', 'GET'])
def change_password():
    """Logs in an existing user."""

    if request.method == 'GET':
        return render_template('change_password.html')

    assert session.get('user_id') is not None, "User is not logged in!"
    assert session.get('user_name') is not None, "User is not logged in!"

    log.info("Changing password for user: %d", session['user_id'])

    user_name = request.form['username']
    new_user_password = request.form['new_password']
    confirm_password = request.form['confirm_password']

    log.debug(
        "User name: %s; new password: %s; confirmed password: %s",
        user_name, new_user_password, confirm_password
    )

    if user_name != session['user_name']:
        log.error("User name does not match the logged in user!")
        return "User name does not match the logged in user!"

    if new_user_password != confirm_password:
        log.error("The new and confirmed passwords do not match!")
        return "Passwords do not match!"

    try:
        user_manager.change_user_password(
            session['user_id'],
            new_user_password,
            gen_hash_func
        )
    except InvalidPasswordError as err:
        # should highlight the error in the password field on the form
        log.error(err)
        return str(err)
    except InvalidUsernameError as err:
        # should highlight the error in the username field on the form
        log.error(err)
        return str(err)
    except DatabaseError as err:
        log.exception(err)
        return "An error occurred while changing the user account!"

    log.info("Password successfully changed.")

    return make_response(redirect(url_for('home')))

@app.route('/profile')
def profile():
    """Opens the user profile."""

    return render_template('profile.html')

@app.route('/editor')
def editor():
    """Starts image editor."""

    if "user_id" not in session:
        return render_template('authentication.html')

    return redirect('http://localhost:5174/')

@app.route('/scanner')
def scanner():
    """Starts image scanner."""

    if "user_id" not in session:
        return render_template('authentication.html')

    return redirect('http://localhost:5173/')

@app.route('/upload_image', methods = ['POST'])
def upload_image():
    """Upload a file to the server."""

    # since user must always be logged into
    # an app to upload a file, we don't need
    # to check if the user is logged in, just
    # check if the method is called correctly
    assert "user_id" not in session, "Invalid route call!"

    data = request.get_json()

    # Check if a file is part of the request
    if 'content' not in data:
        return make_response("No content part in request!", 400)

    # Check if a file name is part of the request
    if 'filename' not in data:
        return make_response("No file name part in request!", 400)

    # If the user does not select a file
    if data['filename'] == '':
        return make_response("No selected image!", 400)

    log.info("Uploading image...")
    dst_folder = r"E:\AdvancedImageTools\server\server\data\users"
    log.debug("Upload directory: %s", dst_folder)
    image = editor_manager.decode_image(data['content'])

    # save the file to the user data folder that exists on the server
    try:
        img_path = editor_manager.save_file(dst_folder, data['filename'], image)
    except InvalidImageFormatError as err:
        log.error(err)
        return make_response("Unsupported image format!", 400)

    log.debug("Uploaded image: %s", img_path)
    log.info("Image successfully uploaded.")

    return make_response('File successfully uploaded.', 200)


if __name__ == "__main__":
    # delete user with ID 1000026 from the database
    # and the user data folder
    assert user_manager.user_exsists(1000028)
    user_manager.delete_user(1000028)
    assert not user_manager.user_exsists(1000028)
    print("User deleted successfully!")
