from flask import Flask, Response, request, abort
from datetime import datetime, timedelta
import hashlib
import sqlite3
import os
import smtplib
from email.message import EmailMessage
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

HEADERS = {
    'Access-Control-Allow-Origin': '*',
}

app = Flask(__name__)


def _get_serializer() -> URLSafeTimedSerializer:
    secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    return URLSafeTimedSerializer(secret_key=secret_key)


def _send_email(subject: str, to_email: str, body: str) -> None:
    host = os.environ.get("SMTP_HOST")
    port = int(os.environ.get("SMTP_PORT", "587"))
    username = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASSWORD")
    use_tls = os.environ.get("SMTP_USE_TLS", "true").lower() == "true"

    if not host or not username or not password:
        # In production, ensure SMTP is configured. Silently no-op if not configured.
        return

    msg = EmailMessage()
    msg["From"] = username
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(host, port) as server:
        if use_tls:
            server.starttls()
        server.login(username, password)
        server.send_message(msg)

def is_officer(email):
    with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
        cursor = conn.cursor()
        user = cursor.execute("""SELECT 1 FROM user_info WHERE is_officer = 1 AND email = ?""", [email])
        user = user.fetchone()
        return user is not None

@app.route("/")
def main():
    return "Online."

@app.post("/user_points")
def user_points():
    data = request.get_json(force=True)

    try:
        email = data["email"]
    except KeyError:
        abort(400)
        
    with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
        cursor = conn.cursor()
        points_row = cursor.execute("SELECT points FROM user_info WHERE email = ?", [email]).fetchone()

    if points_row is None:
        return {'message': 'Invalid user.'}, 404, HEADERS

    return {"points": points_row[0]}, 200, HEADERS

@app.post("/is_valid_session")
def is_valid_session():
    data = request.get_json(force=True)
    
    try:
        email = data["email"]
        session_id = data["session_id"]
    except KeyError:
        abort(400)
    except TypeError:
        {"is_valid_session": False}, 200, HEADERS

    with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
        cursor = conn.cursor()
        session = cursor.execute("""
        SELECT expires
        FROM session_info
        WHERE session_id = ? AND email = ?
        """,
        [session_id, email]).fetchone()

    if session is None or session[0] < datetime.now():
        return {"is_valid_session": False}, 200, HEADERS
    return {"is_valid_session": True}, 200, HEADERS

@app.post("/is_officer")
def officer():
    data = request.get_json(force=True)

    try:
        email = data["email"]
    except KeyError:
        abort(400)
        
    return {"is_officer": is_officer(email)}, 200, HEADERS

@app.post("/create_account")
def create_account():
    data = request.get_json(force=True)

    try:
        name = data["name"]
        email = data["email"]
        password = data["password"]
    except KeyError:
        abort(400)

    with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
        cursor = conn.cursor()
        user = cursor.execute("""
        SELECT 1
        FROM user_info
        WHERE email = ?
        """,
        [email]).fetchone()

        if user is not None:
            return {'message': 'A user with that email already exists.'}, 404, HEADERS

        cursor.execute("""
        INSERT INTO user_info(email, name, password)
        VALUES (?, ?, ?)
        """,
        [email, name, password])
        conn.commit()

    return Response(status=201, headers=HEADERS)

@app.post("/login")
def login():
    data = request.get_json(force=True)
    
    try:
        email = data["email"]
        password = data["password"]
    except KeyError:
        abort(400)

    with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
        cursor = conn.cursor()
        user = cursor.execute("""
        SELECT 1
        FROM user_info
        WHERE email = ? AND password = ?
        """,
        [email, password]).fetchone()

        if user is None:
            return {'message': 'Invalid login information.'}, 404, HEADERS
        
        now = datetime.now()
        session_id = hashlib.sha256(f"{email}{password}{now}".encode()).hexdigest()
        cursor.execute("""
        INSERT INTO session_info
        VALUES (?, ?, ?)
        """,
        [session_id, email, now + timedelta(days=7)])

    return {"session_id": session_id}, 201, HEADERS

