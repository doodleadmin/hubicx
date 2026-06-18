# Current Model Schemas Before Cleanup

Production source: `ai_models` table, active models only, queried before Nano Banana cleanup on 2026-06-04 after DB backup `backup_before_model_schema_simplify_20260604_161534.sql`.

## nano_banana_2
- Provider: `fal-ai/nano-banana-2`
- Task type: `image`
- User-visible fields: `prompt`, `aspect_ratio`
- Advanced fields: `output_format`, `num_images`, `safety_tolerance`, `resolution`, `limit_generations`, `enable_web_search`, `thinking_level`, `system_prompt`, `seed`
- Hidden fields: none
- Provider input fields from schema: all fields above via `provider_key`
- Default params: `num_images=1`
- Price rules: base 40, multiplied by `num_images`

## nano_banana_pro
- Provider: `fal-ai/nano-banana-pro`
- Task type: `image`
- User-visible fields: `prompt`, `aspect_ratio`, `resolution`
- Advanced fields: `output_format`, `num_images`, `safety_tolerance`, `limit_generations`, `enable_web_search`, `system_prompt`, `seed`
- Hidden fields: none
- Provider input fields from schema: all fields above via `provider_key`
- Default params: `num_images=1`
- Price rules: base 80, multiplied by `resolution` (`1K=1`, `2K=2`, `4K=4`) and `num_images`; extra addition for `enable_web_search=true`

## nano_banana_edit
- Provider: `fal-ai/nano-banana/edit`
- Task type: `image`
- User-visible fields: `image_urls`, `prompt`, `aspect_ratio`
- Advanced fields: `output_format`, `num_images`, `safety_tolerance`, `limit_generations`, `seed`
- Hidden fields: none
- Provider input fields from schema: all fields above via `provider_key`; `image_urls` resolves uploaded files to public storage URLs
- Default params: `num_images=1`
- Price rules: base 60, multiplied by `num_images`

## flux_schnell
- Provider: `fal-ai/flux/schnell`
- Task type: `image`
- User-visible fields: `prompt`, `image_size`
- Advanced fields: `num_images`, `output_format`, `num_inference_steps`, `guidance_scale`, `enable_safety_checker`, `acceleration`, `seed`
- Hidden fields: `sync_mode=false` in `default_params`
- Provider input fields from schema: visible and advanced fields via `provider_key`
- Price rules: base 30, multiplied by `num_images`
- Audit note: likely hide `seed`, safety/provider controls, acceleration, guidance/steps unless productized; keep `num_images` visible because it affects price.

## seedream
- Provider: `fal-ai/bytedance/seedream/v4/text-to-image`
- Task type: `image`
- User-visible fields: `prompt`, `image_size`
- Advanced fields: `num_images`, `max_images`, `enable_safety_checker`, `enhance_prompt_mode`, `seed`
- Hidden fields: `sync_mode=false` in `default_params`
- Provider input fields from schema: visible and advanced fields via `provider_key`
- Price rules: base 50, multiplied by `image_size` for `auto_2K/auto_4K` and by `num_images`
- Audit note: keep size/quality and `num_images` visible because they affect price; hide seed/safety/internal limits.

## z_image
- Provider: `fal-ai/z-image/turbo`
- Task type: `image`
- User-visible fields: `prompt`, `image_size`
- Advanced fields: `num_inference_steps`, `num_images`, `enable_safety_checker`, `output_format`, `acceleration`, `enable_prompt_expansion`, `seed`
- Hidden fields: `sync_mode=false` in `default_params`
- Provider input fields from schema: visible and advanced fields via `provider_key`
- Price rules: base 25, multiplied by `num_images`
- Audit note: hide seed/safety/output/acceleration/prompt-expansion/steps unless productized; keep `num_images` visible because it affects price.

## ai_chat
- Provider: `openai/gpt-4o-mini`
- Task type: `text`
- User-visible fields: `prompt`
- Advanced fields: `temperature`, `max_tokens`
- Hidden fields: none
- Provider input fields from schema: all fields above via `provider_key`
- Default params: `temperature=0.7`, `max_tokens=800`
- Price rules: fixed base 2
- Audit note: hide technical token limit; optionally productize temperature as "Creativity".

## prompt_helper
- Provider: `openai/gpt-4o-mini`
- Task type: `text`
- User-visible fields: `prompt`
- Advanced fields: none
- Hidden fields: `temperature=0.5`, `max_tokens=1000` in `default_params`
- Provider input fields from schema: `prompt`
- Price rules: fixed base 2
- Audit note: schema is already product-simple.

## seedance_2_t2v
- Provider: `bytedance/seedance-2.0/text-to-video`
- Task type: `video`
- User-visible fields: `prompt`, `aspect_ratio`
- Advanced fields: `duration`, `resolution`, `generate_audio`, `seed`
- Hidden fields: `sync_mode=false` in `default_params`
- Provider input fields from schema: visible and advanced fields via `provider_key`
- Price rules: base 250, multiplied by `resolution` and `duration`
- Audit note: duration/resolution affect price and should be visible/productized; hide seed and maybe audio default.

## seedance_2_i2v_fast
- Provider: `bytedance/seedance-2.0/fast/image-to-video`
- Task type: `video`
- User-visible fields: `image_url`, `prompt`, `aspect_ratio`
- Advanced fields: `duration`, `resolution`, `generate_audio`, `end_image_url`, `seed`
- Hidden fields: `sync_mode=false` in `default_params`
- Provider input fields from schema: visible and advanced fields via `provider_key`; uploaded `image_url` resolves to public storage URL
- Price rules: base 180, multiplied by `duration`
- Audit note: duration affects price and should be visible/productized; hide seed, possibly keep end frame as optional product setting.

## seedance_2_i2v
- Provider: `bytedance/seedance-2.0/image-to-video`
- Task type: `video`
- User-visible fields: `image_url`, `prompt`, `aspect_ratio`
- Advanced fields: `duration`, `resolution`, `generate_audio`, `end_image_url`, `seed`
- Hidden fields: `sync_mode=false` in `default_params`
- Provider input fields from schema: visible and advanced fields via `provider_key`; uploaded `image_url` resolves to public storage URL
- Price rules: base 250, multiplied by `resolution` and `duration`
- Audit note: duration/resolution affect price and should be visible/productized; hide seed, possibly keep end frame as optional product setting.

## kling_21_i2v
- Provider: `fal-ai/kling-video/v2.1/standard/image-to-video`
- Task type: `video`
- User-visible fields: `image_url`, `prompt`
- Advanced fields: `duration`, `negative_prompt`, `cfg_scale`
- Hidden fields: `sync_mode=false` in `default_params`
- Provider input fields from schema: visible and advanced fields via `provider_key`; uploaded `image_url` resolves to public storage URL
- Price rules: base 220, multiplied by `duration`
- Audit note: duration affects price and should be visible/productized; hide negative prompt and CFG scale behind defaults.
