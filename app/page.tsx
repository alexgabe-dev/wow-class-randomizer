"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion"
import { Check, ChevronDown, Copy, Dices, Heart, RotateCcw, Shield, Sword, Volume2, VolumeX, Zap, Download } from "lucide-react"

type Role = "Tank" | "Healer" | "Melee DPS" | "Ranged DPS"
type WowClass = {
  name: string
  color: string
  roles: Role[]
  lines: string[]
}
type Roll = { name: string; player?: string; at: number }

const classes: WowClass[] = [
  { name: "Warrior", color: "#C79C6E", roles: ["Tank", "Melee DPS"], lines: ["A healer manája közös erőforrás.", "Még egy pack belefér.", "A threat meter csak egy javaslat."] },
  { name: "Paladin", color: "#F58CBA", roles: ["Tank", "Healer", "Melee DPS"], lines: ["A hearthstone már be van készítve.", "A blessinget majd újrakéred.", "A wipe után valaki úgyis megkérdezi, miért nem BoP-oltál."] },
  { name: "Hunter", color: "#ABD473", roles: ["Ranged DPS"], lines: ["A pet már pullolt.", "Feign Death. A többi a csapat dolga.", "A pet growlja ki van kapcsolva. Ugye?"] },
  { name: "Rogue", color: "#FFF569", roles: ["Melee DPS"], lines: ["A wipe-ot túlélted. Gyanús.", "Vanish. Szóljatok, ha jöhetek.", "A chestet már kiszúrtad."] },
  { name: "Priest", color: "#E9E5DC", roles: ["Healer", "Ranged DPS"], lines: ["OOM. De azért pulloljatok.", "LoS mögé nem ér el a heal.", "Mostantól minden halál a te hibád."] },
  { name: "Shaman", color: "#0070DE", roles: ["Healer", "Melee DPS", "Ranged DPS"], lines: ["A totemeket majd visszaszedjük.", "Windfury proccolt. Most már nincs megállás.", "Totem le, aztán mehet a pull."] },
  { name: "Mage", color: "#69CCF0", roles: ["Ranged DPS"], lines: ["Gratulálunk. Vizet kérünk.", "Portál van. Apró nincs.", "A sheepet majd valaki úgyis megüti."] },
  { name: "Warlock", color: "#9482C9", roles: ["Ranged DPS"], lines: ["Summon van?", "A shardot te farmolod, a summon mindenkinek jár.", "A healthstone még mindig a bagben van."] },
  { name: "Druid", color: "#FF7D0A", roles: ["Tank", "Healer", "Melee DPS", "Ranged DPS"], lines: ["Tudsz tankolni? És healelni? És innervate?", "A battle rez most jól jönne.", "Innervate a healerre. Most kivételesen."] },
]
const roleOptions: Role[] = ["Tank", "Healer", "Melee DPS", "Ranged DPS"]
const HISTORY_KEY = "kcw-roll-history-v1"
const SLOT = 104
const WIN_INDEX = 34

function iconPath(name: string) {
  return `/class_icons/ClassIcon_${name.toLowerCase()}.webp`
}

function ClassIcon({ name, size = 42 }: { name: string; size?: number }) {
  return <img src={iconPath(name)} alt="" width={size} height={size} className="class-icon" draggable={false} />
}

