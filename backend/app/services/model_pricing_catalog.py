"""
Model prices in tokens (token scale v3: 1 token ≈ 4.4-7.9 ₽ depending on the plan).

Seeded into model_pricing by `python -m backend.seed` (existing rows are kept unless --force).
Derived from provider costs with the unit-economics formula in docs/pricing-policy.md;
`note` records the provider rate each price is based on.
"""

MODEL_PRICING: dict[str, dict] = {
    'nano_banana_2_lite': {
        "category": "image",
        "price_tokens": 3,
        "price_rules": {"multiply_by_num_images": True, "min": 1, "round": "ceil"},
        "note": 'Fal pricing API: unit-based; kept at the previous safe price until the per-image unit is confirmed.',
    },
    'nano_banana_2': {
        "category": "image",
        "price_tokens": 3,
        "price_rules": {"multiply_by_num_images": True, "min": 1, "round": "ceil"},
        "note": 'Fal pricing API: $0.08/image.',
    },
    'nano_banana_edit': {
        "category": "image",
        "price_tokens": 1,
        "price_rules": {"multiply_by_num_images": True, "min": 1, "round": "ceil"},
        "note": 'Fal pricing API: $0.0398/image.',
    },
    'flux_schnell': {
        "category": "image",
        "price_tokens": 1,
        "price_rules": {"multiply_by_num_images": True, "min": 1, "round": "ceil"},
        "note": 'Fal pricing API: $0.003/megapixel; priced from 1MP baseline.',
    },
    'seedream': {
        "category": "image",
        "price_tokens": 1,
        "price_rules": {"multiply_by_num_images": True, "min": 1, "round": "ceil"},
        "note": 'Fal pricing API: $0.03/image.',
    },
    'z_image': {
        "category": "image",
        "price_tokens": 1,
        "price_rules": {"multiply_by_num_images": True, "min": 1, "round": "ceil"},
        "note": 'Fal pricing API: $0.005/megapixel; priced from 1MP baseline.',
    },
    'gpt_image_2': {
        "category": "image",
        "price_tokens": 11,
        "price_rules": {"multipliers": [{"field": "quality", "values": {"auto": 1, "low": 0.7, "medium": 1, "high": 1.4}}, {"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
        "note": 'Fal pricing API: token-based; kept at existing safe price until exact token estimator is implemented.',
    },
    'gpt_image_2_edit': {
        "category": "image",
        "price_tokens": 14,
        "price_rules": {"multipliers": [{"field": "quality", "values": {"auto": 1, "low": 0.7, "medium": 1, "high": 1.4}}, {"field": "num_images", "mode": "multiply_by_value"}], "min": 1, "round": "ceil"},
        "note": 'Fal pricing API: token-based edit endpoint; kept at existing safe price until exact token estimator is implemented.',
    },
    'nano_banana_pro': {
        "category": "image",
        "price_tokens": 5,
        "price_rules": {"resolution_prices": {"1K": 5, "2K": 5, "4K": 10}, "default_resolution": "1K", "multiply_by_num_images": True},
        "note": 'Fal pricing API: $0.15/image for 1K/2K, $0.30/image for 4K.',
    },
    'seedance_2_t2v': {
        "category": "video",
        "price_tokens": 45,
        "price_rules": {"resolution_duration_prices": {"480p": {"4": 19, "5": 23, "6": 28, "7": 31, "8": 36, "9": 40, "10": 45, "11": 49, "12": 54, "13": 58, "14": 63, "15": 66, "auto": 23}, "720p": {"4": 36, "5": 45, "6": 54, "7": 63, "8": 71, "9": 80, "10": 89, "11": 98, "12": 108, "13": 116, "14": 125, "15": 134, "auto": 45}, "1080p": {"4": 80, "5": 100, "6": 120, "7": 140, "8": 160, "9": 180, "10": 200, "11": 220, "12": 240, "13": 259, "14": 279, "15": 299, "auto": 100}}, "default_resolution": "720p", "default_duration": "5"},
        "note": 'Fal model page: 720p $0.3034/s, 1080p $0.682/s; 480p by token-derived public rate.',
    },
    'seedance_2_i2v': {
        "category": "video",
        "price_tokens": 45,
        "price_rules": {"resolution_duration_prices": {"480p": {"4": 19, "5": 23, "6": 28, "7": 31, "8": 36, "9": 40, "10": 45, "11": 49, "12": 54, "13": 58, "14": 63, "15": 66, "auto": 23}, "720p": {"4": 36, "5": 45, "6": 54, "7": 63, "8": 71, "9": 80, "10": 89, "11": 98, "12": 108, "13": 116, "14": 125, "15": 134, "auto": 45}, "1080p": {"4": 80, "5": 100, "6": 120, "7": 140, "8": 160, "9": 180, "10": 200, "11": 220, "12": 240, "13": 259, "14": 279, "15": 299, "auto": 100}}, "default_resolution": "720p", "default_duration": "5"},
        "note": 'Fal model page: 720p $0.3034/s, 1080p $0.682/s; 480p by token-derived public rate.',
    },
    'seedance_2_reference': {
        "category": "video",
        "price_tokens": 45,
        "price_rules": {"resolution_duration_prices": {"480p": {"4": 19, "5": 23, "6": 28, "7": 31, "8": 36, "9": 40, "10": 45, "11": 49, "12": 54, "13": 58, "14": 63, "15": 66, "auto": 23}, "720p": {"4": 36, "5": 45, "6": 54, "7": 63, "8": 71, "9": 80, "10": 89, "11": 98, "12": 108, "13": 116, "14": 125, "15": 134, "auto": 45}, "1080p": {"4": 80, "5": 100, "6": 120, "7": 140, "8": 160, "9": 180, "10": 200, "11": 220, "12": 240, "13": 259, "14": 279, "15": 299, "auto": 100}}, "default_resolution": "720p", "default_duration": "5"},
        "note": 'Fal model page: 720p $0.3034/s, 1080p $0.682/s; 480p by token-derived public rate.',
    },
    'seedance_2_t2v_fast': {
        "category": "video",
        "price_tokens": 36,
        "price_rules": {"resolution_duration_prices": {"480p": {"4": 15, "5": 19, "6": 21, "7": 25, "8": 29, "9": 33, "10": 36, "11": 40, "12": 43, "13": 46, "14": 50, "15": 54, "auto": 19}, "720p": {"4": 29, "5": 36, "6": 43, "7": 50, "8": 58, "9": 64, "10": 71, "11": 79, "12": 85, "13": 93, "14": 100, "15": 106, "auto": 36}}, "default_resolution": "720p", "default_duration": "5"},
        "note": 'Fal model page: fast 720p $0.2419/s; 480p by token-derived public rate.',
    },
    'seedance_2_i2v_fast': {
        "category": "video",
        "price_tokens": 36,
        "price_rules": {"resolution_duration_prices": {"480p": {"4": 15, "5": 19, "6": 21, "7": 25, "8": 29, "9": 33, "10": 36, "11": 40, "12": 43, "13": 46, "14": 50, "15": 54, "auto": 19}, "720p": {"4": 29, "5": 36, "6": 43, "7": 50, "8": 58, "9": 64, "10": 71, "11": 79, "12": 85, "13": 93, "14": 100, "15": 106, "auto": 36}}, "default_resolution": "720p", "default_duration": "5"},
        "note": 'Fal model page: fast 720p $0.2419/s; 480p by token-derived public rate.',
    },
    'seedance_2_reference_fast': {
        "category": "video",
        "price_tokens": 36,
        "price_rules": {"resolution_duration_prices": {"480p": {"4": 15, "5": 19, "6": 21, "7": 25, "8": 29, "9": 33, "10": 36, "11": 40, "12": 43, "13": 46, "14": 50, "15": 54, "auto": 19}, "720p": {"4": 29, "5": 36, "6": 43, "7": 50, "8": 58, "9": 64, "10": 71, "11": 79, "12": 85, "13": 93, "14": 100, "15": 106, "auto": 36}}, "default_resolution": "720p", "default_duration": "5"},
        "note": 'Fal model page: fast 720p $0.2419/s; 480p by token-derived public rate.',
    },
    'seedance_2_mini_t2v': {
        "category": "video",
        "price_tokens": 24,
        "price_rules": {"resolution_duration_prices": {"480p": {"4": 9, "5": 11, "6": 14, "7": 15, "8": 18, "9": 20, "10": 21, "11": 24, "12": 26, "13": 28, "14": 30, "15": 33, "auto": 11}, "720p": {"4": 19, "5": 24, "6": 28, "7": 33, "8": 36, "9": 41, "10": 46, "11": 50, "12": 55, "13": 59, "14": 64, "15": 69, "auto": 24}}, "default_resolution": "720p", "default_duration": "5"},
        "note": 'Fal model page: mini 720p roughly $0.1547/s, 480p roughly $0.0721/s.',
    },
    'seedance_2_mini_i2v': {
        "category": "video",
        "price_tokens": 24,
        "price_rules": {"resolution_duration_prices": {"480p": {"4": 9, "5": 11, "6": 14, "7": 15, "8": 18, "9": 20, "10": 21, "11": 24, "12": 26, "13": 28, "14": 30, "15": 33, "auto": 11}, "720p": {"4": 19, "5": 24, "6": 28, "7": 33, "8": 36, "9": 41, "10": 46, "11": 50, "12": 55, "13": 59, "14": 64, "15": 69, "auto": 24}}, "default_resolution": "720p", "default_duration": "5"},
        "note": 'Fal model page: mini 720p roughly $0.1547/s, 480p roughly $0.0721/s.',
    },
    'seedance_2_mini_reference': {
        "category": "video",
        "price_tokens": 24,
        "price_rules": {"resolution_duration_prices": {"480p": {"4": 9, "5": 11, "6": 14, "7": 15, "8": 18, "9": 20, "10": 21, "11": 24, "12": 26, "13": 28, "14": 30, "15": 33, "auto": 11}, "720p": {"4": 19, "5": 24, "6": 28, "7": 33, "8": 36, "9": 41, "10": 46, "11": 50, "12": 55, "13": 59, "14": 64, "15": 69, "auto": 24}}, "default_resolution": "720p", "default_duration": "5"},
        "note": 'Fal model page: mini 720p roughly $0.1547/s, 480p roughly $0.0721/s.',
    },
    'kling_21_i2v': {
        "category": "video",
        "price_tokens": 9,
        "price_rules": {"duration_prices": {"5": 9, "10": 18}, "default_duration": "5"},
        "note": 'Fal pricing API: $0.056/second.',
    },
    'kling_30_i2v': {
        "category": "video",
        "price_tokens": 41,
        "price_rules": {"duration_prices": {"3": 13, "4": 18, "5": 21, "6": 25, "7": 29, "8": 34, "9": 38, "10": 41, "11": 45, "12": 50, "13": 54, "14": 58, "15": 63}, "default_duration": "10"},
        "note": 'Fal pricing API: $0.14/second.',
    },
    'grok_video_t2v': {
        "category": "video",
        "price_tokens": 10,
        "price_rules": {"duration_prices": {"4": 6, "6": 10}, "default_duration": "6"},
        "note": 'Fal pricing API: $0.05/second.',
    },
    'grok_video_i2v': {
        "category": "video",
        "price_tokens": 10,
        "price_rules": {"duration_prices": {"4": 6, "6": 10}, "default_duration": "6"},
        "note": 'Fal pricing API: $0.05/second.',
    },
    'happy_horse_i2v': {
        "category": "video",
        "price_tokens": 21,
        "price_rules": {"resolution_duration_prices": {"480p": {"4": 14, "5": 18, "6": 20, "7": 24, "8": 26, "9": 30, "10": 34, "11": 36, "12": 40, "13": 43, "14": 46, "15": 50, "auto": 18}, "720p": {"4": 18, "5": 21, "6": 25, "7": 29, "8": 34, "9": 38, "10": 41, "11": 45, "12": 50, "13": 54, "14": 58, "15": 63, "auto": 21}, "1080p": {"4": 34, "5": 41, "6": 50, "7": 58, "8": 66, "9": 74, "10": 83, "11": 90, "12": 99, "13": 106, "14": 115, "15": 124, "auto": 41}}, "default_resolution": "720p", "default_duration": "5"},
        "note": 'Fal pricing API: $0.14/second; resolution multipliers follow existing UI pricing ratios.',
    },
    'veo_31_t2v': {
        "category": "video",
        "price_tokens": 94,
        "price_rules": {"resolution_duration_prices": {"720p": {"4s": 48, "6s": 71, "8s": 94, "auto": 94}, "1080p": {"4s": 94, "6s": 141, "8s": 188, "auto": 188}, "4k": {"4s": 188, "6s": 281, "8s": 374, "auto": 374}}, "default_resolution": "720p", "default_duration": "8s"},
        "note": 'Fal pricing API: $0.40/second baseline; resolution multipliers follow existing UI pricing ratios.',
    },
    'veo_31_i2v': {
        "category": "video",
        "price_tokens": 94,
        "price_rules": {"resolution_duration_prices": {"720p": {"4s": 48, "6s": 71, "8s": 94, "auto": 94}, "1080p": {"4s": 94, "6s": 141, "8s": 188, "auto": 188}, "4k": {"4s": 188, "6s": 281, "8s": 374, "auto": 374}}, "default_resolution": "720p", "default_duration": "8s"},
        "note": 'Fal pricing API: $0.40/second baseline; resolution multipliers follow existing UI pricing ratios.',
    },
    'kling_30_motion_control': {
        "category": "video",
        "price_tokens": 38,
        "price_rules": None,
        "note": 'Fal pricing API: $0.126/second; fixed price uses 10-second planning baseline because UI has no duration control.',
    },
}
