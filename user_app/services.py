from .models import User

def confirm_user(session, input_code):
    session_code = session.get("confirm_code")
    user_id = session.get("confirm_user_id")

    if not session_code or not user_id:
        raise ValueError("Сессія не має необхідних даних для підтвердження")

    if input_code != session_code:
        raise ValueError("Код підтвердження не вірний")

    user = User.objects.filter(id=user_id).first()
    if not user:
        raise ValueError("Користувача не знайдено")

    user.is_active = True
    user.save()

    session.clear()

    return user