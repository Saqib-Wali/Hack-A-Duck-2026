from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2

app = FastAPI()

# --- Allow React frontend to connect (CORS) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Connection ---
try:
    conn = psycopg2.connect(
        dbname="CrediWise",        # your PostgreSQL database name
        user="postgres",           # your PostgreSQL username
        password="12345678@",      # your PostgreSQL password
        host="localhost",
        port="5432"
    )
    conn.autocommit = True
    print("✅ Connected to PostgreSQL database successfully!")
except Exception as e:
    print("❌ Error connecting to database:", e)


# --- Pydantic model for request body ---
class User(BaseModel):
    name: str
    email: str


# --- Routes ---
@app.get("/")
def read_root():
    return {"message": "Backend is working! 🚀"}


@app.get("/users")
def get_users():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Users;")
    users = cursor.fetchall()
    cursor.close()
    return {"users": users}


@app.post("/users")
def create_user(user: User):
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Users (name, email) VALUES (%s, %s);",
        (user.name, user.email)
    )
    cursor.close()
    return {"message": "✅ User added successfully!"}
