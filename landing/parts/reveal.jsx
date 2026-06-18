/* ============================================================
   RevealCanvas — canvas engine for AI-result reveals.
   Modes: 'diffusion' (denoise from static), 'particles'
   (pixel tiles converge), 'mosaic' (blocks resolve in a wave).
   Works controlled (pass progress 0..1) or auto (auto + replayKey).
   ============================================================ */

const REVEAL_MODES = [
  { id:'diffusion', name:'Диффузия',  desc:'Изображение проявляется из шума — как денойз в диффузионных моделях' },
  { id:'particles', name:'Частицы',   desc:'Пиксельные плитки слетаются и собираются в кадр' },
  { id:'mosaic',    name:'Мозаика',   desc:'Блоки резкости проявляются волной по диагонали' },
];

function easeInOut(t){ return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }
function easeOut(t){ return 1-Math.pow(1-t,3); }
function clamp01(t){ return t<0?0:t>1?1:t; }

function RevealCanvas({ src, mode='diffusion', progress, auto=false, replayKey=0, duration=2600, onDone, cell=15 }){
  const cvRef   = useRef(null);
  const offRef  = useRef(null);   // offscreen: cover-fit image at backing res
  const noiseRef= useRef(null);   // small colored noise tile
  const cellsRef= useRef(null);   // [{x,y,w,h,r,g,b,sx,sy,delay,ord}]
  const dimRef  = useRef({W:0,H:0,dpr:1});
  const curRef  = useRef(0);
  const rafRef  = useRef(0);
  const readyRef= useRef(false);
  const doneFiredRef = useRef(false);
  const onDoneRef = useRef(onDone); onDoneRef.current = onDone;

  // ---- build offscreen + cells + noise ----
  const setup = useCallback(()=>{
    const cv = cvRef.current; if(!cv) return;
    const rect = cv.getBoundingClientRect();
    const cw = Math.max(40, Math.round(rect.width));
    const ch = Math.max(40, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio||1, 2);
    const W = Math.round(cw*dpr), H = Math.round(ch*dpr);
    cv.width = W; cv.height = H;
    dimRef.current = { W, H, dpr };

    const img = new Image();
    img.onload = ()=>{
      // cover-fit onto offscreen
      const off = document.createElement('canvas'); off.width=W; off.height=H;
      const oc = off.getContext('2d');
      const ir = img.width/img.height, cr = W/H;
      let dw,dh,dx,dy;
      if(ir>cr){ dh=H; dw=H*ir; dx=(W-dw)/2; dy=0; } else { dw=W; dh=W/ir; dx=0; dy=(H-dh)/2; }
      oc.drawImage(img,dx,dy,dw,dh);
      offRef.current = off;

      // sample cells
      const cpx = Math.max(6, Math.round(cell*dpr));
      const cols = Math.ceil(W/cpx), rows = Math.ceil(H/cpx);
      let data=null; try{ data = oc.getImageData(0,0,W,H).data; }catch(e){ data=null; }
      const cells=[];
      for(let ry=0;ry<rows;ry++){
        for(let cx2=0;cx2<cols;cx2++){
          const x=cx2*cpx, y=ry*cpx, w=Math.min(cpx,W-x), h=Math.min(cpx,H-y);
          let r=140,g=140,b=150;
          if(data){ const sx=Math.min(W-1,x+(w>>1)), sy=Math.min(H-1,y+(h>>1)); const i=(sy*W+sx)*4; r=data[i];g=data[i+1];b=data[i+2]; }
          // scatter start for particles
          const ang=Math.random()*Math.PI*2, dist=(0.4+Math.random()*0.9)*Math.max(W,H);
          cells.push({
            x,y,w,h,r,g,b,
            sx:x+Math.cos(ang)*dist, sy:y+Math.sin(ang)*dist,
            delay:Math.random()*0.35,
            ord:(cx2/cols + ry/rows)/2 + Math.random()*0.12
          });
        }
      }
      cellsRef.current = { list:cells, cpx, cols, rows };

      // colored noise tile (sage/lilac tinted static)
      const nn=document.createElement('canvas'); nn.width=110; nn.height=Math.round(110*H/W)||130;
      const nctx=nn.getContext('2d'); const nd=nctx.createImageData(nn.width,nn.height);
      for(let i=0;i<nd.data.length;i+=4){
        const v=Math.random(); const t=Math.random();
        nd.data[i]   = 120 + v*120 + t*20;
        nd.data[i+1] = 130 + v*110;
        nd.data[i+2] = 150 + v*100 + (1-t)*30;
        nd.data[i+3] = 255;
      }
      nctx.putImageData(nd,0,0);
      noiseRef.current = nn;

      readyRef.current = true; doneFiredRef.current=false;
      curRef.current = (progress!=null && !auto) ? clamp01(progress) : 0;
      draw(curRef.current);
      if(auto) startAuto();
      else follow();
    };
    img.src = src;
  }, [src, replayKey, cell]);

  // ---- draw a frame at t (0..1) ----
  function draw(t){
    const cv=cvRef.current, off=offRef.current; if(!cv||!off) return;
    const {W,H}=dimRef.current; const ctx=cv.getContext('2d');
    ctx.clearRect(0,0,W,H);

    if(mode==='diffusion'){
      // pixelation: blocky -> sharp
      const blocks = Math.max(6, Math.round(6 + (W-6)*easeInOut(clamp01((t-0.05)/0.95))));
      const sw = Math.max(2, blocks), sh = Math.max(2, Math.round(sw*H/W));
      const tmp=draw._tmp||(draw._tmp=document.createElement('canvas'));
      tmp.width=sw; tmp.height=sh; const tc=tmp.getContext('2d');
      tc.imageSmoothingEnabled=true; tc.drawImage(off,0,0,sw,sh);
      ctx.imageSmoothingEnabled = t>0.82; // crisp only at the very end
      ctx.globalAlpha=1; ctx.drawImage(tmp,0,0,sw,sh,0,0,W,H);
      // fading noise static on top
      const na=Math.pow(clamp01(1-t),1.25);
      if(na>0.01 && noiseRef.current){
        ctx.globalAlpha=na; ctx.globalCompositeOperation='source-over';
        // offset noise each frame for "boiling" static
        const nx=(Math.random()*8-4), ny=(Math.random()*8-4);
        ctx.drawImage(noiseRef.current, nx, ny, W+8, H+8);
        ctx.globalCompositeOperation='source-over';
      }
      ctx.globalAlpha=1;
      return;
    }

    if(mode==='particles'){
      const C=cellsRef.current; if(!C) return;
      ctx.fillStyle='#11100e'; ctx.fillRect(0,0,W,H);
      const list=C.list;
      for(let k=0;k<list.length;k++){
        const c=list[k];
        const lt=clamp01((t-c.delay)/(1-c.delay));
        const e=easeOut(lt);
        const px=c.sx+(c.x-c.sx)*e, py=c.sy+(c.y-c.sy)*e;
        const sc=0.3+0.7*e;
        ctx.globalAlpha=Math.min(1, lt*1.6);
        ctx.fillStyle='rgb('+c.r+','+c.g+','+c.b+')';
        const w=c.w*sc, h=c.h*sc;
        ctx.fillRect(px+(c.w-w)/2, py+(c.h-h)/2, w+0.6, h+0.6);
      }
      ctx.globalAlpha=1;
      // crisp cross-fade at the end
      if(t>0.86){ ctx.globalAlpha=clamp01((t-0.86)/0.14); ctx.drawImage(off,0,0,W,H); ctx.globalAlpha=1; }
      return;
    }

    // mosaic: full image, cover unrevealed blocks with a wave
    const C=cellsRef.current; if(!C){ ctx.drawImage(off,0,0,W,H); return; }
    ctx.drawImage(off,0,0,W,H);
    const band=0.16, list=C.list;
    for(let k=0;k<list.length;k++){
      const c=list[k];
      const rv=clamp01((t*(1+band) - c.ord)/band);
      if(rv>=1) continue;
      // unrevealed: tinted dark block; popping scale as it resolves
      ctx.globalAlpha=1-rv;
      const mix=0.5+0.5*rv;
      ctx.fillStyle='rgb('+Math.round(c.r*0.35*mix+18)+','+Math.round(c.g*0.35*mix+18)+','+Math.round(c.b*0.4*mix+26)+')';
      const pad=(1-easeOut(rv))*0; // keep full block for clean wipe
      ctx.fillRect(c.x-pad, c.y-pad, c.w+pad*2+0.6, c.h+pad*2+0.6);
    }
    ctx.globalAlpha=1;
    // leading edge glow line
    const edge=t*(1+band);
    ctx.save(); ctx.globalCompositeOperation='lighter';
    for(let k=0;k<list.length;k++){ const c=list[k]; if(Math.abs(c.ord-edge+band*0.5)<band*0.5){ ctx.globalAlpha=0.5; ctx.fillStyle='rgba(190,200,240,1)'; ctx.fillRect(c.x,c.y,c.w+0.6,c.h+0.6);} }
    ctx.restore(); ctx.globalAlpha=1;
  }

  // ---- controlled: ease current toward progress prop ----
  function follow(){
    cancelAnimationFrame(rafRef.current);
    const step=()=>{
      const target = clamp01(progress==null?1:progress);
      const cur = curRef.current;
      const next = cur + (target-cur)*0.12;
      curRef.current = Math.abs(target-next)<0.0015 ? target : next;
      draw(curRef.current);
      if(curRef.current>=0.999 && target>=0.999 && !doneFiredRef.current){ doneFiredRef.current=true; onDoneRef.current&&onDoneRef.current(); }
      if(Math.abs(target-curRef.current)>0.0008){ rafRef.current=requestAnimationFrame(step); }
    };
    rafRef.current=requestAnimationFrame(step);
  }

  // ---- auto: time ramp 0..1 ----
  function startAuto(){
    cancelAnimationFrame(rafRef.current);
    const t0=performance.now();
    const step=(now)=>{
      const lin=clamp01((now-t0)/duration);
      curRef.current=easeInOut(lin);
      draw(curRef.current);
      if(lin<1){ rafRef.current=requestAnimationFrame(step); }
      else if(!doneFiredRef.current){ doneFiredRef.current=true; onDoneRef.current&&onDoneRef.current(); }
    };
    rafRef.current=requestAnimationFrame(step);
  }

  useEffect(()=>{ setup(); return ()=>cancelAnimationFrame(rafRef.current); }, [setup]);
  // re-follow when controlled progress changes
  useEffect(()=>{ if(readyRef.current && !auto) follow(); }, [progress, auto]);
  // redraw immediately when mode flips (no rebuild)
  useEffect(()=>{ if(readyRef.current) draw(curRef.current); }, [mode]);

  return <canvas ref={cvRef} style={{width:'100%',height:'100%',display:'block'}}/>;
}

window.HBX = window.HBX || {};
window.HBX.RevealCanvas = RevealCanvas;
window.HBX.REVEAL_MODES = REVEAL_MODES;
