from worker.celery_app import celery_app


@celery_app.task(name="worker.polling_worker.poll_provider_tasks")
def poll_provider_tasks() -> dict:
    return {"ok": True, "message": "Polling placeholder for long-running providers"}
