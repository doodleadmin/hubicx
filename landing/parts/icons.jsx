/* ============ Hubicx desktop — inline icon set ============ */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function Ic({ n, s = 22, c = "currentColor", sw = 1.9 }) {
  const p = {
    home:<g><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></g>,
    wand:<g><path d="M15 4V2M19 8h2M17 5l1.5-1.5M3 21l11-11"/><path d="M13 7l4 4"/><path d="M19 14l.6 1.6L21 16l-1.4.6L19 18l-.6-1.4L17 16l1.4-.4z"/></g>,
    image:<g><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5L5 21"/></g>,
    video:<g><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3z"/></g>,
    history:<g><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/></g>,
    chat:<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.6A8 8 0 1 1 21 12z"/>,
    user:<g><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></g>,
    chev:<path d="M9 6l6 6-6 6"/>,
    back:<path d="M15 5l-7 7 7 7"/>,
    search:<g><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></g>,
    bell:<g><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></g>,
    plus:<path d="M12 5v14M5 12h14"/>,
    check:<path d="M5 12.5l4.5 4.5L19 6.5"/>,
    download:<g><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 21h16"/></g>,
    send:<path d="M4 12l16-7-7 16-2-7-7-2z"/>,
    model:<g><circle cx="12" cy="12" r="2.4"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2"/></g>,
    aspect:<rect x="6" y="4" width="12" height="16" rx="2.5"/>,
    refresh:<g><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 4v4h-4"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 20v-4h4"/></g>,
    close:<path d="M6 6l12 12M18 6L6 18"/>,
    settings:<g><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></g>,
    upscale:<g><path d="M3 9V3h6"/><path d="M21 15v6h-6"/><path d="M3 3l7 7M21 21l-7-7"/></g>,
    copy:<g><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></g>,
    sparkle:<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>,
    layers:<g><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></g>,
    grid:<g><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></g>,
    addimg:<g><rect x="3" y="4" width="18" height="14" rx="3"/><path d="M3 15l5-4 4 3 3-2 6 4"/><circle cx="8.5" cy="9" r="1.5"/><path d="M19 2v6M16 5h6"/></g>,
    play:<path d="M7 4l13 8-13 8z"/>,
    eye:<g><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></g>,
    arrow:<path d="M5 12h14M13 6l6 6-6 6"/>,
    tg:<path d="M21.5 4.5L2.5 11.8c-.8.3-.8 1.4.1 1.6l4.8 1.5 1.8 5.6c.2.7 1.1.9 1.6.3l2.6-2.7 4.9 3.6c.6.4 1.4.1 1.6-.6L23 5.6c.2-.9-.7-1.5-1.5-1.1z"/>,
    menu:<path d="M3 6h18M3 12h18M3 18h18"/>,
    lock:<g><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></g>,
    mail:<g><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/></g>,
    bolt:<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>,
    shield:<g><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></g>,
    infinity:<path d="M6 9a3 3 0 1 0 0 6c2 0 3-1.5 6-3s4-3 6-3a3 3 0 1 1 0 6c-2 0-3-1.5-6-3S8 9 6 9z"/>,
    x:<path d="M4 4l16 16M20 4L4 20"/>,
    yt:<g><rect x="2.5" y="6" width="19" height="12" rx="3.5"/><path d="M10 9l5 3-5 3z"/></g>,
    ig:<g><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1"/></g>,
    dc:<g><path d="M8 12a1 1 0 1 0 .01 0M16 12a1 1 0 1 0 .01 0"/><path d="M7 18l-1 3s-3-1.5-4-4c0-4 1-8 2.5-10C6 6 8 5.5 8 5.5L9 7h6l1-1.5s2 .5 3.5 1.5C21 9 22 13 22 17c-1 2.5-4 4-4 4l-1-3"/></g>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{p[n]}</svg>;
}

function Star({ s = 16, c = "#c2a93f" }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M12 2l2.4 6.4L21 9l-5 4.2L17.4 21 12 17.3 6.6 21 8 13.2 3 9l6.6-.6z"/>
  </svg>;
}

window.HBX = window.HBX || {};
window.HBX.Ic = Ic;
window.HBX.Star = Star;
