from worker.celery_app import celery_app


@celery_app.task(name="worker.refund_worker.refund_failed_tasks")
def refund_failed_tasks() -> dict:
    return {"ok": True, "message": "Refund safety task placeholder"}
