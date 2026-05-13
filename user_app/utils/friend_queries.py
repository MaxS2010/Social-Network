from user_app.models import Friendship, User
from django.db.models import QuerySet

def get_user_by_section(user, section) -> QuerySet[User]:
    if section == "requests":
        return User.objects.filter(
            sent_friendships__to_user= user, # Два підкреслення в Django – це спеціальний синтаксис ORM, для доступу до зв'язаних об'єктів.
            sent_friendships__status= "pending"
        ).order_by('id')
    
    if section == "friends":
        sent_friends_ids = list(user.sent_friendships.filter(status="accepted").values_list("to_user_id", flat=True))
        received_friends_ids = list(user.received_friendships.filter(status="accepted").values_list("from_user_id", flat=True))

        return User.objects.filter(
            id__in= sent_friends_ids + received_friends_ids, # id__in - це фільтр Django ORM, який дозволяє вибрати всі об'єкти, id яких знаходиться в заданому списку.

        ).order_by('id')

    if section == "recommendations":
        sent_busy_ids = list(user.sent_friendships.values_list("to_user_id", flat=True))
        received_friends_ids = list(user.received_friendships.filter(status="accepted").values_list("from_user_id", flat=True))
        
        # У рекомендаціях ми хочемо виключити користувачів, з якими вже є запит у будь-якому статусі (відправлений, отриманий, прийнятий), а також самого користувача.
        busy_ids = sent_busy_ids + received_friends_ids + [user.id]

        return User.objects.exclude(
            id__in= busy_ids,
        ).order_by('id')
    else:
        raise ValueError(f"Unknown section: {section}")