from pydantic import BaseModel


class PaymentCreate(BaseModel):
    credits: int


class PaymentOut(BaseModel):
    payment_id: int
    status: str
    payment_url: str | None
    message: str
