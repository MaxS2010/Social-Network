import paramiko
from sshtunnel import SSHTunnelForwarder
from django.db import connections

if not hasattr(paramiko, 'DSSKey'):
    setattr(paramiko, 'DSSKey', None)

_tunnel_instance = None

def start_ssh_tunnel():
    global _tunnel_instance

    if _tunnel_instance and _tunnel_instance.is_active:
        return

    db_engine= connections.settings["default"]['ENGINE']

    if 'sqlite3' in db_engine:
        print(f"[SSH] База даних використовує SQLite, тунель не потрібен.")
        return
    else:

        print("[SSH] Ініціалізація підключення до PythonAnywhere...")
        
        _tunnel_instance = SSHTunnelForwarder(
            ('ssh.pythonanywhere.com', 22),
            ssh_username='WorldITSocialNetwork',
            ssh_password='oL4qhR8vzO9p',
            remote_bind_address=('WorldITSocialNetwork-5274.postgres.pythonanywhere-services.com', 15274)
        )
        
        try:
            _tunnel_instance.start()
            local_port = _tunnel_instance.local_bind_port
            print(f"[SSH] Тунель успішно відкрито на локальному порту: {local_port}")
            
            connections.settings["default"]['HOST'] = '127.0.0.1'
            connections.settings["default"]['PORT'] = str(local_port)
            
            db_conn = connections["default"]
            db_conn.cursor()
            print("\n[УСПІХ] Бекенд Django успішно підключився до DataBase")
            
        except Exception as e:
            print(f"[SSH ПОМИЛКА]: Не вдалося відкрити тунель: {e}")
