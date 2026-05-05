// Reusable bits — header, status, masthead, archive parts, side panels.

const AsciiRule = ({ label, char = "─" }) => {
  // Renders a horizontal box-drawing rule with an inline label
  const segments = label
    ? [char.repeat(6), `[ ${label} ]`, char.repeat(80)]
    : [char.repeat(120)];
  return (
    <div className="ascii-rule" aria-hidden="true">
      {segments[0]}
      {label && <span className="label">{segments[1]}</span>}
      {segments[2] || ""}
    </div>
  );
};

const TopBar = ({ theme, onToggleTheme }) => (
  <header className="topbar">
    <div className="frame topbar-inner">
      <a className="brand" href="#">
        <span className="brand-mark" aria-hidden="true"></span>
        <span className="brand-name">Security Forge</span>
        <span className="brand-slash">/</span>
        <span className="brand-tag">Artur · researcher</span>
      </a>
      <nav className="topnav" aria-label="primary">
        <a href="#" className="active">archive</a>
        <a href="#">research</a>
        <a href="#">CVEs</a>
        <a href="#">notes</a>
        <a href="#">about</a>
      </nav>
      <div className="topright">
        <span>press <span className="kbd">/</span> to search</span>
        <button className="theme-toggle" onClick={onToggleTheme} aria-label="toggle theme">
          {theme === "dark" ? "◐ dark" : "◑ light"}
        </button>
      </div>
    </div>
  </header>
);

const StatusStrip = () => (
  <div className="status-strip">
    <div className="frame status-inner">
      <span className="status-cell"><span className="dot"></span><span className="lab">node</span><span className="val">forge-01</span></span>
      <span className="status-cell"><span className="lab">build</span><span className="val">2026.04.30 · a1f3c92</span></span>
      <span className="status-cell"><span className="lab">posts</span><span className="val">{window.POSTS.length}</span></span>
      <span className="status-cell"><span className="lab">CVEs</span><span className="val">14 disclosed</span></span>
      <span className="status-cell"><span className="lab">last write</span><span className="val">2d ago</span></span>
      <span className="status-cell"><span className="lab">tz</span><span className="val">EET (UTC+02)</span></span>
      <span className="status-cell" style={{marginLeft:"auto"}}><span className="lab">RSS</span><span className="val">/feed.xml</span></span>
    </div>
  </div>
);

const Masthead = () => (
  <section className="frame masthead">
    <div>
      <h1>
        <span className="title-line"><span className="prompt">&gt;_</span>Security<span className="accent">Forge</span></span>
        <span className="row2 sub">Cybersecurity <span className="pipe">|</span> Pentesting <span className="pipe">|</span> Vulnerability Research<span className="caret"></span></span>
      </h1>
      <p className="lede">
        <strong>Security Forge</strong> is the working notebook of <strong>Artur</strong> — a
        cybersecurity researcher writing about web pentesting, Active Directory abuse,
        network analysis, and the occasional quiet CVE. Long-form posts, reproducible PoCs,
        no marketing copy.
      </p>
    </div>
    <div className="maststats" aria-label="stats">
      <div><div className="k">posts</div><div className="v">{window.POSTS.length}<small>longform</small></div></div>
      <div><div className="k">cves</div><div className="v">14<small>disclosed</small></div></div>
      <div><div className="k">since</div><div className="v">2021<small>writing</small></div></div>
      <div><div className="k">words</div><div className="v">186k<small>this archive</small></div></div>
    </div>
  </section>
);

