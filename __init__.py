import time

from flask import Flask, render_template, redirect, url_for, request, abort
from settings import UPLOADS, ALLOWED_EXTENSIONS
from database.__all_modules import Login, Cookie, Offer
from database import __session
from database.json_worker import open_file_serialize, save_json_to_file
from json import dumps
import datetime
import os
import sys

# Define path to app
sys.path.append(os.path.abspath(os.path.curdir))

# Init app
app = Flask(__name__,
            static_url_path='/public/',
            static_folder='frontend/static/',
            template_folder='frontend/templates/')
app.config['UPLOAD_FOLDER'] = UPLOADS
app.permanent_session_lifetime = datetime.timedelta(days=30)
global_vars = open_file_serialize()

# Init db
__session.global_init("./database/database.db")
session = __session.create_session()


# check permission to upload file
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


@app.route('/check_cookie', methods=['GET'])
def check_cookie(token=None):
    if token is None:
        token = request.cookies.get('token')
    res = False
    if token is not None:
        res = Cookie.check_cookie(session, token)
    return dumps(res)


@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
@app.route('/login', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        login = request.form['login']
        password = request.form['password']
        if Login.check_login(session, login, password):
            cookie = Cookie.create_cookie(session)
            if cookie is None:
                return redirect(url_for('index'))
            red = redirect(url_for('dashboard'))
            red.set_cookie('token', cookie, max_age=60 * 60 * 24 * 30)
            global_vars[str(cookie)] = {}
            save_json_to_file(global_vars)
            return red
    elif request.method == 'GET':
        return render_template('login.html')
    else:
        return abort(404)


@app.route('/dashboard/', methods=['GET', 'POST'])
def dashboard():
    if request.method == 'GET':
        fetch = bool(request.args.get('fetch'))
        if fetch:
            resp = Offer.get_auto(session)
            return dumps(resp)
        return render_template('index.html', title='Доска объявлений / AdPoster', path='/public/js/dashboard.js', uploader=False)



@app.route('/library', methods=['GET'])
def library():
    if global_vars[str(request.cookies.get('token'))] is not None and global_vars[str(request.cookies.get('token'))]:
        global_vars[str(request.cookies.get('token'))] = False
        save_json_to_file(global_vars)
        return render_template('index.html', title='Библиотека фото / AdPoster', path='/public/js/library.js', success=True, uploader=True)
    return render_template('index.html', title='Библиотека фото / AdPoster', path='/public/js/library.js', success=False, uploader=True)


@app.route('/account', methods=['GET'])
def account():
    return render_template('index.html', title='Учетные записи / AdPoster', path='/public/js/account.js', uploader=False)


@app.route('/offer', methods=['GET', 'POST'])
def offer():
    if request.method == 'GET':
        existed = check_cookie(token=request.cookies.get('token'))
        if existed:
            return render_template('offer.html')
    elif request.method == 'POST':
        existed = check_cookie(token=request.cookies.get('token'))
        if existed:
            data = request.get_json(force=True)
            Offer.add_auto(session, data)
            return dumps(True)
    return redirect(url_for('index'))


@app.route('/upload/', methods=['POST', 'GET'])
def upload():
    if request.method == 'POST':
        existed = check_cookie(request.cookies.get('token'))
        if existed:
            files = request.files.getlist("file")
            excludes = []
            for file in files:
                if file and allowed_file(file.filename):
                    try:
                        if file.filename in excludes:
                            continue
                        filename = f"{time.time()}.{file.filename.rsplit('.', 1)[1]}"
                        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                        global_vars[str(request.cookies.get('token'))] = True
                        save_json_to_file(global_vars)
                        excludes.append(file.filename)
                    except Exception as err:
                        print(err)
                        continue
                else:
                    return dumps(False)
            return redirect(url_for('library'))
    elif request.method == 'GET':
        existed = check_cookie(request.cookies.get('token'))
        if existed:
            if request.args.get('obj'):
                response = list()
                for i in os.listdir(UPLOADS):
                    response.append({
                        "url": i,
                        "datetime": i.split('.')[0],
                        "offers": Offer.get_titles_via_image(session, i),
                    })
            else:
                response = os.listdir(UPLOADS)
                response.sort(key=lambda x: int(x.split('.')[0]))
            return dumps(response)
        else:
            return dumps([])
    return abort(404)


def main():
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)


if __name__ == '__main__':
    main()
