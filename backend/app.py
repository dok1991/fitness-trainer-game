from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from database import create_tables, get_db
from models import User, GameScore
import json

app = Flask(__name__)
CORS(app)

create_tables()

@app.route('/')
def serve_frontend():
    return app.send_static_file('../frontend/index.html')

@app.route('/<path:path>')
def serve_static(path):
    return app.send_static_file('../frontend/' + path)

@app.route('/register', methods=['POST'])
def register():
    data = request.form
    username = data.get('username')
    display_name = data.get('display_name')
    
    db = next(get_db())
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        return jsonify({"user_id": existing_user.id, "username": existing_user.username})
    
    new_user = User(username=username, display_name=display_name)
    db.add(new_user)
    db.commit()
    return jsonify({"user_id": new_user.id, "username": new_user.username})

@app.route('/save_score', methods=['POST'])
def save_score():
    data = request.form
    db = next(get_db())
    
    game_score = GameScore(
        user_id=data.get('user_id'),
        score=data.get('score'),
        skurcents=data.get('skurcents'),
        level=data.get('level')
    )
    db.add(game_score)
    db.commit()
    return jsonify({"status": "success"})

@app.route('/leaderboard')
def leaderboard():
    from sqlalchemy import desc
    db = next(get_db())
    
    scores = db.query(GameScore, User).join(User).order_by(desc(GameScore.score)).limit(10).all()
    
    leaderboard = []
    for score, user in scores:
        leaderboard.append({
            "username": user.username,
            "display_name": user.display_name,
            "score": score.score,
            "skurcents": score.skurcents,
            "level": score.level
        })
    
    return jsonify(leaderboard)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
