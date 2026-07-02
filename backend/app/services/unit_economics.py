import math
from dataclasses import dataclass


@dataclass(frozen=True)
class UnitEconomicsInput:
    provider_cost_usd: float
    usd_rub: float = 90.0
    tax_rate: float = 0.06
    acquiring_rate: float = 0.025
    acquiring_vat_rate: float = 0.22
    target_net_margin_rate: float = 0.30
    partner_share_from_profit_rate: float = 0.25
    token_floor_rub: float = 0.55
    token_round_to: int = 10


def _positive(value: float, name: str) -> float:
    value = float(value)
    if value < 0:
        raise ValueError(f"{name} must be non-negative")
    return value


def _rate(value: float, name: str) -> float:
    value = _positive(value, name)
    if value >= 1:
        raise ValueError(f"{name} must be less than 1")
    return value


def calculate_unit_economics(data: UnitEconomicsInput) -> dict:
    provider_cost_usd = _positive(data.provider_cost_usd, "provider_cost_usd")
    usd_rub = _positive(data.usd_rub, "usd_rub")
    tax_rate = _rate(data.tax_rate, "tax_rate")
    acquiring_rate = _rate(data.acquiring_rate, "acquiring_rate")
    acquiring_vat_rate = _rate(data.acquiring_vat_rate, "acquiring_vat_rate")
    target_net_margin_rate = _rate(data.target_net_margin_rate, "target_net_margin_rate")
    partner_share_rate = _rate(data.partner_share_from_profit_rate, "partner_share_from_profit_rate")
    token_floor_rub = _positive(data.token_floor_rub, "token_floor_rub")
    token_round_to = max(1, int(data.token_round_to or 1))

    if token_floor_rub <= 0:
        raise ValueError("token_floor_rub must be greater than 0")

    acquiring_total_rate = acquiring_rate * (1 + acquiring_vat_rate)
    variable_rate = tax_rate + acquiring_total_rate + target_net_margin_rate
    if variable_rate >= 1:
        raise ValueError("tax_rate + acquiring_total_rate + target_net_margin_rate must be less than 1")

    provider_cost_rub = provider_cost_usd * usd_rub
    recommended_price_rub = provider_cost_rub / (1 - variable_rate) if provider_cost_rub else 0
    tax_rub = recommended_price_rub * tax_rate
    acquiring_rub = recommended_price_rub * acquiring_total_rate
    net_profit_rub = recommended_price_rub - provider_cost_rub - tax_rub - acquiring_rub
    partner_payout_rub = net_profit_rub * partner_share_rate
    owner_profit_after_partner_rub = net_profit_rub - partner_payout_rub

    raw_tokens = recommended_price_rub / token_floor_rub
    recommended_tokens = int(math.ceil(raw_tokens / token_round_to) * token_round_to) if raw_tokens else 0
    rounded_price_rub = recommended_tokens * token_floor_rub

    return {
        "provider_cost_usd": round(provider_cost_usd, 6),
        "usd_rub": round(usd_rub, 4),
        "provider_cost_rub": round(provider_cost_rub, 2),
        "recommended_price_rub": round(recommended_price_rub, 2),
        "recommended_tokens": recommended_tokens,
        "rounded_price_rub_at_token_floor": round(rounded_price_rub, 2),
        "tax_rate": tax_rate,
        "tax_rub": round(tax_rub, 2),
        "acquiring_rate": acquiring_rate,
        "acquiring_vat_rate": acquiring_vat_rate,
        "acquiring_total_rate": round(acquiring_total_rate, 6),
        "acquiring_rub": round(acquiring_rub, 2),
        "target_net_margin_rate": target_net_margin_rate,
        "net_profit_rub": round(net_profit_rub, 2),
        "partner_share_from_profit_rate": partner_share_rate,
        "partner_payout_rub": round(partner_payout_rub, 2),
        "owner_profit_after_partner_rub": round(owner_profit_after_partner_rub, 2),
        "token_floor_rub": token_floor_rub,
        "token_round_to": token_round_to,
    }


def fal_per_second_cost(seconds: float, usd_per_second: float) -> float:
    seconds = _positive(seconds, "seconds")
    usd_per_second = _positive(usd_per_second, "usd_per_second")
    return seconds * usd_per_second
