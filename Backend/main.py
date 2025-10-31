from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import psycopg2
import bcrypt
from uuid import uuid4
from datetime import date

app = FastAPI()

# ─────────────────────────────────────────────────────────────
# ✅ CORS for local frontend
# ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
# ✅ Database Connection
# ─────────────────────────────────────────────────────────────
try:
    conn = psycopg2.connect(
        dbname="CrediWise",
        user="postgres",
        password="12345678@",   # ← your PostgreSQL password
        host="localhost",
        port="5432",
    )
    conn.autocommit = True
    print("✅ Connected to PostgreSQL database successfully!")
except Exception as e:
    print("❌ Error connecting to database:", e)

# ─────────────────────────────────────────────────────────────
# ✅ Models
# ─────────────────────────────────────────────────────────────
class SignupUser(BaseModel):
    name: str
    email: str
    password: str

class LoginUser(BaseModel):
    email: str
    password: str

class AddTransaction(BaseModel):
    email: str
    amount: float
    description: str
    transaction_date: date
    kind: Optional[str] = None  # "income" | "expense"
    account_id: Optional[str] = None
    category_id: Optional[str] = None

# ─────────────────────────────────────────────────────────────
# ✅ Helper Functions
# ─────────────────────────────────────────────────────────────
def get_user_by_email(cur, email: str):
    cur.execute("SELECT id, username, email FROM Users WHERE email = %s;", (email,))
    return cur.fetchone()

def get_default_account_id(cur, user_id: str) -> str:
    cur.execute("SELECT id FROM Accounts WHERE user_id = %s ORDER BY id LIMIT 1;", (user_id,))
    row = cur.fetchone()
    if row:
        return row[0]
    acc_id = f"acc_{uuid4().hex[:8]}"
    cur.execute(
        "INSERT INTO Accounts (id, user_id, account_name, account_type, balance) VALUES (%s, %s, %s, %s, %s);",
        (acc_id, user_id, "Main Account", "checking", 0.00),
    )
    return acc_id

# ─────────────────────────────────────────────────────────────
# ✅ Routes
# ─────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Backend is working! 🚀"}

# ─────────── SIGNUP ───────────
@app.post("/signup")
def signup_user(user: SignupUser):
    cur = conn.cursor()

    # prevent duplicates
    cur.execute("SELECT 1 FROM Users WHERE email = %s;", (user.email,))
    if cur.fetchone():
        cur.close()
        raise HTTPException(status_code=400, detail="⚠️ Email already in use.")
    cur.execute("SELECT 1 FROM Users WHERE username = %s;", (user.name,))
    if cur.fetchone():
        cur.close()
        raise HTTPException(status_code=400, detail="⚠️ Username already in use.")

    hashed_pw = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user_id = f"usr_{uuid4().hex[:8]}"

    cur.execute(
        "INSERT INTO Users (id, username, email, password_hash) VALUES (%s, %s, %s, %s);",
        (user_id, user.name, user.email, hashed_pw),
    )

    # create default account
    account_id = f"acc_{uuid4().hex[:8]}"
    cur.execute(
        "INSERT INTO Accounts (id, user_id, account_name, account_type, balance) VALUES (%s, %s, %s, %s, %s);",
        (account_id, user_id, "Main Account", "checking", 0.00),
    )

    conn.commit()
    cur.close()
    return {"message": "✅ Signup successful! Default account created.", "user_id": user_id, "account_id": account_id}

# ─────────── LOGIN ───────────
@app.post("/login")
def login(user: LoginUser):
    cur = conn.cursor()
    cur.execute("SELECT id, username, email, password_hash FROM Users WHERE email = %s;", (user.email,))
    row = cur.fetchone()
    if not row:
        cur.close()
        raise HTTPException(status_code=404, detail="❌ User not found!")

    user_id, username, email, pw_hash = row
    if not bcrypt.checkpw(user.password.encode("utf-8"), pw_hash.encode("utf-8")):
        cur.close()
        raise HTTPException(status_code=401, detail="❌ Invalid password!")

    _ = get_default_account_id(cur, user_id)  # ensure account exists
    cur.close()
    return {"message": f"✅ Welcome back, {username}!", "user": {"id": user_id, "name": username, "email": email}}

