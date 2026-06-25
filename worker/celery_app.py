from celery import Celery

from backend.app.config import settings

celery_app = Celery("ai_aggregator", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    imports=("worker.generation_worker", "worker.polling_worker", "worker.refund_worker"),
    beat_schedule={
        "poll-fal-tasks-every-20s": {
            "task": "worker.polling_worker.poll_provider_tasks",
            "schedule": 20.0,
        },
        "refund-stuck-tasks-every-10min": {
            "task": "worker.refund_worker.refund_failed_tasks",
            "schedule": 600.0,
        },
    },
)
