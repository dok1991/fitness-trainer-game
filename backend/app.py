from fastapi import FastAPI, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os

from database import get_db, create_tables
from models import User, GameScore
from auth import register_user, get_user_by_id

app = FastAPI(title="Fitness Trainer Game")

# Разрешаем CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создаем таблицы при запуске
if not os.getenv("RENDER"):  # Создаем таблицы только локально
    create_tables()

@app.post("/register")
async def register(username: str = Form(...), display_name: str = Form(...), db: Session = Depends(get_db)):
    # Проверяем существование пользователя
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        return {"user_id": existing_user.id, "username": existing_user.username}
    
    # Создаем нового пользователя
    new_user = User(username=username, display_name=display_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"user_id": new_user.id, "username": new_user.username}

@app.post("/save_score")
async def save_score(
    user_id: int = Form(...),
    score: int = Form(...), 
    skurcents: int = Form(...),
    level: int = Form(...),
    db: Session = Depends(get_db)
):
    try:
        print(f"Сохранение результата: user_id={user_id}, score={score}, skurcents={skurcents}, level={level}")
        
        game_score = GameScore(
            user_id=user_id,
            score=score,
            skurcents=skurcents,
            level=level
        )
        db.add(game_score)
        db.commit()
        
        # Проверим что сохранилось
        saved_scores = db.query(GameScore).count()
        print(f"Всего записей в базе: {saved_scores}")
        
        return {"status": "success", "saved_records": saved_scores}
    except Exception as e:
        print("Ошибка сохранения:", e)
        db.rollback()
        return {"status": "error", "message": str(e)}

@app.get("/leaderboard")
async def get_leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    try:
        # Исправленный запрос с явным JOIN
        from sqlalchemy import desc
        
        scores = db.query(GameScore, User).\
            join(User, GameScore.user_id == User.id).\
            order_by(desc(GameScore.score)).\
            limit(limit).all()
        
        leaderboard = []
        for score, user in scores:
            leaderboard.append({
                "username": user.username,
                "display_name": user.display_name,
                "score": score.score,
                "skurcents": score.skurcents,
                "level": score.level
            })
        
        return leaderboard
    except Exception as e:
        print("Ошибка в leaderboard:", e)
        return []

# Монтируем статические файлы фронтенда
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)