@app.post("/submitted_tasks")
def submitted_tasks():
    data = request.get_json(force=True)

    try:
        email = data["email"]
    except KeyError:
        abort(400)

    with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
        cursor = conn.cursor()
        if is_officer(email):
            stuff = cursor.execute(
                """
                SELECT t.submission_id, t.task_id, t.email, u.name, t.submission
                FROM tasks t
                LEFT JOIN user_info u ON u.email = t.email
                WHERE t.accepted = 0
                ORDER BY t.submission_id DESC
                """
            ).fetchall()
        else:
            stuff = cursor.execute(
                """
                SELECT t.submission_id, t.task_id, t.email, u.name, t.submission
                FROM tasks t
                LEFT JOIN user_info u ON u.email = t.email
                WHERE t.accepted = 0 AND t.email = ?
                ORDER BY t.submission_id DESC
                """,
                [email]
            ).fetchall()
        
    tasks = []
    for row in stuff:
        tasks.append({
            "submission_id": row[0],
            "task_id": row[1],
            "email": row[2],
            "name": row[3],
            "submission": row[4],
        })

    return {'data': tasks}, 200, HEADERS

@app.post("/accepted_tasks")
def accepted_tasks():
    data = request.get_json(force=True)

    try:
        email = data["email"]
    except KeyError:
        abort(400)

    with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
        cursor = conn.cursor()
        if is_officer(email):
            stuff = cursor.execute(
                """
                SELECT t.submission_id, t.task_id, t.email, u.name, t.submission
                FROM tasks t
                LEFT JOIN user_info u ON u.email = t.email
                WHERE t.accepted = 1
                ORDER BY t.submission_id DESC
                """
            ).fetchall()
        else:
            stuff = cursor.execute(
                """
                SELECT t.submission_id, t.task_id, t.email, u.name, t.submission
                FROM tasks t
                LEFT JOIN user_info u ON u.email = t.email
                WHERE t.accepted = 1 AND t.email = ?
                ORDER BY t.submission_id DESC
                """,
                [email]
            ).fetchall()
        
    tasks = []
    for row in stuff:
        tasks.append({
            "submission_id": row[0],
            "task_id": row[1],
            "email": row[2],
            "name": row[3],
            "submission": row[4],
        })

    return {'data': tasks}, 200, HEADERS

@app.get("/leaderboard")
def leaderboard():
    users = []
    with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
        cursor = conn.cursor()
        for row in cursor.execute("""
        SELECT name, points FROM user_info
        WHERE points > 0
        ORDER BY points DESC
        """).fetchall():
            users.append({
                "name": row[0],
                "points": row[1],
            })

    return {'data': users}, 200, HEADERS


@app.post("/user_list")
def user_list():
    data = request.get_json(force=True)

    try:
        email = data["email"]
    except KeyError:
        abort(400)

    # Only officers can view the full user list
    if not is_officer(email):
        return {"message": "Unauthorized"}, 401, HEADERS

    users = []
    with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
        cursor = conn.cursor()
        rows = cursor.execute("""
            SELECT email, name, points
            FROM user_info
            ORDER BY points DESC, name ASC
        """).fetchall()
        for row in rows:
            users.append({
                "email": row[0],
                "name": row[1],
                "points": row[2],
            })

    return {"count": len(users), "data": users}, 200, HEADERS

