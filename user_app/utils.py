import random
from django.core.mail import send_mail
from django.conf import settings


def generate_confirm_code() -> str:
    return ''.join(str(random.randint(0, 9)) for _ in range(6))

def send_confirm_code(email: str, code: str) -> None:
    print(f"Відправка коду {code} на email {email}")
    send_mail(
        subject="Код підтвердження",
        message=f"Ваш код підтвердження: {code}",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[email],
        fail_silently=False,
    )