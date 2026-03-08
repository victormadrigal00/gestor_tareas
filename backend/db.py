import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",          # en tu caso está vacío
        database="gestor_tareas",
    )
