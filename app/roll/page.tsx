"use client";
import { useEffect, useRef, useState } from "react";
import { Copy, Download, RotateCw, Volume2, VolumeX, Zap } from "lucide-react";
import { classes, randomIndex, iconPath, type Role } from "@/lib/classes";

type Roll = {
  id: string;
  name: string;
  player: string;
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
    typeof r.player === "string" &&
    r.player.length <= 40 &&
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
  const [player, setPlayer] = useState("");
  const [sound, setSound] = useState(false),
    [fast, setFast] = useState(false),
    [ready, setReady] = useState(false);
  const [history, setHistory] = useState<Roll[]>([]),
    [result, setResult] = useState<Roll | null>(null);
  const [busy, setBusy] = useState(false),
    [reel, setReel] = useState(initialReel);
  const [winner, setWinner] = useState<number | null>(null),
    [notice, setNotice] = useState("");
  const strip = useRef<HTMLDivElement>(null),
    lock = useRef(false),
    alive = useRef(true);
  const animation = useRef<Animation | null>(null),
    audio = useRef<AudioContext | null>(null);
  const pool = classes;
  useEffect(() => {
    alive.current = true;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || "null");
      if (saved && typeof saved === "object") {
        if (typeof saved.player === "string")
          setPlayer(saved.player.slice(0, 40));
        if (typeof saved.sound === "boolean") setSound(saved.sound);
        if (typeof saved.fast === "boolean") setFast(saved.fast);
        if (Array.isArray(saved.history))
          setHistory(saved.history.filter(validRoll).slice(0, 10));
      }
    } catch {
      /* Unavailable or malformed storage uses defaults. */
    }
    setReady(true);
    return () => {
      alive.current = false;
      animation.current?.cancel();
      void audio.current?.close();
    };
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(
          STORAGE,
          JSON.stringify({ player, sound, fast, history }),
        );
      } catch {
        /* Persistence is optional. */
      }
  }, [ready, player, sound, fast, history]);
  async function spin() {
    if (lock.current || !strip.current) return;
    lock.current = true;
    setBusy(true);
    setResult(null);
    setNotice("");
    setWinner(null);
    const chosen = pool[randomIndex(pool.length)];
    const roll: Roll = {
      id: crypto.randomUUID(),
      name: chosen.name,
      player: player.trim(),
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
    try {
      if (sound)
        try {
          audio.current ??= new AudioContext();
          await audio.current.resume();
        } catch {
          /* Sound never blocks a roll. */
        }
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
          duration: reduced ? 1 : fast ? 1400 : 4600,
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
      if (sound && audio.current?.state === "running") {
        const oscillator = audio.current.createOscillator(),
          gain = audio.current.createGain();
        oscillator.connect(gain);
        gain.connect(audio.current.destination);
        oscillator.frequency.setValueAtTime(660, audio.current.currentTime);
        gain.gain.setValueAtTime(0.055, audio.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audio.current.currentTime + 0.22,
        );
        oscillator.start();
        oscillator.stop(audio.current.currentTime + 0.23);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
      }
      setResult(roll);
      setHistory((old) => [roll, ...old].slice(0, 10));
    } catch {
      if (alive.current) setNotice("A pörgetés megszakadt. Próbáld újra.");
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(
        `${result.player ? `${result.player}: ` : ""}${result.name} · ${result.roles.join(" / ")} — ${result.line} | Keep Calm & Roll · https://kcw.hu/roll`,
      );
      setNotice("Eredmény másolva. Mehet Discordra.");
    } catch {
      setNotice(
        "A másolás nem sikerült. A böngésző nem engedi a vágólap elérését.",
      );
    }
  }
  async function savePng() {
    if (!result) return;
    const c = classes.find((c) => c.name === result.name)!;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d")!;
      const image = new Image();
      image.src = iconPath(result.name);
      await image.decode();
      ctx.fillStyle = "#0b1423";
      ctx.fillRect(0, 0, 1200, 630);
      ctx.textAlign = "center";
      ctx.fillStyle = "#b9a16b";
      ctx.font = "22px Arial";
      ctx.fillText("WOW FOREVER", 600, 66);
      ctx.fillStyle = "#ede9df";
      ctx.font = "38px Georgia";
      ctx.fillText("Keep Calm & Roll", 600, 125);
      ctx.drawImage(image, 552, 165, 96, 96);
      ctx.fillStyle = c.color;
      ctx.font = "bold 54px Arial";
      ctx.fillText(result.name, 600, 330);
      ctx.fillStyle = "#a9b3c4";
      ctx.font = "23px Arial";
      ctx.fillText(result.roles.join(" · "), 600, 375);
      ctx.font = "25px Arial";
      ctx.fillStyle = "#ede9df";
      ctx.fillText(result.line, 600, 445, 1080);
      ctx.font = "20px Arial";
      ctx.fillStyle = "#a9b3c4";
      ctx.fillText(result.player, 600, 495, 1080);
      ctx.font = "18px Arial";
      ctx.fillText(
        `kcw.hu/roll · ${new Date(result.date).toLocaleString("hu-HU")}`,
        600,
        575,
      );
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("PNG");
      const url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = `kcw-roll-${result.name.toLowerCase()}-${result.id}.png`;
      link.click();
      requestAnimationFrame(() => URL.revokeObjectURL(url));
      setNotice("A PNG elkészült.");
    } catch {
      setNotice("A képet nem sikerült menteni. Próbáld újra.");
    }
  }
  return (
    <div className="roll-page">
      <header className="guild-header">
        <a href="https://kcw.hu" aria-label="Főoldal">
          <img
            className="guild-crest"
            src="/logo/kcw-crest.png"
            alt="Guildcímer"
            width="58"
            height="58"
          />
          <span className="header-label">WoW Forever</span>
        </a>
        <span className="header-tag">/ roll</span>
      </header>
      <main>
        <section className="roll-hero" aria-labelledby="title">
          <h1 id="title">
            Keep Calm <span>&</span> Roll
          </h1>
          <p className="hero-question">Ma mivel menjek?</p>
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
          <p className="pool-note">{pool.length} kaszt · egyenlő esélyek</p>
          <div className="spin-options">
            <button
              aria-pressed={sound}
              disabled={busy}
              onClick={() => setSound(!sound)}
            >
              {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}Hang{" "}
              {sound ? "be" : "ki"}
            </button>
            <span aria-hidden="true">·</span>
            <button
              aria-pressed={fast}
              disabled={busy}
              onClick={() => setFast(!fast)}
            >
              <Zap size={16} />
              Gyors pörgetés {fast ? "be" : "ki"}
            </button>
          </div>
        </section>
        <div className="below-wheel">
          <label className="player-field">
            <span>
              Játékosnév <small>nem kötelező</small>
            </span>
            <input
              value={player}
              disabled={busy}
              onChange={(e) => setPlayer(e.target.value)}
              placeholder="Ahogy a guildben ismernek"
              maxLength={40}
              autoComplete="nickname"
            />
          </label>
          <div role="status" aria-live="polite" aria-atomic="true">
            {result && (
              <section className="result" aria-label="A sorsolás eredménye">
                <p className="eyebrow">
                  {result.player
                    ? `${result.player}, ma ezzel mész`
                    : "Ma ezzel mész"}
                </p>
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
                <div className="result-actions">
                  <button onClick={copyResult}>
                    <Copy size={16} />
                    Másolás Discordra
                  </button>
                  <button onClick={savePng}>
                    <Download size={16} />
                    PNG mentése
                  </button>
                </div>
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
                    <span className="history-player">
                      {r.player || "Névtelen"}
                    </span>
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
