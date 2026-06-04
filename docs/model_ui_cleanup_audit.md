# Model UI Cleanup Audit

Production source: active rows from `ai_models`, recent `generation_tasks.provider_input`, and provider docs review on 2026-06-04.

Backup before DB changes: `/opt/backups/ai_aggregator/backup_before_full_model_ui_cleanup_20260604_172547.sql`.

## Findings

`generation_tasks.provider_input` is the source of truth for values sent to providers. Recent production tasks confirmed that fields exposed in WebApp forms were merged into provider input together with `default_params`. Old generations included technical fields such as `seed`, `output_format`, `safety_tolerance`, `guidance_scale`, `num_inference_steps`, `negative_prompt`, and `cfg_scale` when those fields were present in form schemas.

## Cleanup Table

| Model | Before cleanup | Keep visible | Hidden defaults | Removed from UI |
| --- | --- | --- | --- | --- |
| `ai_chat` | `prompt`, advanced `temperature`, `max_tokens` | `prompt` | `temperature=0.7`, `max_tokens=800` | `temperature`, `max_tokens` |
| `prompt_helper` | `prompt` | `prompt` | `temperature=0.5`, `max_tokens=1000` | none |
| `nano_banana_2` | already simplified after previous cleanup | `prompt`, `aspect_ratio`, `num_images` | `output_format=png`, `safety_tolerance=4` | seed/system/web/search/technical fields |
| `nano_banana_pro` | already simplified after previous cleanup | `prompt`, `aspect_ratio`, `resolution`, `num_images` | `output_format=png`, `safety_tolerance=4` | seed/system/web/search/technical fields |
| `nano_banana_edit` | already simplified after previous cleanup | `prompt`, `image_urls`, `aspect_ratio`, `num_images` | `output_format=png`, `safety_tolerance=4` | seed/limit/technical fields |
| `flux_schnell` | visible `prompt`, `image_size`; advanced `num_images`, `output_format`, `num_inference_steps`, `guidance_scale`, `enable_safety_checker`, `acceleration`, `seed` | `prompt`, `image_size`, `num_images` | `output_format=jpeg`, `num_inference_steps=4`, `guidance_scale=3.5`, `enable_safety_checker=true`, `acceleration=none`, `sync_mode=false` | `seed`, output/safety/guidance/steps/acceleration controls |
| `seedream` | visible `prompt`, `image_size`; advanced `num_images`, `max_images`, `enable_safety_checker`, `enhance_prompt_mode`, `seed` | `prompt`, `image_size`, `num_images` | `max_images=1`, `enable_safety_checker=true`, `enhance_prompt_mode=standard`, `sync_mode=false` | `seed`, safety/enhancement/internal max controls |
| `z_image` | visible `prompt`, `image_size`; advanced `num_inference_steps`, `num_images`, `enable_safety_checker`, `output_format`, `acceleration`, `enable_prompt_expansion`, `seed` | `prompt`, `image_size`, `num_images` | `num_inference_steps=8`, `enable_safety_checker=true`, `output_format=png`, `acceleration=regular`, `sync_mode=false` | `seed`, prompt expansion, safety/output/steps/acceleration controls |
| `seedance_2_t2v` | visible `prompt`, `aspect_ratio`; advanced `duration`, `resolution`, `generate_audio`, `seed` | `prompt`, `aspect_ratio`, `duration`, `resolution`, `generate_audio` | `sync_mode=false` | `seed` |
| `seedance_2_i2v_fast` | visible `image_url`, `prompt`, `aspect_ratio`; advanced `duration`, `resolution`, `generate_audio`, `end_image_url`, `seed` | `image_url`, `prompt`, `aspect_ratio`, `duration`, `resolution`, `generate_audio`, optional `end_image_url` | `sync_mode=false` | `seed` |
| `seedance_2_i2v` | visible `image_url`, `prompt`, `aspect_ratio`; advanced `duration`, `resolution`, `generate_audio`, `end_image_url`, `seed` | `image_url`, `prompt`, `aspect_ratio`, `duration`, `resolution`, `generate_audio`, optional `end_image_url` | `sync_mode=false` | `seed` |
| `kling_21_i2v` | visible `image_url`, `prompt`; advanced `duration`, `negative_prompt`, `cfg_scale` | `image_url`, `prompt`, `duration` | `negative_prompt=blur, distort, and low quality`, `cfg_scale=0.5`, `sync_mode=false` | `negative_prompt`, `cfg_scale` |

## Provider Input Examples

- `flux_schnell`: user form should provide `prompt`, `image_size`, `num_images`; backend adds hidden defaults `output_format`, `num_inference_steps`, `guidance_scale`, `enable_safety_checker`, `acceleration`, `sync_mode`.
- `seedance_2_i2v`: user form should provide `image_url`, `prompt`, `aspect_ratio`, `duration`, `resolution`, `generate_audio`, optional `end_image_url`; backend adds `sync_mode=false`.
- `kling_21_i2v`: user form should provide `image_url`, `prompt`, `duration`; backend adds `negative_prompt`, `cfg_scale`, `sync_mode`.
- `ai_chat`: user form should provide `prompt`; backend adds `temperature` and `max_tokens`.

## Pricing Fields

- Image count affects price for Nano Banana, Flux, Seedream, and Z-Image, so `num_images` remains visible.
- Resolution and duration affect price for Seedance, so both remain visible.
- Kling duration affects price, so it remains visible.
- Z-Image prompt expansion can change provider cost and is not represented in app price rules, so it is not exposed.
