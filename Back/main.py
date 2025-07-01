from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# ✅ DB 연결 설정
DB_URL = "mysql+pymysql://root:1234@localhost:3310/dz-project"
engine = create_engine(DB_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

# ✅ User 테이블
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    user_addresses = relationship("UserAddress", back_populates="user")
    addresses = relationship("Address", back_populates="user")

# ✅ Address 테이블 (🆕 작성일시 추가됨)
class Address(Base):
    __tablename__ = "addresses"
    id = Column(Integer, primary_key=True, index=True)
    address = Column(String(200), nullable=False)
    memo = Column(String(300), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.now)  # ✅ 자동 저장
    user = relationship("User", back_populates="addresses")

# 사용자 추가 address 정보
class UserAddress(Base):
    __tablename__ = "user_addresses"
    id = Column(Integer, primary_key=True, index=True)
    address = Column(String(200), nullable=False)
    memo = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="user_addresses")

# ✅ 테이블 생성
Base.metadata.create_all(bind=engine)

# ✅ FastAPI 앱 생성
app = FastAPI()

# ✅ CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Pydantic 스키마
class UserLogin(BaseModel):
    username: str
    password: str

class UserAddressCreate(BaseModel):
    address: str
    memo: str

# ✅ DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ 로그인 API
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(
        User.username == user.username,
        User.password == user.password
    ).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="아이디 또는 비밀번호가 틀렸습니다")
    return {"user_id": db_user.id}

# 기본 Address 목록 조회 API
@app.get("/default-addresses")
def get_default_addresses(db: Session = Depends(get_db)):
    """기본으로 제공되는 주소 목록을 반환합니다."""
    return db.query(Address).all()

# 특정 사용자가 추가한 주소 목록 조회 API
@app.get("/users/{user_id}/addresses")
def get_user_addresses(user_id: int, db: Session = Depends(get_db)):
    """특정 사용자가 직접 추가한 주소 목록을 반환합니다."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return user.user_addresses

# 사용자가 주소 추가하는 API
@app.post("/users/{user_id}/addresses")
def create_user_address(user_id: int, address_data: UserAddressCreate, db: Session = Depends(get_db)):
    """사용자가 새로운 주소를 UserAddress 테이블에 저장합니다."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        
    new_address = UserAddress(
        address=address_data.address,
        memo=address_data.memo,
        user_id=user_id
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address

# 사용자가 추가한 주소 삭제 API
@app.delete("/user-addresses/{address_id}")
def delete_user_address(address_id: int, db: Session = Depends(get_db)):
    """사용자가 추가한 주소를 UserAddress 테이블에서 삭제합니다."""
    address_to_delete = db.query(UserAddress).filter(UserAddress.id == address_id).first()
    if not address_to_delete:
        raise HTTPException(status_code=404, detail="삭제할 주소를 찾을 수 없습니다.")
    
    db.delete(address_to_delete)
    db.commit()
    return {"message": "삭제 완료"}
