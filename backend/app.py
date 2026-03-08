from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_connection

# Sirve archivos desde backend/static como si fuera la raíz del sitio
app = Flask(__name__, static_folder="static", static_url_path="")
app.secret_key = "cambia_esto_por_un_secreto"
CORS(app, supports_credentials=True)

# Al entrar a http://127.0.0.1:5000/ se abrirá login.html
@app.get("/")
def index():
    return app.send_static_file("login.html")

def require_login():
    user_id = session.get("user_id")
    if not user_id:
        return None, (jsonify({"error": "No autenticado"}), 401)
    return user_id, None

@app.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not nombre or not email or not password:
        return jsonify({"error": "Datos incompletos"}), 400

    password_hash = generate_password_hash(password)

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO usuarios (nombre, email, password_hash) VALUES (%s, %s, %s)",
            (nombre, email, password_hash),
        )
        conn.commit()
        return jsonify({"message": "Usuario registrado"}), 201
    except Exception:
        return jsonify({"error": "Email ya existe o error en registro"}), 400
    finally:
        cur.close()
        conn.close()

@app.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Datos incompletos"}), 400

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(
            "SELECT id_usuario, password_hash FROM usuarios WHERE email = %s",
            (email,),
        )
        user = cur.fetchone()

        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Credenciales inválidas"}), 401

        session["user_id"] = user["id_usuario"]
        return jsonify({"message": "Login correcto"}), 200
    finally:
        cur.close()
        conn.close()

@app.post("/logout")
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logout correcto"}), 200

@app.get("/tasks")
def list_tasks():
    user_id, err = require_login()
    if err:
        return err

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(
            "SELECT id_tarea, titulo, descripcion, completada, fecha_creacion "
            "FROM tareas WHERE id_usuario = %s ORDER BY fecha_creacion DESC",
            (user_id,),
        )
        tareas = cur.fetchall()
        return jsonify(tareas), 200
    finally:
        cur.close()
        conn.close()

@app.post("/tasks")
def create_task():
    user_id, err = require_login()
    if err:
        return err

    data = request.get_json(silent=True) or {}
    titulo = (data.get("titulo") or "").strip()
    descripcion = (data.get("descripcion") or "").strip()

    if not titulo:
        return jsonify({"error": "El título es obligatorio"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO tareas (titulo, descripcion, id_usuario) VALUES (%s, %s, %s)",
            (titulo, descripcion, user_id),
        )
        conn.commit()
        return jsonify({"message": "Tarea creada"}), 201
    finally:
        cur.close()
        conn.close()

@app.put("/tasks/<int:id>")
def update_task(id):
    user_id, err = require_login()
    if err:
        return err

    data = request.get_json(silent=True) or {}
    titulo = (data.get("titulo") or "").strip()
    descripcion = (data.get("descripcion") or "").strip()

    if not titulo:
        return jsonify({"error": "El título es obligatorio"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE tareas SET titulo=%s, descripcion=%s WHERE id_tarea=%s AND id_usuario=%s",
            (titulo, descripcion, id, user_id),
        )
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "No encontrada"}), 404
        return jsonify({"message": "Tarea actualizada"}), 200
    finally:
        cur.close()
        conn.close()

@app.put("/tasks/<int:id>/complete")
def complete_task(id):
    user_id, err = require_login()
    if err:
        return err

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "UPDATE tareas SET completada = TRUE WHERE id_tarea=%s AND id_usuario=%s",
            (id, user_id),
        )
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "No encontrada"}), 404
        return jsonify({"message": "Tarea completada"}), 200
    finally:
        cur.close()
        conn.close()

@app.delete("/tasks/<int:id>")
def delete_task(id):
    user_id, err = require_login()
    if err:
        return err

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "DELETE FROM tareas WHERE id_tarea=%s AND id_usuario=%s",
            (id, user_id),
        )
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "No encontrada"}), 404
        return jsonify({"message": "Tarea eliminada"}), 200
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True)
