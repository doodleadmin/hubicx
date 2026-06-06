"use client";

import { COV, FEATURED, toText, tt } from "./prototypeData";
import { Badge, Token } from "./shared";

export default function Hero({ lang, openTask }: { lang: string; openTask: (id: string) => void }) {
  return <div><div className="hero-rail">{FEATURED.map((feature) => <div key={feature.id} className="hero-card">
    <img className="cov" src={COV(feature.cov)} alt="" />
    <div className="scrim" />
    <div className="inner"><div className="htop"><Badge kind="new" lang={lang} /><span className="hcost"><Token size={15} />{feature.cost}</span></div><div className="hbot"><div className="kick" style={{ color: feature.accent }}>{toText(feature.kicker, lang)}</div><h2>{toText(feature.title, lang)}</h2><p>{toText(feature.desc, lang)}</p><button className="htry" onClick={() => openTask(feature.task)}>{tt(lang, "Try", "Попробовать")} {feature.name}<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0b0c0f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button></div></div>
  </div>)}</div><div className="dots"><i className="on" /><i /><i /></div></div>;
}
