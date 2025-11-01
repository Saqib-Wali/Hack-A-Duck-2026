import psycopg2
from decimal import Decimal

def get_database_info(email: str):
    """
    Returns summarized user financial info (income, expenses, balance, credit limit, and credit score)
    using a shared connection from main.py.
    Automatically converts Decimal values to floats for JSON serialization.
    """
    try:
        # Lazy import to avoid circular import
        from main import conn

        cur = conn.cursor()

        # Get the user's ID
        cur.execute("SELECT id FROM Users WHERE email = %s;", (email,))
        user = cur.fetchone()
        if not user:
            cur.close()
            return {"error": "User not found"}
        user_id = user[0]

        # Income and expenses
        cur.execute("""
            SELECT 
                COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)
            FROM Transactions WHERE user_id = %s;
        """, (user_id,))
        income, expenses = cur.fetchone()

        # Balances and credit limits
        cur.execute("""
            SELECT 
                COALESCE(SUM(balance), 0),
                COALESCE(SUM(credit_limit), 0)
            FROM Accounts WHERE user_id = %s;
        """, (user_id,))
        balance, limit = cur.fetchone() or (0, 0)

        # 🧠 Get the latest credit score
        cur.execute("""
            SELECT score, report_date
            FROM CreditScores
            WHERE user_id = %s
            ORDER BY report_date DESC
            LIMIT 1;
        """, (user_id,))
        credit_row = cur.fetchone()
        credit_score = credit_row[0] if credit_row else None
        report_date = credit_row[1] if credit_row else None

        cur.close()

        # Safe Decimal → float converter
        def to_float(value):
            if value is None:
                return 0.0
            if isinstance(value, Decimal):
                return float(value)
            try:
                return float(value)
            except Exception:
                return 0.0

        income = to_float(income)
        expenses = to_float(expenses)
        balance = to_float(balance)
        limit = to_float(limit)

        utilization = (expenses / limit * 100) if limit > 0 else 0

        return {
            "income": income,
            "expenses": expenses,
            "balance": balance,
            "credit_limit": limit,
            "utilization_percent": round(utilization, 2),
            "credit_score": credit_score,
            "score_date": str(report_date) if report_date else None
        }

    except Exception as e:
        return {"error": str(e)}
