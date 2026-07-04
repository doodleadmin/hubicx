from celery import Celery

from backend.app.config import settings

celery_app = Celery("ai_aggregator", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    worker_prefetch_multiplier=1,
    imports=("worker.generation_worker", "worker.polling_worker", "worker.refund_worker", "worker.cleanup_worker"),
    beat_schedule={
        "poll-fal-tasks-every-20s": {
            "task": "worker.polling_worker.poll_provider_tasks",
            "schedule": 20.0,
        },
        "refund-stuck-tasks-every-10min": {
            "task": "worker.refund_worker.refund_failed_tasks",
            "schedule": 600.0,
        },
        "purge-expired-email-codes-daily": {
            "task": "worker.cleanup_worker.purge_expired_email_codes",
            "schedule": 86400.0,
        },
    },
)
