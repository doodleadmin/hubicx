from backend.app.db.models import User
from backend.app.utils.errors import AppError


def ensure_user_not_banned(user: User) -> None:
    if user.is_admin:
        return
    if not bool(getattr(user, "is_banned", False)):
        return
    reason = (getattr(user, "ban_reason", None) or "Доступ к сервису ограничен администратором.").strip()
    raise AppError("user_banned", f"Доступ ограничен. Причина: {reason}", 403)