export default function WoWClassRandomizer() {
  const [pool, setPool] = useState<string[]>(classes.map(({ name }) => name))
  const [roles, setRoles] = useState<Role[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [rolling, setRolling] = useState(false)
  const [zoomWinner, setZoomWinner] = useState(false)
  const [rollItems, setRollItems] = useState<WowClass[]>([])
  const [winnerIndex, setWinnerIndex] = useState(WIN_INDEX)
  const [winner, setWinner] = useState<WowClass | null>(null)
  const [line, setLine] = useState("")
  const [player, setPlayer] = useState("")
  const [history, setHistory] = useState<Roll[]>([])
  const [sound, setSound] = useState(false)
  const [fast, setFast] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const rollingRef = useRef(false)
  const offset = useMotionValue(0)
  const reduceMotion = useReducedMotion()

  const eligibleClasses = useMemo(() => classes.filter((item) => {
    const included = pool.includes(item.name)
    const matchesRole = roles.length === 0 || roles.some((role) => item.roles.includes(role))
    return included && matchesRole
  }), [pool, roles])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (Array.isArray(parsed)) setHistory(parsed.filter((item): item is Roll => typeof item?.name === "string").slice(0, 10))
      }
      const savedPlayer = localStorage.getItem("kcw-roll-player")
      if (savedPlayer) setPlayer(savedPlayer)
      setSound(localStorage.getItem("kcw-roll-sound") === "true")
      setFast(localStorage.getItem("kcw-roll-fast") === "true")
    } catch {
      // Ignore invalid or unavailable local storage.
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)))
      localStorage.setItem("kcw-roll-player", player)
      localStorage.setItem("kcw-roll-sound", String(sound))
      localStorage.setItem("kcw-roll-fast", String(fast))
    } catch {
      // The wheel remains usable when browser storage is unavailable.
    }
  }, [history, player, sound, fast, mounted])

  const togglePoolClass = (name: string) => {
    setPool((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  }

  const toggleRole = (role: Role) => {
    setRoles((current) => current.includes(role) ? current.filter((item) => item !== role) : [...current, role])
  }

  const playTick = () => {
    if (!sound || typeof window === "undefined") return
    try {
      const AudioContextType = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextType) return
      const context = new AudioContextType()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = "sine"
      oscillator.frequency.value = 620
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.006)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.045)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.05)
      oscillator.onended = () => void context.close()
    } catch {
      // Audio is optional.
    }
  }

  const spin = async () => {
    if (rollingRef.current || eligibleClasses.length === 0 || !viewportRef.current) return
    rollingRef.current = true
    setRolling(true)
    setZoomWinner(false)
    setWinner(null)
    setLine("")
    setCopied(false)

    const selected = eligibleClasses[Math.floor(Math.random() * eligibleClasses.length)]
    const items = Array.from({ length: WIN_INDEX + 9 }, (_, index) => {
      if (index === WIN_INDEX) return selected
      return eligibleClasses[Math.floor(Math.random() * eligibleClasses.length)]
    })
    setRollItems(items)
    setWinnerIndex(WIN_INDEX)

    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    const viewportWidth = viewportRef.current?.clientWidth ?? 600
    const finalX = viewportWidth / 2 - (WIN_INDEX * SLOT + (SLOT - 12) / 2)
    const startX = viewportWidth / 2 - (2 * SLOT + (SLOT - 12) / 2)
    offset.set(startX)
    const duration = reduceMotion ? 0.2 : fast ? 1.7 : 3.8
    const controls = animate(offset, [startX, finalX + 28, finalX], {
      duration,
      times: [0, 0.82, 1],
      ease: [0.08, 0.72, 0.16, 1],
      onUpdate: (latest) => {
        if (Math.abs(latest - (offset.getPrevious() ?? latest)) > 12) playTick()
      },
    })
    await controls.finished
    setZoomWinner(true)
    setWinner(selected)
    const quote = selected.lines[Math.floor(Math.random() * selected.lines.length)]
    setLine(quote)
    const record: Roll = { name: selected.name, player: player.trim() || undefined, at: Date.now() }
    setHistory((current) => [record, ...current].slice(0, 10))
    // A small settle-in zoom puts the focus on the selected class.
    await new Promise<void>((resolve) => window.setTimeout(resolve, reduceMotion ? 0 : 420))
    setRolling(false)
    setZoomWinner(false)
    rollingRef.current = false
  }

  const copyResult = async () => {
    if (!winner) return
    const text = ["Keep Calm & Roll", `${player.trim() ? `${player.trim()} → ` : ""}${winner.name}`, `„${line}”`, "Keep Calm and Wipe · WoW Forever"].join("\n")
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      const area = document.createElement("textarea")
      area.value = text
      area.style.position = "fixed"
      area.style.opacity = "0"
      document.body.append(area)
      area.select()
      document.execCommand("copy")
      area.remove()
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  const downloadCard = async () => {
    if (!winner) return
    const canvas = document.createElement("canvas")
    canvas.width = 1200
    canvas.height = 630
    const context = canvas.getContext("2d")
    if (!context) return
    context.fillStyle = "#071321"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "#c4a461"
    context.fillRect(88, 86, 5, 458)
    context.fillStyle = "#e9e5dc"
    context.font = "600 28px Arial"
    context.fillText("KEEP CALM AND WIPE", 128, 130)
    context.fillStyle = winner.color
    context.font = "700 82px Georgia"
    context.fillText(winner.name, 128, 280)
    context.fillStyle = "#e9e5dc"
    context.font = "32px Arial"
    context.fillText(line, 128, 350, 980)
    context.fillStyle = "#8f9aaa"
    context.font = "24px Arial"
    context.fillText(`${player.trim() ? `${player.trim()}  ·  ` : ""}WoW Forever`, 128, 490)
    const icon = new Image()
    icon.src = iconPath(winner.name)
    await new Promise<void>((resolve) => { icon.onload = () => resolve(); icon.onerror = () => resolve() })
    if (icon.complete && icon.naturalWidth) context.drawImage(icon, 985, 116, 120, 120)
    const link = document.createElement("a")
    link.download = `keep-calm-roll-${winner.name.toLowerCase()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const selectHistorical = (roll: Roll) => {
    const nextWinner = classes.find((item) => item.name === roll.name)
    if (nextWinner) {
      setWinner(nextWinner)
      setPlayer(roll.player ?? "")
      setLine(nextWinner.lines[0])
    }
  }

  return (
    <main className="kcw-page">
      <div className="kcw-shell">
        <header className="kcw-header">
          <a href="/" className="brand" aria-label="Keep Calm and Wipe – főoldal">
            <img src="/logo/kcw-crest.png" alt="" width="48" height="48" />
            <span><strong>Keep Calm and Wipe</strong><small>WoW Forever · Alliance</small></span>
          </a>
          <span className="guild-note">A döntés a tiéd. A wipe közös.</span>
        </header>

        <section className="roll-intro" aria-labelledby="page-title">
          <h1 id="page-title">Keep Calm <span>&amp;</span> Roll</h1>
          <p>Ma mivel menjek?</p>
        </section>

        <section className="roll-section" aria-label="Kaszt sorsolása">
          <div className="roll-viewport" ref={viewportRef}>
            <div className="roll-pointer" aria-hidden="true" />
            <motion.div className={`roll-track ${rollItems.length ? "roll-track-moving" : "roll-track-idle"}`} style={{ x: offset }}>
              {(rollItems.length ? rollItems : classes).map((item, index) => (
                <motion.div
                  key={`${item.name}-${index}`}
                  className={`roll-item ${winnerIndex === index && rolling ? "roll-item-winner" : ""}`}
                  animate={winnerIndex === index && zoomWinner ? { scale: [1, 1.08, 1.13] } : { scale: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <ClassIcon name={item.name} size={44} />
                  <span>{item.name}</span>
                </motion.div>
              ))}
            </motion.div>
            <div className="roll-fade roll-fade-left" />
            <div className="roll-fade roll-fade-right" />
          </div>

          <button className="roll-button" onClick={spin} disabled={rolling || eligibleClasses.length === 0}>
            {rolling ? <RotateCcw size={18} className="spin-icon" /> : <Dices size={18} />}
            {rolling ? "Dobás folyamatban…" : winner ? "Még egy dobás" : "Pörgetés"}
          </button>
          {eligibleClasses.length === 0 && <p className="pool-warning">Minden kaszt kiesett. Nyisd le a beállításokat, és tegyél vissza legalább egyet.</p>}
          {winner && !rolling && (
            <motion.section className="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} aria-live="polite">
              <div className="result-main">
                <ClassIcon name={winner.name} size={52} />
                <div><span className="result-kicker">{player.trim() ? `${player.trim()} következő altja` : "A következő alt"}</span><h2 style={{ color: winner.color }}>{winner.name}</h2><p>„{line}”</p></div>
              </div>
              <div className="result-actions">
                <button className="quiet-button" onClick={copyResult}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Másolva" : "Discordra másolás"}</button>
                <button className="quiet-button" onClick={downloadCard}><Download size={16} />Kártya mentése</button>
              </div>
            </motion.section>
          )}
        </section>

        <section className="pool-section">
          <button className="pool-toggle" aria-expanded={settingsOpen} onClick={() => setSettingsOpen((value) => !value)}>
            <span><strong>Miből sorsoljunk?</strong><small>{eligibleClasses.length} kaszt van a poolban</small></span>
            <ChevronDown size={19} className={settingsOpen ? "chevron-open" : ""} />
          </button>
          <AnimatePresence initial={false}>
            {settingsOpen && (
              <motion.div className="pool-content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: "easeInOut" }}>
                <div className="role-filters" aria-label="Szűrés szerep szerint">
                  <span className="filter-label">Szerep</span>
                  {roleOptions.map((role) => <button key={role} className={`role-chip ${roles.includes(role) ? "role-chip-active" : ""}`} onClick={() => toggleRole(role)} aria-pressed={roles.includes(role)}>{role === "Tank" ? <Shield size={14} /> : role === "Healer" ? <Heart size={14} /> : <Sword size={14} />}{role}</button>)}
                  {roles.length > 0 && <button className="clear-filter" onClick={() => setRoles([])}>Mindegy</button>}
                </div>
                <div className="class-list" aria-label="Kasztok a sorsolásban">
                  {classes.map((item) => {
                    const checked = pool.includes(item.name)
                    return <label key={item.name} className={`class-option ${checked ? "" : "class-option-off"}`}><input type="checkbox" checked={checked} onChange={() => togglePoolClass(item.name)} /><span className="checkmark"><Check size={12} /></span><ClassIcon name={item.name} size={30} /><span>{item.name}</span><i style={{ backgroundColor: checked ? item.color : "transparent" }} /></label>
                  })}
                </div>
                <div className="pool-footer"><span>{eligibleClasses.length} kaszt · egyenlő esélyek</span><div><button onClick={() => setPool(classes.map(({ name }) => name))}>Összes kijelölése</button><button onClick={() => setPool([])}>Kijelölés törlése</button></div></div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="preferences" aria-label="Beállítások">
          <label className="player-field"><span>Játékosnév <small>opcionális</small></span><input value={player} maxLength={24} placeholder="A neved vagy a következő alt neve" onChange={(event) => setPlayer(event.target.value)} /></label>
          <div className="toggles">
            <button className={`toggle-control ${fast ? "toggle-active" : ""}`} onClick={() => setFast((value) => !value)} aria-pressed={fast}><Zap size={15} />Gyors pörgetés<span className="switch" /></button>
            <button className={`toggle-control ${sound ? "toggle-active" : ""}`} onClick={() => setSound((value) => !value)} aria-pressed={sound}>{sound ? <Volume2 size={15} /> : <VolumeX size={15} />}Hang<span className="switch" /></button>
          </div>
        </section>

        {history.length > 0 && (
          <section className="history-section">
            <div className="history-heading"><h2>Korábbi dobások</h2><button onClick={() => setHistory([])}>Törlés</button></div>
            <div className="history-list">{history.map((roll) => <button key={roll.at} className="history-item" onClick={() => selectHistorical(roll)}><ClassIcon name={roll.name} size={28} /><span><strong>{roll.name}</strong><small>{roll.player || "Keep Calm & Roll"}</small></span></button>)}</div>
            <p className="history-note">Csak ebben a böngészőben · legfeljebb 10 dobás</p>
          </section>
        )}

        <footer className="kcw-footer"><span>KEEP CALM &amp; ROLL</span><span>Keep Calm and Wipe · WoW Forever</span></footer>
      </div>
    </main>
  )
}