# ─────────── USER PROFILE ───────────
@app.get("/user/{email}")
def get_user(email: str):
    cur = conn.cursor()
    u = get_user_by_email(cur, email)
    cur.close()
    if not u:
        raise HTTPException(status_code=404, detail="❌ User not found!")
    return {"user": {"id": u[0], "username": u[1], "email": u[2]}}

@app.put("/update_user")
def update_user(data: dict = Body(...)):
    email = data.get("email")
    username = data.get("username")
    new_password = data.get("password")

    if not email or not username:
        raise HTTPException(status_code=400, detail="⚠️ Missing required fields!")

    cur = conn.cursor()
    if new_password:
        hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        cur.execute("UPDATE Users SET username=%s, password_hash=%s WHERE email=%s;", (username, hashed, email))
    else:
        cur.execute("UPDATE Users SET username=%s WHERE email=%s;", (username, email))
    conn.commit()
    cur.close()
    return {"message": "✅ Profile updated successfully!"}

# ─────────── TRANSACTIONS ───────────
@app.get("/transactions/{email}")
def list_transactions(email: str):
    cur = conn.cursor()
    cur.execute(
        """
        SELECT t.id, t.amount, t.description, t.transaction_date, COALESCE(c.name, 'Other') AS category_name
        FROM Transactions t
        JOIN Users u ON t.user_id = u.id
        LEFT JOIN Categories c ON t.category_id = c.id
        WHERE u.email = %s
        ORDER BY t.transaction_date DESC, t.id DESC;
        """,
        (email,),
    )
    rows = cur.fetchall()
    cur.close()
    return {
        "transactions": [
            {
                "id": r[0],
                "amount": float(r[1]),
                "description": r[2],
                "transaction_date": r[3],
                "category": r[4],
            }
            for r in rows
        ]
    }

# ✅ Fixed version with auto category creation
@app.post("/transactions/add")
def add_transaction(data: AddTransaction):
    cur = conn.cursor()

    u = get_user_by_email(cur, data.email)
    if not u:
        cur.close()
        raise HTTPException(status_code=404, detail="❌ User not found!")
    user_id = u[0]

    account_id = data.account_id or get_default_account_id(cur, user_id)

    kind = (data.kind or ("income" if data.amount >= 0 else "expense")).lower()
    if kind not in ("income", "expense"):
        kind = "income"
    coerced_amount = abs(data.amount) if kind == "income" else -abs(data.amount)

    # 🔹 Auto category handling
    category_id = data.category_id or ("cat_001" if kind == "income" else "cat_011")

    # If the category doesn’t exist, auto-create it
    cur.execute("SELECT 1 FROM Categories WHERE id = %s;", (category_id,))
    if not cur.fetchone():
        name = "Salary" if kind == "income" else "Other Expense"
        cur.execute("INSERT INTO Categories (id, name) VALUES (%s, %s);", (category_id, name))
        print(f"🆕 Created missing category: {name} ({category_id})")

    tx_id = f"tx_{uuid4().hex[:8]}"
    cur.execute(
        """
        INSERT INTO Transactions (id, user_id, account_id, category_id, amount, description, transaction_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
        """,
        (tx_id, user_id, account_id, category_id, coerced_amount, data.description, data.transaction_date),
    )

    cur.execute("UPDATE Accounts SET balance = balance + %s WHERE id = %s;", (coerced_amount, account_id))
    conn.commit()
    cur.close()
    return {"message": "✅ Transaction added successfully!", "transaction_id": tx_id}

# ─────────── SUMMARY ───────────
@app.get("/summary/{email}")
def summary(email: str):
    cur = conn.cursor()
    cur.execute(
        """
        SELECT 
            COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END), 0) AS expenses
        FROM Transactions t
        JOIN Users u ON t.user_id = u.id
        WHERE u.email = %s;
        """,
        (email,),
    )
    income, expenses = cur.fetchone()
    cur.close()
    balance = float(income) - float(expenses)
    return {"income": float(income), "expenses": float(expenses), "balance": balance}
