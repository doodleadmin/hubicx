from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    credits: int = Field(default=0, ge=0, le=1_000_000)
    amount_rub: float | None = Field(default=None, ge=1, le=1_000_000)
    package_code: str | None = Field(default=None, min_length=1, max_length=80, pattern=r"^[A-Za-z0-9_.:-]+$")
    return_url: str | None = Field(default=None, max_length=2048)


class PaymentOut(BaseModel):
    payment_id: int
    status: str
    payment_url: str | None
    message: str


class OrderPreviewRequest(BaseModel):
    package_code: str | None = Field(default=None, min_length=1, max_length=80, pattern=r"^[A-Za-z0-9_.:-]+$")
    custom_amount_rub: int | None = Field(default=None, ge=1, le=1_000_000)
