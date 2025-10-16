from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User

def register_user(username: str, display_name: str, db: Session):
    # Проверяем существование пользователя
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        return existing_user
    
    # Создаем нового пользователя
    new_user = User(username=username, display_name=display_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_user_by_id(user_id: int, db: Session):
    return db.query(User).filter(User.id == user_id).first()