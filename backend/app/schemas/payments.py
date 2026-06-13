from pydantic import BaseModel


class PaymentCreate(BaseModel):
    amount_rub: int
    credits: int
    package_code: str | None = None


class PaymentOut(BaseModel):
    payment_id: int
    status: str
    payment_url: str | None = None
    message: str | None = None


class OrderPreviewRequest(BaseModel):
    package_code: str | None = None
    custom_amount_rub: int | None = None
