from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import psycopg2
import bcrypt
from uuid import uuid4
from datetime import date

from AI import generate_text
from AI import ai_analyze_user


app = FastAPI()

# ─────────────────────────────────────────────────────────────
# ✅ CORS Configuration
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
        password="12345678@",  # ← update if needed
        host="localhost",
        port="5432",
    )
    conn.autocommit = True
    print("✅ Connected to PostgreSQL database successfully!")
except Exception as e:
    print("❌ Error connecting to database:", e)

# ─────────────────────────────────────────────────────────────
# ✅ Auto-create FinancialTips table & seed data
# ─────────────────────────────────────────────────────────────
def init_financial_tips_table():
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS FinancialTips (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT
        );
    """)

    cur.execute("SELECT COUNT(*) FROM FinancialTips;")
    count = cur.fetchone()[0]

    if count == 0:
        print("💡 Seeding default FinancialTips...")
        tips = [
            ("Pay on Time", "Always make payments before the due date to build trust with lenders.", "Credit Score"),
            ("Keep Utilization Low", "Use less than 30% of your available credit to maintain a healthy score.", "Credit Usage"),
            ("Check Your Report Regularly", "Monitor your credit report to correct any mistakes early.", "Monitoring"),
            ("Diversify Credit Types", "Having both credit cards and loans shows good credit management.", "Credit Mix"),
            ("Avoid Frequent Applications", "Too many credit applications can lower your score temporarily.", "Inquiries"),
            ("Build Long-Term Accounts", "Older credit accounts improve your score by showing stability.", "Account Age"),
            ("Don’t Close Old Cards", "Keeping older accounts open improves your credit history length.", "Credit History"),
            ("Track Spending", "Keeping track of where your money goes helps you avoid overutilization.", "Budgeting")
        ]
        cur.executemany("INSERT INTO FinancialTips (title, content, category) VALUES (%s, %s, %s);", tips)
        conn.commit()
        print("✅ Default financial tips inserted successfully!")
    else:
        print(f"ℹ️ FinancialTips already seeded ({count} records).")

    cur.close()

init_financial_tips_table()

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
    kind: Optional[str] = None
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
        "INSERT INTO Accounts (id, user_id, account_name, account_type, balance, credit_limit) VALUES (%s, %s, %s, %s, %s, %s);",
        (acc_id, user_id, "Main Account", "checking", 0.00, 1000.00),
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

    account_id = f"acc_{uuid4().hex[:8]}"
    cur.execute("""
        INSERT INTO Accounts (id, user_id, account_name, account_type, balance, credit_limit)
        VALUES (%s, %s, %s, %s, %s, %s);
    """, (account_id, user_id, "Main Account", "checking", 0.00, 1000.00))

    credit_id = f"cs_{uuid4().hex[:8]}"
    cur.execute("""
        INSERT INTO CreditScores (id, user_id, score, report_date, provider)
        VALUES (%s, %s, %s, %s, %s);
    """, (credit_id, user_id, 700, date.today(), "Experian"))

    conn.commit()
    cur.close()
    return {"message": "✅ Signup successful! Default account and credit score created."}

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

    _ = get_default_account_id(cur, user_id)
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
    cur.execute("""
        SELECT t.id, t.amount, t.description, t.transaction_date, COALESCE(c.name, 'Other') AS category_name
        FROM Transactions t
        JOIN Users u ON t.user_id = u.id
        LEFT JOIN Categories c ON t.category_id = c.id
        WHERE u.email = %s
        ORDER BY t.transaction_date DESC, t.id DESC;
    """, (email,))
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

@app.post("/transactions/add")
def add_transaction(data: AddTransaction):
    cur = conn.cursor()
    u = get_user_by_email(cur, data.email)
    if not u:
        cur.close()
        raise HTTPException(status_code=404, detail="❌ User not found!")
    user_id = u[0]

    # Get or create default account
    account_id = data.account_id or get_default_account_id(cur, user_id)

    # Determine transaction type
    kind = (data.kind or ("income" if data.amount >= 0 else "expense")).lower()
    coerced_amount = abs(data.amount) if kind == "income" else -abs(data.amount)
    category_id = data.category_id or ("cat_001" if kind == "income" else "cat_011")

    # Ensure category exists
    cur.execute("SELECT 1 FROM Categories WHERE id = %s;", (category_id,))
    if not cur.fetchone():
        cur.execute(
            "INSERT INTO Categories (id, name) VALUES (%s, %s);",
            (category_id, "Salary" if kind == "income" else "Other Expense"),
        )

    # Add transaction
    tx_id = f"tx_{uuid4().hex[:8]}"
    cur.execute(
        """
        INSERT INTO Transactions (id, user_id, account_id, category_id, amount, description, transaction_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
        """,
        (
            tx_id,
            user_id,
            account_id,
            category_id,
            coerced_amount,
            data.description,
            data.transaction_date,
        ),
    )

    # ✅ Update account balance
    cur.execute("UPDATE Accounts SET balance = balance + %s WHERE id = %s;", (coerced_amount, account_id))

    # ✅ Totals for utilization/score
    cur.execute("""
        SELECT 
            COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)
        FROM Transactions WHERE user_id = %s;
    """, (user_id,))
    income, expenses = cur.fetchone()

    cur.execute("SELECT SUM(balance), SUM(credit_limit) FROM Accounts WHERE user_id = %s;", (user_id,))
    balance, limit = cur.fetchone() or (0, 0)

    # Convert to float
    income, expenses, balance, limit = float(income or 0), float(expenses or 0), float(balance or 0), float(limit or 0)

    # ✅ Correct utilization: percent of credit limit currently used
    utilization = (expenses / limit * 100) if limit > 0 else 0

    # ✅ Scoring logic (40% threshold)
    new_score = 700
    if utilization >= 80:
        new_score -= 20
    elif utilization >= 40:
        new_score -= 10
    else:
        new_score += 10

    if expenses > income:
        new_score -= 10
    elif income > 0 and expenses < income * 0.5:
        new_score += 10

    if balance > 0:
        new_score += 5

    new_score = max(300, min(850, int(new_score)))

    # ✅ Update existing credit score (no duplicates)
    cur.execute("SELECT 1 FROM CreditScores WHERE user_id = %s;", (user_id,))
    if cur.fetchone():
        cur.execute(
            """
            UPDATE CreditScores
            SET score = %s, report_date = %s
            WHERE user_id = %s;
            """,
            (new_score, date.today(), user_id),
        )
    else:
        cs_id = f"cs_{uuid4().hex[:8]}"
        cur.execute(
            """
            INSERT INTO CreditScores (id, user_id, score, report_date)
            VALUES (%s, %s, %s, %s);
            """,
            (cs_id, user_id, new_score, date.today()),
        )

    conn.commit()
    cur.close()
    return {"message": f"✅ Transaction added successfully! New credit score: {new_score}"}

# ─────────── CREDIT EDUCATION ───────────
@app.get("/credit/{email}")
def get_credit_score(email: str):
    cur = conn.cursor()
    cur.execute("""
        SELECT cs.score, cs.report_date
        FROM CreditScores cs
        JOIN Users u ON u.id = cs.user_id
        WHERE u.email = %s
        ORDER BY cs.report_date DESC
        LIMIT 1;
    """, (email,))
    row = cur.fetchone()
    cur.close()

    if not row:
        raise HTTPException(status_code=404, detail="No credit score data found.")
    score, date_value = row
    return {"score": score, "date": date_value}

# ─────────── CREDIT TIPS (PERSONALIZED) ───────────
@app.get("/credit/tips/{email}")
def personalized_credit_tips(email: str):
    cur = conn.cursor()
    cur.execute("SELECT id FROM Users WHERE email = %s;", (email,))
    user = cur.fetchone()
    if not user:
        cur.close()
        raise HTTPException(status_code=404, detail="User not found.")
    user_id = user[0]

    cur.execute("""
        SELECT 
            COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)
        FROM Transactions WHERE user_id = %s;
    """, (user_id,))
    income, expenses = cur.fetchone()

    cur.execute("SELECT SUM(credit_limit) FROM Accounts WHERE user_id = %s;", (user_id,))
    limit = cur.fetchone()[0] or 0

    income, expenses, limit = float(income or 0), float(expenses or 0), float(limit or 0)
    utilization = (expenses / limit * 100) if limit > 0 else None

    tips = []
    if expenses > income:
        tips.append({"title": "You're Overspending", "content": "Your expenses exceed your income — try to reduce non-essential costs."})
    elif income > 0 and expenses < income * 0.5:
        tips.append({"title": "Excellent Saving Habits", "content": "You're saving a good portion of your income — consider investing to grow your wealth."})

    if utilization is not None:
        if utilization > 40:
            tips.append({
                "title": "Higher Credit Usage",
                "content": f"Your credit utilization is {utilization:.1f}%. Try to keep it below 40% to maintain a healthy score."
            })
        else:
            tips.append({
                "title": "Good Credit Usage",
                "content": f"Your utilization is {utilization:.1f}% — great job keeping it under 40%!"
            })

    cur.execute("SELECT title, content, category FROM FinancialTips ORDER BY RANDOM() LIMIT 3;")
    for r in cur.fetchall():
        tips.append({"title": r[0], "content": r[1], "category": r[2]})

    cur.close()
    return {"personalized_tips": tips}

# ─────────── CREDIT INSIGHTS ───────────
@app.get("/credit/insights/{email}")
def credit_insights(email: str):
    cur = conn.cursor()
    cur.execute("SELECT id FROM Users WHERE email = %s;", (email,))
    user = cur.fetchone()
    if not user:
        cur.close()
        raise HTTPException(status_code=404, detail="User not found.")
    user_id = user[0]

    cur.execute("""
        SELECT 
            COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)
        FROM Transactions WHERE user_id = %s;
    """, (user_id,))
    income, expenses = cur.fetchone()

    cur.execute("SELECT SUM(credit_limit) FROM Accounts WHERE user_id = %s;", (user_id,))
    limit = cur.fetchone()[0] or 0

    income, expenses, limit = float(income or 0), float(expenses or 0), float(limit or 0)
    utilization = (expenses / limit * 100) if limit > 0 else None

    tips = []
    if utilization is not None:
        if utilization > 40:
            tips.append({
                "title": "High Credit Utilization",
                "content": f"Your utilization is {utilization:.1f}%. Try to keep it below 40% to improve your score."
            })
        else:
            tips.append({
                "title": "Excellent Utilization",
                "content": f"Your utilization is {utilization:.1f}% — staying under 40% is great!"
            })
    else:
        tips.append({
            "title": "Set Your Credit Limit",
            "content": "We can give better insights once you set a credit limit for your account."
        })

    if expenses > income:
        tips.append({
            "title": "High Spending Alert",
            "content": "Your expenses exceed your income — try reducing non-essential costs."
        })
    else:
        tips.append({
            "title": "Good Financial Balance",
            "content": "You’re saving more than you spend — this strengthens your credit health."
        })

    cur.close()
    return {"insights": tips}


@app.post("/ai/chat")
async def ai_chat(request: Request):
    data = await request.json()
    message = data.get("message", "")
    if not message:
        return {"error": "Message is required"}

    try:
        response = generate_text(
            f"You are a friendly credit assistant helping users manage their finances.\n"
            f"User: {message}\n"
            f"Assistant:",
            temperature=0.4,
            max_output_tokens=500,
        )
        return {"reply": response.strip()}
    except Exception as e:
        return {"error": str(e)}
    

    # ─────────── AI CREDIT ANALYSIS ───────────
@app.get("/ai/credit_analysis/{email}")
async def ai_credit_analysis(email: str):
    """
    Generates AI-powered financial insights for the given user.
    Used by the CreditAnalysis page.
    """
    try:
        result = ai_analyze_user(email)
        return result
    except Exception as e:
        return {"error": str(e)}
