#!/usr/bin/env python3
from flask import Flask
import sqlite3

app = Flask(__name__)

HEADERS = {
    'Access-Control-Allow-Origin': '*',
}

@app.get("/test_leaderboard")
def test_leaderboard():
    try:
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
    except Exception as e:
        return {'error': str(e)}, 500, HEADERS

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True)