@app.post("/submit_task")
def submit_task():
    data = request.get_json(force=True)

    try:
        email = data["email"]
        task_id = int(data["task_id"])
        submission = data["submission"]
    except KeyError:
        abort(400)

    with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
        cursor = conn.cursor()
        count = cursor.execute("""
        SELECT COUNT(*)
        FROM tasks
        WHERE task_id = ? AND email = ?
        """,
        [task_id, email]).fetchone()[0]
        
        task_limit = cursor.execute("""
        SELECT "limit"
        FROM task_info
        WHERE task_id = ?
        """,
        [task_id]).fetchone()

        if task_limit is None:
            return {'message': 'Invalid task.'}, 404, HEADERS
        
        if task_limit[0] != -1 and count >= task_limit[0]:
            return {'message': 'Maximum submissions reached.'}, 404, HEADERS

        cursor.execute("""
        INSERT INTO tasks(task_id, email, submission, accepted)
        VALUES (?, ?, ?, ?)
        """,
        [task_id, email, submission, 0])
        conn.commit()

    return Response(status=201, headers=HEADERS)


@app.post("/forgot_password")
def forgot_password():
    data = request.get_json(force=True)

    try:
        email = data["email"]
    except KeyError:
        abort(400)

    # Always respond 200 to avoid account enumeration
    try:
        with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
            cursor = conn.cursor()
            exists = cursor.execute("SELECT 1 FROM user_info WHERE email = ?", [email]).fetchone() is not None
    except Exception:
        exists = False

    if exists:
        serializer = _get_serializer()
        token = serializer.dumps(email)
        base_url = os.environ.get("BASE_URL", "https://tino-eco.com")
        reset_link = f"{base_url}/reset.html?token={token}"
        body = (
            "You requested a password reset for your CORE Challenge account.\n\n"
            f"Click the link below to reset your password (valid for 1 hour):\n{reset_link}\n\n"
            "If you did not request this, you can ignore this email."
        )
        try:
            _send_email("Reset your CORE Challenge password", email, body)
        except Exception:
            pass

    return {"message": "If an account exists, a reset email was sent."}, 200, HEADERS


@app.post("/reset_password")
def reset_password():
    data = request.get_json(force=True)

    try:
        token = data["token"]
        new_password = data["new_password"]
    except KeyError:
        abort(400)

    serializer = _get_serializer()
    try:
        email = serializer.loads(token, max_age=3600)
    except SignatureExpired:
        return {"message": "Reset link expired."}, 400, HEADERS
    except BadSignature:
        return {"message": "Invalid reset link."}, 400, HEADERS

    with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
        cursor = conn.cursor()
        user = cursor.execute("SELECT 1 FROM user_info WHERE email = ?", [email]).fetchone()
        if user is None:
            return {"message": "Account not found."}, 404, HEADERS
        cursor.execute("UPDATE user_info SET password = ? WHERE email = ?", [new_password, email])
        cursor.execute("DELETE FROM session_info WHERE email = ?", [email])
        conn.commit()

    return {"message": "Password has been reset. Please log in."}, 200, HEADERS

@app.post("/review_task")
def review_task():
    data = request.get_json(force=True)

    try:
        submission_id = int(data["submission_id"])
        accepted = bool(data["accepted"])
        points = int(data["points"])
    except KeyError:
        abort(400)

    with sqlite3.connect('../../website.db', detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES) as conn:
        cursor = conn.cursor()
        task = cursor.execute("""
        SELECT email, accepted FROM tasks
        WHERE submission_id = ?
        """,
        [submission_id]).fetchone()

        if task is None:
            return {'message': 'Task does not exist.'}, 404, HEADERS
        
        if task[1] == 1:
            return {'message': 'Task already accepted.'}, 404, HEADERS
        
        if accepted:
            cursor.execute("""
            UPDATE tasks
            SET accepted = 1
            WHERE submission_id = ?
            """,
            [submission_id])

            user_points = cursor.execute("""
            SELECT points FROM user_info
            WHERE email = ?
            """,
            [task[0]]).fetchone()[0]
            cursor.execute("""
            UPDATE user_info
            SET points = ?
            WHERE email = ?
            """,
            [user_points + points, task[0]])
        else:
            cursor.execute("""
            DELETE FROM tasks
            WHERE submission_id = ?
            """,
            [submission_id])
        
        conn.commit()

    return Response(status=201, headers=HEADERS)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)