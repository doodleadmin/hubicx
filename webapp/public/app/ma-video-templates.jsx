/* Seedance templates with hidden prompts and asynchronous GPT Image 2 reference preparation. */
window.HubicxVideoTemplates = [
  {
    code:'champagne-explosion', t:'Взрыв шампанского', type:'video', category:'Праздник',
    coverVideo:'assets/templates/video/champagne-explosion/cover.mp4', requiresImage:true,
    inputLabel:'Фото человека по пояс', modelCode:'seedance_2_reference', qualityValue:'720p', qualityLocked:false,
    aspectId:'9:16', aspectLocked:false, duration:'10', durationOptions:['10'], durationLocked:true, durationUnlockable:false,
    templatePipeline:'seedance_gpt_image_reference_sheet_v1', referencePrepCredits:110,
    referenceSlots:[{ label:'Фото человека', hint:'Загрузите одно фото по пояс' }],
    prompt:`{{VIDEO_FORMAT}} {{VIDEO_QUALITY}}
@Image1 is the strict identity reference. Face, hairstyle, body type, skin tone and CLOTHING remain identical in every frame. Do not change clothing.

Style: Authentic handheld smartphone footage at night. Mobile documentary look: camera shake, slight motion blur, realistic low-light noise and grain. Maximum photorealism, like a video shot by a friend, NOT cinema and NOT stylized. Light only from park lamps.
Duration: 10 seconds.
Sound: Quiet night park, distant traffic, wind in branches, candles crackling. At the climax: bottle base hits the bench, cork POP and foam hiss, simultaneous deep WHOOMP of a fireball. Soft laughter at the end. No speech or music, diegetic sound only.
Scene: Night park, dark sky, bare trees, distant warm lamps with natural bokeh, dry ground and leaves, old wooden bench in the center. Nothing magical.
Camera: Handheld by an invisible friend, pronounced natural shake, waist-up framing, no stabilization.

0.0-1.5s: Empty bench. @Image1 enters from the right, walks briskly, smiles warmly at camera without speaking. RIGHT hand holds a dark-green champagne bottle vertically, cork up. LEFT hand holds a round BLACK matte cake on a plate with tall burning candles.
1.5-3.0s: Sits centered facing camera. Cake rests on the extended left palm, bottle in right hand. Candles burn brightly.
3.0-4.0s: Energetically shakes the bottle with the right hand and looks playfully at camera. Cake stays stable.
4.0-5.0s: One simultaneous action. Bottle remains strictly vertical. The right hand strikes DOWN with a hammer motion and the flat bottle base hits the bench. At exactly the same moment the head turns toward the cake and the person blows a cloud of safe theatrical lycopodium powder over the candles. It ignites into a realistic orange-yellow fireball extending away from the face.
5.0-8.5s: Extreme slow motion, about 1/8 speed. The cork flies upward and a 1.5-2m white-gold champagne fountain rises vertically. Simultaneously the large orange-yellow fireball rolls over the cake with dark smoke and natural embers. Real physics only. Bottle stays vertical in the right hand; black cake stays in the left hand.
8.5-10.0s: Real speed. Fire disperses into rising smoke. Foam and droplets fall onto hair, clothing and bench. The person stays seated, relaxed, softly laughs and smiles at camera. Hold until 10 seconds.

Constraints: preserve @Image1 identity and clothing every frame; no speech; right hand always holds bottle, left hand always holds cake; do not drop objects; impact and fire happen at the same instant; realistic orange-yellow fire and champagne only; no magic particles, glitter, fireworks or confetti; no text, subtitles or watermark.`
  },
  {
    code:'cola-explosion', t:'Взрыв колы', type:'video', category:'Праздник',
    coverVideo:'assets/templates/video/cola-explosion/cover.mp4', requiresImage:true,
    inputLabel:'Фото ребёнка по пояс', modelCode:'seedance_2_reference', qualityValue:'720p', qualityLocked:false,
    aspectId:'9:16', aspectLocked:false, duration:'10', durationOptions:['10'], durationLocked:true, durationUnlockable:false,
    templatePipeline:'seedance_gpt_image_reference_sheet_v1', referencePrepCredits:110,
    referenceSlots:[{ label:'Фото ребёнка', hint:'Загрузите одно фото по пояс' }],
    prompt:`{{VIDEO_FORMAT}} {{VIDEO_QUALITY}}
@Image1 is the strict identity reference. Face, hairstyle, body type, skin tone and clothing remain identical in every frame.

Style: Authentic handheld smartphone footage at night, realistic shake, slight blur and low-light noise. Photorealistic, not cinematic. Light only from park lamps. Duration 10 seconds.
Sound: Quiet night park, distant traffic, wind and candle crackle. At climax: bottle base knock, cap pop, cola fountain hiss and simultaneous deep fireball whoomp. Soft laughter at the end. No speech or music.
Location: Night city park with dark sky, bare trees, distant lamps, dry leaves and an old wooden bench.
Camera: Invisible handheld operator, organic shake, waist-up framing, no stabilization.

0.0-1.5s: Empty bench. @Image1 enters from the right and smiles at camera. RIGHT hand holds a transparent glass cola bottle vertically, cap up. LEFT hand holds a small light cake with a burning number 8 candle.
1.5-3.0s: Sits centered, cake on extended left palm, bottle in right hand. Candle burns brightly.
3.0-4.0s: Energetically shakes the closed bottle; cola foams inside. Cake remains stable.
4.0-5.0s: One simultaneous action. Bottle remains strictly vertical and its flat base strikes DOWN onto the bench. At exactly the same moment the head turns toward the cake and a cloud of safe theatrical lycopodium powder is blown over the candle, creating a large realistic orange-yellow fireball directed away from the face.
5.0-8.5s: Extreme slow motion. The cap flies upward and a 1.5-2m dark caramel cola fountain rises. Simultaneously the orange-yellow fireball expands over the cake with realistic smoke and embers. Bottle stays in right hand; cake and number 8 candle stay in left hand.
8.5-10.0s: Real speed. Fire disperses upward, cola droplets fall, fountain weakens. @Image1 softly laughs and smiles at camera. Hold until 10 seconds.

Constraints: exact @Image1 identity and clothing; no speech; right hand always holds bottle and left hand always holds cake; no dropped objects; impact and fire simultaneous; real cola and realistic fire only; no magic, glitter, fireworks or confetti; no text, subtitles or watermark.`
  },
  {
    code:'confetti-balloons', t:'Хлопушки и шарики', type:'video', category:'Праздник',
    coverVideo:'assets/templates/video/confetti-balloons/cover.mp4', requiresImage:true,
    inputLabel:'Фото девушки по пояс', modelCode:'seedance_2_reference', qualityValue:'720p', qualityLocked:false,
    aspectId:'9:16', aspectLocked:false, duration:'10', durationOptions:['10'], durationLocked:true, durationUnlockable:false,
    templatePipeline:'seedance_gpt_image_reference_sheet_v1', referencePrepCredits:110,
    referenceSlots:[{ label:'Фото девушки', hint:'Загрузите одно фото по пояс' }],
    prompt:`{{VIDEO_FORMAT}} {{VIDEO_QUALITY}}
Use @Image1 as the strict identity and clothing reference for the woman throughout the video.

0.0-1.5s: Cosy modern bedroom in the morning. The woman is completely hidden under a white blanket. Only both hands holding a colourful confetti cannon over the blanket are visible. Two large helium balloons float above the bed. Static front camera.
1.5-3.0s: She slowly lifts the confetti cannon and twists it.
3.0-4.0s: The confetti cannon bursts with a huge cloud of gold, silver and soft pink confetti filling the room.
4.0-6.5s: Surprised and excited, @Image1 throws the blanket down, sits in bed and laughs naturally while confetti continues to fall.
6.5-8.0s: An unseen person gently hands her a small elegant milk cake with lit number 2 and 6 candles. She accepts it with both hands, smiling.
8.0-10.0s: Holding the cake, she smiles warmly, closes her eyes to make a wish and gently blows out the candles. Confetti floats in the air.

Camera: Static front camera from the foot of the bed with a slow smooth push-in. Soft natural morning light, warm cosy luxury bedroom. Ultra-realistic luxury lifestyle, Pinterest and Instagram Reel aesthetic, natural facial expressions and body movement, high detail.
Negative: no visible additional people, facial distortion, deformed hands, duplicate objects, flickering, text, watermark or poor quality.`
  },
  {
    code:'beer-apocalypse', t:'Пиво и апокалипсис', type:'video', category:'Тренды',
    coverVideo:'assets/templates/video/beer-apocalypse/cover.mp4', requiresImage:true,
    inputLabel:'Фото двух мужчин по пояс', modelCode:'seedance_2_reference', qualityValue:'720p', qualityLocked:false,
    aspectId:'16:9', aspectLocked:false, duration:'15', durationOptions:['15'], durationLocked:true, durationUnlockable:false,
    templatePipeline:'seedance_gpt_image_reference_sheet_v1', referencePrepCredits:110,
    referenceSlots:[
      { label:'Фото первого мужчины', hint:'Загрузите фото по пояс' },
      { label:'Фото второго мужчины', hint:'Загрузите фото по пояс' }
    ],
    prompt:`{{VIDEO_FORMAT}} {{VIDEO_QUALITY}}
Use @Image1 and @Image2 as strict separate identity references. Preserve each man's face, hair, body proportions and clothing consistently. Never merge or swap their identities.

0-2s: Two men, @Image1 and @Image2, casually chat and drink beer on a cliff above the ocean beside a black car. They face each other at close range, relaxed and smiling, with natural gestures.
At 2s: Meteors suddenly appear far away and fly into the ocean. Both react with shock and fear.
2-6s: They turn once toward the ocean and watch meteors and a rising mushroom-shaped smoke cloud. Dust, wind and atmospheric distortion build on the horizon.
6-10s: The cloud rises higher and a massive destructive atmospheric front begins moving toward them. Fear gradually becomes calm acceptance and they move slightly closer.
10-13s: Still holding beer mugs, they look each other in the eyes, clink mugs in a slow deliberate toast and calmly finish their beer. Hair and clothing react to strengthening wind. The advancing wave grows larger.
13-15s: The destructive wave reaches them. Violent wind, dust and debris fill the frame. Both remain close and calm as the scene is consumed. End when dust completely engulfs the frame.

Cinematography: photorealistic high-budget disaster film, dramatic contrast, realistic motion and skin detail, restrained handheld realism. Start medium-wide and slowly move closer while keeping both men visible. No location or clothing changes, no additional characters. Natural overcast daylight becomes more dramatic after the meteors appear. No text, subtitles or watermark.`
  }
];