const FeaturedDiagram = () => (
  // A simple, on-brand diagram: user → guardrail → LLM → tool → fulfillment, with an injection arc
  <svg viewBox="0 0 480 220" fill="none" stroke="currentColor" style={{color:"var(--ink-mute)"}}>
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0 0 L10 5 L0 10 z" fill="currentColor" stroke="none"/>
      </marker>
      <marker id="arrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--accent)" stroke="none"/>
      </marker>
    </defs>
    {/* nodes */}
    {[
      { x: 20,  y: 90, w: 80, h: 40, l: "user" },
      { x: 130, y: 90, w: 80, h: 40, l: "guardrail" },
      { x: 240, y: 90, w: 80, h: 40, l: "LLM" },
      { x: 350, y: 90, w: 110, h: 40, l: "tool: price()" },
    ].map((n, i) => (
      <g key={i}>
        <rect x={n.x} y={n.y} width={n.w} height={n.h} stroke="currentColor" fill="none"/>
        <text x={n.x + n.w/2} y={n.y + n.h/2 + 4} fontFamily="JetBrains Mono, monospace" fontSize="11" textAnchor="middle" fill="currentColor" stroke="none">{n.l}</text>
      </g>
    ))}
    {/* main arrows */}
    <line x1="100" y1="110" x2="130" y2="110" stroke="currentColor" markerEnd="url(#arr)"/>
    <line x1="210" y1="110" x2="240" y2="110" stroke="currentColor" markerEnd="url(#arr)"/>
    <line x1="320" y1="110" x2="350" y2="110" stroke="currentColor" markerEnd="url(#arr)"/>
    {/* injection arc */}
    <path d="M60 90 C 60 30, 280 30, 280 90" fill="none" stroke="var(--accent)" strokeDasharray="4 3" markerEnd="url(#arrA)"/>
    <text x="170" y="34" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--accent)" stroke="none" textAnchor="middle">indirect prompt injection</text>
    {/* output line */}
    <text x="395" y="160" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="currentColor" stroke="none" textAnchor="middle">→ $1.00</text>
    <line x1="395" y1="135" x2="395" y2="150" stroke="var(--accent)" strokeDasharray="2 2"/>
    {/* legend dots */}
    <circle cx="20" cy="200" r="3" fill="var(--accent)" stroke="none"/>
    <text x="30" y="204" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="currentColor" stroke="none">attacker path</text>
    <circle cx="130" cy="200" r="3" fill="currentColor" stroke="none"/>
    <text x="140" y="204" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="currentColor" stroke="none">expected path</text>
  </svg>
);

const Sev = ({ s }) => (
  <span className="sev" data-s={s}><span className="sq" aria-hidden="true"></span>{s}</span>
);

