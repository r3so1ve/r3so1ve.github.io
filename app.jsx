// Main app — wires everything together with state for theme, search, filter.

const { useState, useMemo, useEffect, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accentHue": 0,
  "density": "default",
  "width": "default"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState("all");

  // apply theme/density/width/accent to <html>
  useEffect(() => {
    const r = document.documentElement;
    r.dataset.theme = tweaks.theme;
    r.dataset.density = tweaks.density;
    r.dataset.width = tweaks.width;
    // Override accent only when user moves slider away from default red (0)
    if (tweaks.accentHue !== 0) {
      const lc = tweaks.theme === "dark" ? "0.62 0.22" : "0.50 0.20";
      r.style.setProperty("--accent", `oklch(${lc} ${tweaks.accentHue})`);
      r.style.setProperty("--accent-soft", `oklch(${lc} ${tweaks.accentHue} / 0.16)`);
      r.style.setProperty("--accent-line", `oklch(${lc} ${tweaks.accentHue} / 0.50)`);
    } else {
      r.style.removeProperty("--accent");
      r.style.removeProperty("--accent-soft");
      r.style.removeProperty("--accent-line");
    }
  }, [tweaks]);

  const toggleTheme = useCallback(() => {
    setTweak("theme", tweaks.theme === "dark" ? "light" : "dark");
  }, [tweaks.theme, setTweak]);

  // keyboard: '/' focuses search, 't' toggles theme
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "/" && !typing) {
        e.preventDefault();
        const el = document.querySelector(".searchbar input");
        el && el.focus();
      } else if (e.key === "Escape" && typing) {
        e.target.blur();
        setQ("");
      } else if (e.key === "t" && !typing) {
        toggleTheme();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleTheme]);

  const featured = window.POSTS.find(p => p.featured);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return window.POSTS
      .filter(p => !p.featured || ql || activeTag !== "all") // only hide featured when no search/filter
      .filter(p => activeTag === "all" || p.tag === activeTag)
      .filter(p => !ql || (
        p.title.toLowerCase().includes(ql) ||
        p.summary.toLowerCase().includes(ql) ||
        p.tag.toLowerCase().includes(ql) ||
        p.sev.toLowerCase().includes(ql)
      ))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [q, activeTag]);

  const counts = useMemo(() => {
    const c = { all: window.POSTS.length };
    for (const t of window.TAGS) {
      if (t.id === "all") continue;
      c[t.id] = window.POSTS.filter(p => p.tag === t.id).length;
    }
    return c;
  }, []);

  return (
    <>
      <span className="reg tl" aria-hidden="true"/>
      <span className="reg tr" aria-hidden="true"/>
      <span className="reg bl" aria-hidden="true"/>
      <span className="reg br" aria-hidden="true"/>

      <window.TopBar theme={tweaks.theme} onToggleTheme={toggleTheme}/>
      <window.StatusStrip/>
      <window.Masthead/>

      <main className="frame">
        <div className="main-grid">
          <div>
            {/* featured */}
            {featured && !q && activeTag === "all" && (
              <>
                <window.AsciiRule label="featured · pinned"/>
                <window.Featured post={featured}/>
              </>
            )}

            {/* search & filter */}
            <window.AsciiRule label="archive · grep & filter"/>
            <window.SearchBar q={q} setQ={setQ}/>
            <window.FilterBar active={activeTag} setActive={setActiveTag} counts={counts}/>

            <div className="section-head">
              <h3>// posts ({filtered.length})</h3>
              <span className="right">sorted: date desc</span>
            </div>

            <window.Archive posts={filtered}/>

            <div style={{
              marginTop: 24, padding: "14px 16px",
              border: "1px dashed var(--line)",
              fontSize: 11, color: "var(--ink-mute)",
              display: "flex", justifyContent: "space-between"
            }}>
              <span>EOF · showing {filtered.length} of {window.POSTS.length} posts</span>
              <span>↑ <a href="#" style={{borderBottom:"1px dotted var(--ink-dim)"}}>back to top</a></span>
            </div>
          </div>

          <aside className="side">
            <window.AboutPanel/>
            <window.ActivityPanel/>
            <window.SeverityPanel/>
          </aside>
        </div>
      </main>

      <window.Footer/>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Theme">
          <TweakRadio
            label="mode"
            value={tweaks.theme}
            onChange={v => setTweak("theme", v)}
            options={[{value:"dark", label:"dark"},{value:"light", label:"light"}]}
          />
          <TweakSlider
            label="accent hue"
            value={tweaks.accentHue} min={0} max={360} step={5}
            onChange={v => setTweak("accentHue", v)}
            suffix="°"
          />
        </TweakSection>
        <TweakSection title="Layout">
          <TweakRadio
            label="density"
            value={tweaks.density}
            onChange={v => setTweak("density", v)}
            options={[
              {value:"compact", label:"compact"},
              {value:"default", label:"default"},
              {value:"roomy", label:"roomy"},
            ]}
          />
          <TweakRadio
            label="width"
            value={tweaks.width}
            onChange={v => setTweak("width", v)}
            options={[
              {value:"narrow", label:"narrow"},
              {value:"default", label:"default"},
              {value:"wide", label:"wide"},
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
