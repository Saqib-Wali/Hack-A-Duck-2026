import psycopg2
import os

def get_database_info(email: str):
    """
    Returns summarized user financial info (income, expenses, balance, credit limit)
    using a shared connection from main.py — safely imported inside the function
    to avoid circular import errors.
    """
    try:
        # Lazy import to avoid circular dependency
        from main import conn

        cur = conn.cursor()

        # Get the user's ID
        cur.execute("SELECT id FROM Users WHERE email = %s;", (email,))
        user = cur.fetchone()
        if not user:
            cur.close()
            return {"error": "User not found"}
        user_id = user[0]

        # Get total income and expenses
        cur.execute("""
            SELECT 
                COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)
            FROM Transactions WHERE user_id = %s;
        """, (user_id,))
        income, expenses = cur.fetchone()

        # Get total account balances and credit limits
        cur.execute("SELECT SUM(balance), SUM(credit_limit) FROM Accounts WHERE user_id = %s;", (user_id,))
        balance, limit = cur.fetchone() or (0, 0)

        cur.close()

        utilization = (expenses / limit * 100) if limit and limit > 0 else 0

        return {
            "income": float(income or 0),
            "expenses": float(expenses or 0),
            "balance": float(balance or 0),
            "credit_limit": float(limit or 0),
            "utilization_percent": round(utilization, 2)
        }

    except Exception as e:
        return {"error": str(e)}
