from db import get_connection

conn = get_connection()
cur = conn.cursor()
cur.execute("SELECT DATABASE();")
print("Conectado a:", cur.fetchone()[0])
cur.close()
conn.close()
print("OK")
