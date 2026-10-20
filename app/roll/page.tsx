"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { classes, randomIndex, iconPath, type Role } from "@/lib/classes";
import { ForeverCountdown } from "@/components/forever-countdown";

type Roll = {
  id: string;
  name: string;
  line: string;
  date: string;
  roles: Role[];
};
const STORAGE = "kcw-roll-v1",
  STEP = 104,
  TARGET = 44;
const initialReel = Array.from(
  { length: 17 },
  (_, i) => classes[i % classes.length],
);
function Icon({ name, size = 48 }: { name: string; size?: number }) {
  return (
    <img
      src={iconPath(name)}
      alt=""
      width={size}
      height={size}
      draggable={false}
    />
  );
}
function validRoll(value: unknown): value is Roll {
  if (!value || typeof value !== "object") return false;
  const r = value as Roll,
    c = classes.find((c) => c.name === r.name);
  return (
    !!c &&
    typeof r.id === "string" &&
    typeof r.line === "string" &&
    c.lines.includes(r.line) &&
    typeof r.date === "string" &&
    Number.isFinite(Date.parse(r.date)) &&
    Array.isArray(r.roles) &&
    r.roles.length > 0 &&
    r.roles.every((role) => c.roles.includes(role))
  );
}
export default function RollPage() {
  const [ready, setReady] = useState(false);
  const [history, setHistory] = useState<Roll[]>([]),
    [result, setResult] = useState<Roll | null>(null);
  const [busy, setBusy] = useState(false),
    [reel, setReel] = useState(initialReel);
  const [winner, setWinner] = useState<number | null>(null),
    [notice, setNotice] = useState("");
  const strip = useRef<HTMLDivElement>(null),
    lock = useRef(false),
    alive = useRef(true);
  const animation = useRef<Animation | null>(null);
  const pool = classes;
  useEffect(() => {
    alive.current = true;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || "null");
      if (saved && typeof saved === "object") {
        if (Array.isArray(saved.history))
          setHistory(
            saved.history
              .filter(validRoll)
              .slice(0, 10)
              .map(({ id, name, line, date, roles }: Roll) => ({
                id,
                name,
                line,
                date,
                roles,
              })),
          );
      }
    } catch {
      /* Unavailable or malformed storage uses defaults. */
    }
    setReady(true);
    return () => {
      alive.current = false;
      animation.current?.cancel();
    };
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(STORAGE, JSON.stringify({ history }));
      } catch {
        /* Persistence is optional. */
      }
  }, [ready, history]);
  async function spin() {
    if (lock.current || !strip.current) return;
    lock.current = true;
    setBusy(true);
    setResult(null);
    setNotice("");
    setWinner(null);
    try {
      const chosen = pool[randomIndex(pool.length)];
      const roll: Roll = {
        id: Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) =>
          value.toString(16).padStart(8, "0"),
        ).join(""),
        name: chosen.name,
        line: chosen.lines[randomIndex(chosen.lines.length)],
        date: new Date().toISOString(),
        roles: [...chosen.roles],
      };
      const items = Array.from(
        { length: TARGET + 8 },
        () => pool[randomIndex(pool.length)],
      );
      items[TARGET] = chosen;
      const node = strip.current;
      node.style.transform = "translateX(-416px)";
      setReel(items);
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      if (!alive.current) return;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches,
        end = -TARGET * STEP;
      // The reel origin tracks 50% of its viewport; resize cannot move the winner.
      animation.current = node.animate(
        [
          { transform: "translateX(-416px)" },
          { transform: `translateX(${end}px)` },
        ],
        {
          duration: reduced ? 1 : 4600,
          easing: "cubic-bezier(.12,.68,.12,1)",
          fill: "forwards",
        },
      );
      await animation.current.finished;
      node.style.transform = `translateX(${end}px)`;
      animation.current.cancel();
      if (!alive.current) return;
      setWinner(TARGET);
      animation.current = node.children[TARGET].animate(
        [{ scale: 1 }, { scale: 1.12 }, { scale: 1 }],
        { duration: reduced ? 1 : 420, easing: "ease-in-out" },
      );
      await animation.current.finished;
      if (!alive.current) return;
      setResult(roll);
      setHistory((old) => [roll, ...old].slice(0, 10));
    } catch {
      if (alive.current) setNotice("A pörgetés megszakadt. Próbáld újra.");
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <div className="roll-page">
      <header className="guild-header">
        <a className="guild-brand" href="https://kcw.hu" aria-label="Főoldal">
          <img
            className="guild-crest"
            src="/logo/kcw-crest.png"
            alt="Guildcímer"
            width="58"
            height="58"
          />
          <span className="header-label">WoW Forever</span>
        </a>
        <ForeverCountdown />
        <a
          className="discord-link"
          href="https://discord.gg/KhSjhDsrUS"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Csatlakozz a Discordhoz (új lapon nyílik)"
          title="Csatlakozz a Discordhoz"
        >
          <span className="discord-icon" aria-hidden="true" />
        </a>
      </header>
      <main>
        <section className="roll-hero" aria-labelledby="title">
          <h1 id="title">
            Keep Calm <span>&</span> Roll
          </h1>
          <p className="hero-question">Na milyen class legyek?</p>
          <div
            className="wheel"
            aria-label="Kasztsorsoló kerék"
            aria-busy={busy}
          >
            <span className="pointer" aria-hidden="true" />
            <div className="reel" ref={strip} aria-hidden="true">
              {reel.map((c, i) => (
                <div
                  key={i}
                  data-class={c.name}
                  data-winner={winner === i || undefined}
                  className={`reel-tile ${winner === i ? "winner" : ""}`}
                >
                  <Icon name={c.name} size={54} />
                  <span style={{ color: c.color }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="spin-button"
            onClick={spin}
            disabled={!ready || busy}
          >
            <RotateCw size={18} className={busy ? "spinning" : ""} />
            {busy ? "Pörög…" : "Pörgetés"}
          </button>
        </section>
        <div className="below-wheel">
          <div role="status" aria-live="polite" aria-atomic="true">
            {result && (
              <section className="result" aria-label="A sorsolás eredménye">
                <p className="eyebrow">Ma ezzel mész</p>
                <div className="result-class">
                  <Icon name={result.name} size={62} />
                  <div>
                    <h2
                      style={{
                        color: classes.find((c) => c.name === result.name)!
                          .color,
                      }}
                    >
                      {result.name}
                    </h2>
                    <p>{result.roles.join(" · ")}</p>
                  </div>
                </div>
                <p className="result-line">„{result.line}”</p>
              </section>
            )}
          </div>
          <p className="notice" role="status">
            {notice}
          </p>
          {history.length > 0 && (
            <section className="history">
              <div className="history-heading">
                <h2>Legutóbbi dobások</h2>
                <span>Utolsó {history.length}</span>
              </div>
              <ol>
                {history.map((r) => (
                  <li key={r.id}>
                    <Icon name={r.name} size={28} />
                    <strong
                      style={{
                        color: classes.find((c) => c.name === r.name)!.color,
                      }}
                    >
                      {r.name}
                    </strong>
                    <time dateTime={r.date}>
                      {new Date(r.date).toLocaleTimeString("hu-HU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </main>
      <footer>WoW Forever</footer>
    </div>
  );
}
