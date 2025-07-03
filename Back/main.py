from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, create_engine, text
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

# ✅ 테이블 생성
Base.metadata.create_all(bind=engine)

# ── facilities 테이블 및 컬럼 자동 생성 ─────────────────────────────────────
from sqlalchemy import inspect

# 현재 DB에 반영된 테이블·컬럼 정보 조회
inspector = inspect(engine)
with engine.begin() as conn:
    # 1) 테이블이 없으면 생성
    if "facilities" not in inspector.get_table_names():
        conn.execute(text("""
            CREATE TABLE facilities (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                name TEXT NOT NULL,
                address TEXT NOT NULL,
                lat DOUBLE NOT NULL,
                lng DOUBLE NOT NULL,
                type TEXT NOT NULL
            ) CHARACTER SET utf8mb4;
        """))
    else:
        # 2) 테이블이 있지만 컬럼이 누락됐으면 추가
        existing = [c["name"] for c in inspector.get_columns("facilities")]
        if "name"    not in existing:
            conn.execute(text("ALTER TABLE facilities ADD COLUMN name TEXT NOT NULL"))
        if "address" not in existing:
            conn.execute(text("ALTER TABLE facilities ADD COLUMN address TEXT NOT NULL"))
        if "lat"     not in existing:
            conn.execute(text("ALTER TABLE facilities ADD COLUMN lat DOUBLE NOT NULL"))
        if "lng"     not in existing:
            conn.execute(text("ALTER TABLE facilities ADD COLUMN lng DOUBLE NOT NULL"))
        if "type"    not in existing:
            conn.execute(text("ALTER TABLE facilities ADD COLUMN type TEXT NOT NULL"))

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

class AddressCreate(BaseModel):
    address: str
    memo: str
    user_id: int

class UserCreate(BaseModel):
    username: str
    password: str

# ✅ DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 사용 중인 사용자 이름입니다.")
    
    new_user = User(username=user.username, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "회원가입 완료", "user_id": new_user.id}

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

# ✅ 주소 + 메모 저장 API
@app.post("/addresses")
def create_address(address: AddressCreate, db: Session = Depends(get_db)):
    new_address = Address(
        address=address.address,
        memo=address.memo,
        user_id=address.user_id
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return {
        "id": new_address.id,
        "address": new_address.address,
        "memo": new_address.memo,
        "username": new_address.user.username,
        "created_at": new_address.created_at.strftime("%Y-%m-%d %H:%M:%S")  # ✅ 포함
    }

# ✅ 전체 주소 조회 API
@app.get("/addresses")
def get_addresses(db: Session = Depends(get_db)):
    addresses = db.query(Address).all()
    return [
        {
            "id": a.id,
            "address": a.address,
            "memo": a.memo,
            "username": a.user.username,
            "created_at": a.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "user_id": a.user_id
        }
        for a in addresses
    ]

# ✅ 주소 삭제 API
@app.delete("/addresses/{address_id}")
def delete_address(address_id: int, db: Session = Depends(get_db)):
    address = db.query(Address).filter(Address.id == address_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="주소를 찾을 수 없습니다.")
    db.delete(address)
    db.commit()
    return {"message": "삭제 완료"}

# ✅ 주소 수정 API 추가
@app.put("/addresses/{address_id}")
def update_address(address_id: int, address: AddressCreate, db: Session = Depends(get_db)):
    db_address = db.query(Address).filter(Address.id == address_id).first()
    if not db_address:
        raise HTTPException(status_code=404, detail="주소를 찾을 수 없습니다.")
    db_address.address = address.address
    db_address.memo = address.memo
    db.commit()
    db.refresh(db_address)
    return {
        "id": db_address.id,
        "address": db_address.address,
        "memo": db_address.memo,
        "username": db_address.user.username,
        "created_at": db_address.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }

# ✅ 시설(facilities) 전체 조회 API
@app.get("/facilities")
def get_facilities(db: Session = Depends(get_db)):
    facilities = db.execute(
        text("SELECT id, name, address, lat, lng, type FROM facilities")
    ).fetchall()
    return [
        {
            "id": f[0],
            "name": f[1],
            "address": f[2],
            "lat": float(f[3]),
            "lng": float(f[4]),
            "type": f[5]
        }
        for f in facilities
    ]