const Featured = ({ post }) => (
  <article className="featured">
    <div className="featured-diagram"><FeaturedDiagram/></div>
    <div className="featured-body">
      <div className="meta">
        <Sev s={post.sev}/>
        <span>{post.date}</span>
        <span>· {post.read}</span>
        <span>· #{post.tag}</span>
      </div>
      <h2><a href="#">{post.title}</a></h2>
      <p className="summary">{post.summary}</p>
      <div className="tags">
        {(post.tags || []).map(t => <span className="chip" key={t}>#{t}</span>)}
      </div>
    </div>
  </article>
);

const SearchBar = ({ q, setQ }) => (
  <div className="searchbar" role="search">
    <span className="pfx">~/$</span>
    <input
      placeholder="grep posts — try: prompt injection, kerberos, quic…"
      value={q}
      onChange={e => setQ(e.target.value)}
      aria-label="search posts"
    />
    <span className="sfx"><span className="kbd">/</span> focus · <span className="kbd">esc</span> clear</span>
  </div>
);

const FilterBar = ({ active, setActive, counts }) => (
  <div className="filterbar" role="tablist" aria-label="tags">
    {window.TAGS.map(t => (
      <button
        key={t.id}
        className={"chip" + (active === t.id ? " on" : "")}
        onClick={() => setActive(t.id)}
        role="tab"
        aria-selected={active === t.id}
      >
        {t.label}
        <span className="ct">{counts[t.id] ?? 0}</span>
      </button>
    ))}
  </div>
);

const ArchiveRow = ({ p }) => (
  <a className="row" href="#" tabIndex={0}>
    <span className="date">{p.date}</span>
    <span className="sev" data-s={p.sev} title={p.sev}><span className="sq" aria-hidden="true"></span></span>
    <span className="titlewrap">
      <span className="title">{p.title}</span>
      <span className="inlinetag">#{p.tag}</span>
    </span>
    <span className="read">{p.read} →</span>
  </a>
);

const Archive = ({ posts }) => {
  const byYear = posts.reduce((acc, p) => {
    (acc[p.year] = acc[p.year] || []).push(p);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a,b) => b - a);

  if (posts.length === 0) {
    return (
      <div style={{padding:"40px 0", textAlign:"center", color:"var(--ink-mute)", fontSize:13}}>
        <div style={{fontSize:11, letterSpacing:"0.16em", color:"var(--ink-dim)", marginBottom:6}}>0 RESULTS</div>
        no posts match those filters · <button onClick={() => location.reload()} style={{color:"var(--accent)", textDecoration:"underline"}}>reset</button>
      </div>
    );
  }

  return (
    <div className="archive">
      {years.map(y => (
        <div key={y}>
          <div className="year-head">
            <div className="y">{y}<small>· {byYear[y].length} posts</small></div>
            <div className="summary-line">
              {byYear[y].filter(p => p.sev === "critical").length} critical ·{" "}
              {byYear[y].filter(p => p.sev === "high").length} high ·{" "}
              {[...new Set(byYear[y].map(p => p.tag))].length} topics
            </div>
          </div>
          {byYear[y].map(p => <ArchiveRow key={p.id} p={p}/>)}
        </div>
      ))}
    </div>
  );
};

const PanelHead = ({ title, right }) => (
  <div className="panel-head">
    <span>{title}</span>
    <span className="dotrow"><span></span><span></span><span></span></span>
  </div>
);

const AboutPanel = () => (
  <section className="panel">
    <PanelHead title="// about" />
    <div className="panel-body about">
      <p>
        I'm <strong>Artur</strong>. I find bugs in things that aren't supposed to have bugs,
        write about them, and occasionally help fix them. Independent, no affiliations on this site.
      </p>
      <ul>
        <li><span className="k">focus</span><span className="v">web · ad · llm</span></li>
        <li><span className="k">cves</span><span className="v">14 (since '21)</span></li>
        <li><span className="k">github</span><span className="v"><a href="#">@r3so1ve</a></span></li>
        <li><span className="k">contact</span><span className="v"><a href="#">artur [at] forge.is</a></span></li>
      </ul>
      <div className="fingerprint">
        <span className="label">PGP · 4096R</span>
        4F2C 8A1B 9D33 70EE 51C2<br/>
        6B0F A4D9 2237 8E11 BC04
      </div>
    </div>
  </section>
);

const ActivityPanel = () => (
  <section className="panel">
    <PanelHead title="// activity"/>
    <div className="panel-body">
      <div className="activity">
        {window.ACTIVITY.map((a, i) => (
          <div className="activity-row" key={i}>
            <span className="when">{a.when}</span>
            <span className="what">{a.what}{a.em && <em>{a.em}</em>}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const SeverityPanel = () => {
  const counts = window.SEVERITIES.map(s => ({
    s, n: window.POSTS.filter(p => p.sev === s).length
  }));
  const max = Math.max(...counts.map(c => c.n));
  return (
    <section className="panel">
      <PanelHead title="// severity index"/>
      <div className="panel-body">
        <div style={{display:"grid", gap:6}}>
          {counts.map(c => (
            <div key={c.s} style={{display:"grid", gridTemplateColumns:"70px 1fr 24px", gap:8, alignItems:"center", fontSize:11}}>
              <Sev s={c.s}/>
              <div style={{height:6, background:"var(--bg-soft)", border:"1px solid var(--line-soft)"}}>
                <div style={{
                  height:"100%",
                  width:`${(c.n/max)*100}%`,
                  background:`var(--${c.s === "critical" ? "crit" : c.s === "high" ? "high" : c.s === "medium" ? "med" : c.s === "low" ? "low" : "info"})`
                }}/>
              </div>
              <span style={{color:"var(--ink)", textAlign:"right", fontVariantNumeric:"tabular-nums"}}>{c.n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="frame footer">
    <div className="l">© 2021–2026 Security Forge · all writing CC BY 4.0</div>
    <div className="c">{`└──────[ end of file ]──────┘`}</div>
    <div className="r">
      <a href="#">github</a> · <a href="#">rss</a> · <a href="#">sitemap</a> · <a href="#">pgp</a>
    </div>
  </footer>
);

Object.assign(window, {
  TopBar, StatusStrip, Masthead, Featured, SearchBar, FilterBar, Archive,
  AboutPanel, ActivityPanel, SeverityPanel, Footer, AsciiRule, Sev,
});
