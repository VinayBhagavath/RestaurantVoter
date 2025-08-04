from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import pandas as pd

app = Flask(__name__)
CORS(app)

# Database file name
DB_NAME = "restaurants.db"
# Change this to your actual CSV path if needed
CSV_FILE = "one-star-michelin-restaurants.csv"


def init_db():
    """Initializes the database and inserts data from CSV if not already created."""
    if os.path.exists(DB_NAME):
        return  # DB already exists

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Create the updated restaurants table schema
    cursor.execute('''
        CREATE TABLE restaurants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            year INTEGER,
            latitude REAL,
            longitude REAL,
            city TEXT,
            region TEXT,
            zipCode TEXT,
            cuisine TEXT,
            price TEXT,
            url TEXT,
            score INTEGER DEFAULT 0
        )
    ''')

    # Load CSV and insert rows
    df = pd.read_csv(CSV_FILE)

    for _, row in df.iterrows():
        cursor.execute('''
            INSERT INTO restaurants 
            (name, year, latitude, longitude, city, region, zipCode, cuisine, price, url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            row.get('name'),
            row.get('year'),
            row.get('latitude'),
            row.get('longitude'),
            row.get('city'),
            row.get('region'),
            row.get('zipCode'),
            row.get('cuisine'),
            row.get('price'),
            row.get('url')
        ))

    conn.commit()
    conn.close()
    print("Database initialized and populated from CSV.")


def get_db_connection():
    """Establishes a connection to the SQLite database."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    """Fetches two random restaurants from the database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM restaurants ORDER BY RANDOM() LIMIT 2")
        restaurants = cursor.fetchall()
        conn.close()
        return jsonify([dict(row) for row in restaurants])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/vote', methods=['POST'])
def vote():
    """Increments the score of the selected restaurant."""
    try:
        data = request.get_json()
        restaurant_id = data.get('id')
        if not restaurant_id:
            return jsonify({"error": "Restaurant ID is required."}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE restaurants SET score = score + 1 WHERE id = ?", (restaurant_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Fetches all restaurants sorted by score."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM restaurants ORDER BY score DESC")
        leaderboard = cursor.fetchall()
        conn.close()
        return jsonify([dict(row) for row in leaderboard])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    init_db()
    app.run(debug=True)
