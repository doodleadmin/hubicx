from pydantic import BaseModel


class PaymentCreate(BaseModel):
    credits: int
    amount_rub: float | None = None
    package_code: str | None = None
    return_url: str | None = None


class PaymentOut(BaseModel):
    payment_id: int
    status: str
    payment_url: str | None
    message: str


class OrderPreviewRequest(BaseModel):
    package_code: str | None = None
    custom_amount_rub: int | None = None
