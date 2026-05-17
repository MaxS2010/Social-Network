from user_app.models import User

from user_app.models import User


def get_user_by_section(user, section):
    if section == "requests":
        return (
            User.objects.filter(
                sent_friendships__to_user=user,
                sent_friendships__status="pending",
                is_profile_complete=True,
            )
            .order_by("id")
        )

    if section == "friends":
        sent_friends_ids = list(
            user.sent_friendships.filter(status="accepted")
            .values_list("to_user_id", flat=True)
        )

        received_friends_ids = list(
            user.received_friendships.filter(status="accepted")
            .values_list("from_user_id", flat=True)
        )

        return (
            User.objects.filter(
                id__in=sent_friends_ids + received_friends_ids,
                is_profile_complete=True,
            )
            .order_by("id")
        )

    if section == "recommendations":
        sent_busy_ids = list(
            user.sent_friendships.values_list("to_user_id", flat=True)
        )

        received_friends_ids = list(
            user.received_friendships.filter(status="accepted")
            .values_list("from_user_id", flat=True)
        )

        busy_ids = sent_busy_ids + received_friends_ids + [user.id]

        return (
            User.objects.exclude(
                id__in=busy_ids,
            )
            .filter(is_profile_complete=True)
            .order_by("id")
        )

    raise ValueError(f"Unknown section: {section}")