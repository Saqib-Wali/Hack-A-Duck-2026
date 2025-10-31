from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import bcrypt

app = FastAPI()

# --- Allow React frontend to connect (CORS) ---
app.add_middleware(
    CORSMiddleware,
allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Connection ---
try:
    conn = psycopg2.connect(
        dbname="CrediWise",
        user="postgres",
        password="12345678@",   # your PostgreSQL password
        host="localhost",
        port="5432"
    )
    conn.autocommit = True
    print("✅ Connected to PostgreSQL database successfully!")
except Exception as e:
    print("❌ Error connecting to database:", e)


# --- Pydantic Models ---
class SignupUser(BaseModel):
    name: str
    email: str
    password: str


class LoginUser(BaseModel):
    email: str
    password: str


# --- Routes ---
@app.get("/")
def read_root():
    return {"message": "Backend is working! 🚀"}


# --- Signup Route ---
@app.post("/signup")
def signup_user(user: SignupUser):
    cursor = conn.cursor()

    # Check if user already exists
    cursor.execute("SELECT * FROM Users WHERE email = %s;", (user.email,))
    existing = cursor.fetchone()

    if existing:
        cursor.close()
        raise HTTPException(status_code=400, detail="⚠️ User already exists!")

    # Hash password
    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())

    cursor.execute(
        "INSERT INTO Users (id, username, email, password_hash) VALUES (gen_random_uuid()::text, %s, %s, %s);",
        (user.name, user.email, hashed_pw.decode('utf-8'))
    )
    cursor.close()
    return {"message": "✅ Signup successful! You can now log in."}


# --- Login Route ---
@app.post("/login")
def login_user(user: LoginUser):
    cursor = conn.cursor()
    cursor.execute("SELECT username, password_hash FROM Users WHERE email = %s;", (user.email,))
    db_user = cursor.fetchone()

    if not db_user:
        cursor.close()
        raise HTTPException(status_code=404, detail="❌ User not found!")

    username, stored_pw = db_user
    stored_pw = stored_pw.encode('utf-8')

    if not bcrypt.checkpw(user.password.encode('utf-8'), stored_pw):
        cursor.close()
        raise HTTPException(status_code=401, detail="❌ Invalid password!")

    cursor.close()
    return {"message": f"✅ Welcome back, {username}!"}


# --- Get All Users (for testing) ---
@app.get("/users")
def get_users():
    cursor = conn.cursor()
    cursor.execute("SELECT username, email, created_at FROM Users;")
    users = cursor.fetchall()
    cursor.close()
    return {"users": users}
