import type { GuideUi } from "@/lib/guide-text";

type Props = { ui: GuideUi; webUrl: string; androidUrl: string; useWeb: string; androidDownload: string; body?: string };

/** Large app promotion card used on guide pages: the main conversion point. */
export function AppCta({ ui, webUrl, androidUrl, useWeb, androidDownload, body }: Props) {
  return (
    <aside className="g-cta" aria-labelledby="g-cta-title">
      <div className="g-cta-text">
        <p className="g-cta-kicker"><span className="g-live-dot" aria-hidden="true" />{ui.ctaKicker}</p>
        <h2 id="g-cta-title" className="g-cta-title">{ui.ctaTitle}</h2>
        <p className="g-cta-body">{body ?? ui.ctaBody}</p>
        <ul className="g-cta-points">
          {ui.ctaPoints.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>
      <div className="g-cta-actions">
        <a className="g-btn-big" href={webUrl}>
          {useWeb}
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
        <a className="g-btn-ghost" href={androidUrl}>{androidDownload}</a>
        <p className="g-cta-free">{ui.ctaFree}</p>
      </div>
    </aside>
  );
}

/** Slim bar pinned to the bottom of the screen on phones; always visible, never covers content. */
export function StickyAppBar({ text, webUrl, useWeb }: { text: string; webUrl: string; useWeb: string }) {
  return (
    <div className="g-sticky">
      <span className="g-sticky-text"><span className="g-live-dot" aria-hidden="true" />{text}</span>
      <a className="g-sticky-btn" href={webUrl}>{useWeb}</a>
    </div>
  );
}
