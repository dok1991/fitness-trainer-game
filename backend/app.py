from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from database import create_tables, get_db
from models import User, GameScore
from sqlalchemy import desc

app = Flask(__name__)
CORS(app)

# Создаем таблицы при запуске
create_tables()

@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.form
        username = data.get('username')
        display_name = data.get('display_name')
        
        if not username or not display_name:
            return jsonify({"error": "Username and display name are required"}), 400
        
        db = next(get_db())
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            return jsonify({"user_id": existing_user.id, "username": existing_user.username})
        
        new_user = User(username=username, display_name=display_name)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return jsonify({"user_id": new_user.id, "username": new_user.username})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/save_score', methods=['POST'])
def save_score():
    try:
        data = request.form
        user_id = data.get('user_id')
        score = data.get('score')
        skurcents = data.get('skurcents')
        level = data.get('level')
        
        if not all([user_id, score, skurcents, level]):
            return jsonify({"error": "All fields are required"}), 400
        
        db = next(get_db())
        game_score = GameScore(
            user_id=int(user_id),
            score=int(score),
            skurcents=int(skurcents),
            level=int(level)
        )
        db.add(game_score)
        db.commit()
        return jsonify({"status": "success"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/leaderboard')
def leaderboard():
    try:
        limit = request.args.get('limit', 10, type=int)
        db = next(get_db())
        
        scores = db.query(GameScore, User).join(User).order_by(desc(GameScore.score)).limit(limit).all()
        
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
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
