"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shuffle, Shield, Heart, Sword } from "lucide-react"

const classicClasses = [
  {
    name: "Druid",
    roles: ["Tank", "Healer", "DPS"],
    description: "Hybrid kaszt shapeshift formákkal és több spec lehetőséggel.",
    color: "#FF7D0A",
    bgColor: "",
    borderColor: "",
  },
  {
    name: "Hunter",
    roles: ["DPS"],
    description: "Ranged DPS pet támogatással és trap alapú kontrollal.",
    color: "#ABD473",
    bgColor: "",
    borderColor: "",
  },
  {
    name: "Mage",
    roles: ["DPS"],
    description: "Egy igazi glass cannon kaszt arcane, fire és frost spellekkel.",
    color: "#69CCF0",
    bgColor: "",
    borderColor: "",
  },
  {
    name: "Paladin",
    roles: ["Tank", "Healer", "DPS"],
    description: "Plate viselő hybrid, holy magic és aura supporttal.",
    color: "#F58CBA",
    bgColor: "",
    borderColor: "",
  },
  {
    name: "Priest",
    roles: ["Healer", "DPS"],
    description: "Healer kaszt holy és shadow speccel is elérhető.",
    color: "#FFFFFF",
    bgColor: "",
    borderColor: "",
  },
  {
    name: "Rogue",
    roles: ["DPS"],
    description: "Stealth-alapú melee DPS combo pont rendszerrel.",
    color: "#FFF569",
    bgColor: "",
    borderColor: "",
  },
  {
    name: "Shaman",
    roles: ["Healer", "DPS"],
    description: "Totemhasználó hibrid kaszt elemental és enhancement speccel.",
    color: "#0070DE",
    bgColor: "",
    borderColor: "",
  },
  {
    name: "Warlock",
    roles: ["DPS"],
    description: "Caster, aki DoT-okat, démonokat és curses-t használ.",
    color: "#9482C9",
    bgColor: "",
    borderColor: "",
  },
  {
    name: "Warrior",
    roles: ["Tank", "DPS"],
    description: "Melee kaszt rage alapú tank és DPS speccel.",
    color: "#C79C6E",
    bgColor: "",
    borderColor: "",
  },
]


const getRoleIcon = (role: string) => {
  switch (role) {
    case "Tank":
      return <Shield className="w-3 h-3" />
    case "Healer":
      return <Heart className="w-3 h-3" />
    case "DPS":
      return <Sword className="w-3 h-3" />
    default:
      return null
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "Tank":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    case "Healer":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    case "DPS":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
  }
}

// Az ikon property helyett minden kaszthoz csak a nevét tárolom, az ikont a public/class_icons/ClassIcon_{name}.webp alapján jelenítem meg.
function getClassIcon(className: string, size: number = 32) {
  const file = `/class_icons/ClassIcon_${className.toLowerCase()}.webp`;
  return <img src={file} alt={className + ' icon'} width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', filter: 'drop-shadow(0 1px 2px #0008)' }} />;
}

export default function WoWClassRandomizer() {
  const [selectedClass, setSelectedClass] = useState<(typeof classicClasses)[0] | null>(null)
  const [isRandomizing, setIsRandomizing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [winningIndex, setWinningIndex] = useState<number>(0)
  const [scrollArray, setScrollArray] = useState<(typeof classicClasses)[0][]>([])
  const [containerCenter, setContainerCenter] = useState(300)
  const [zoomed, setZoomed] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      const rect = scrollContainerRef.current.getBoundingClientRect()
      setContainerCenter(rect.width / 2)
    }
  }, [isRandomizing])

  const itemWidth = 96 // 80px + 16px gap

  const randomizeClass = async () => {
    setIsRandomizing(true)
    setShowResult(false)
    setSelectedClass(null)
    setZoomed(false)

    // A nyíl pozíciója (pl. 27)
    const winIndex = 27
    setWinningIndex(winIndex)

    // Teljesen véletlenszerű scrollArray generálása
    const totalItems = 60
    const tempScrollArray = []
    for (let i = 0; i < totalItems; i++) {
      const randomIndex = Math.floor(Math.random() * classicClasses.length)
      tempScrollArray.push(classicClasses[randomIndex])
    }
    setScrollArray(tempScrollArray)

    // Zoom trigger az animáció utolsó 0.8 másodpercére (új időzítéshez igazítva)
    setTimeout(() => setZoomed(true), 3200)

    // Várakozás az animáció végéig
    await new Promise((resolve) => setTimeout(resolve, 4000))

    // A nyíl alatti kaszt kiválasztása
    const chosenClass = tempScrollArray[winIndex]
    setSelectedClass(chosenClass)
    setIsRandomizing(false)
    setShowResult(true)
    setZoomed(false)
  }

  // Calculate final position - much simpler approach
  const finalPosition = -(winningIndex * itemWidth) + containerCenter - 40 // 40 = half item width

  return (
    <div className="min-h-screen bg-[#181825]">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo/kalimdori-logo.png" 
              alt="Kalimdori Kalandorok logó" 
              className="max-w-xs w-full h-auto object-contain drop-shadow-lg" 
              style={{ maxWidth: '240px' }}
            />
          </div>
          <h1 className="bebas text-4xl md:text-8xl font-bold text-white mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            Kalandor Kerék
          </h1>
          <p className="text-lg text-zinc-400 mb-8">Project-Epoch Class Sorsoló - A Kalimdori Kalandorok guild jóvoltából</p>

          {/* Randomize Button */}
          <Button
            onClick={randomizeClass}
            disabled={isRandomizing}
            size="lg"
            className="px-8 py-3 text-lg font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg border border-zinc-700"
          >
            <AnimatePresence mode="wait">
              {isRandomizing ? (
                <motion.div
                  key="randomizing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Shuffle className="w-5 h-5" />
                  </motion.div>
                  Sorsolás...
                </motion.div>
              ) : (
                <motion.div
                  key="randomize"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Shuffle className="w-5 h-5" />
                  Sorsolás
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* CS:GO Style Case Opening Animation */}
        <AnimatePresence>
          {isRandomizing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <div className="relative bg-zinc-900/90 rounded-2xl border-2 border-zinc-700 p-6 overflow-x-hidden overflow-y-visible w-full max-w-4xl mx-auto shadow-2xl backdrop-blur-md">
                {/* Selection indicator */}
                <div
                  className="absolute z-30 flex flex-col items-center pointer-events-none"
                  style={{
                    top: '-36px', // hogy a háromszög hegye pontosan a doboz tetejéhez érjen
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {/* Vékony, extra hosszú csík */}
                  <div className="w-1 h-28 bg-red-500 rounded-full shadow-lg" />
                  {/* Nagyobb, árnyékos háromszög */}
                  <div
                    className="w-0 h-0 border-l-6 border-r-6 border-t-[18px] border-l-transparent border-r-transparent border-t-red-500"
                    style={{ filter: "drop-shadow(0 2px 6px #000a)" }}
                  />
                </div>

                {/* Scrolling classes */}
                <div className="relative min-h-[96px] h-auto overflow-visible" ref={scrollContainerRef}>
                  <motion.div
                    className="flex gap-4 absolute top-0 left-0 overflow-visible"
                    initial={{ x: 0 }}
                    animate={{
                      x: isRandomizing ? [0, -1800, finalPosition] : 0,
                    }}
                    transition={{
                      duration: 5,
                      times: [0, 0.2, 1],
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    {(isRandomizing || scrollArray.length > 0 ? scrollArray : []).map((wowClass, index) => (
                      <motion.div
                        key={`${wowClass.name}-${index}`}
                        className={`flex-shrink-0 w-20 h-20 border-4 rounded-2xl flex flex-col items-center justify-center shadow-xl backdrop-blur-md transition-all duration-200
                         ${!isRandomizing && showResult && index === winningIndex ? "ring-2 ring-yellow-400 shadow-2xl" : ""}
                         ${isRandomizing && zoomed && index === winningIndex ? "z-20 shadow-2xl" : "z-0"}
                         `}
                        style={{ background: wowClass.color + '55', borderColor: wowClass.color, zIndex: isRandomizing && zoomed && index === winningIndex ? 20 : 0 }}
                        animate={{
                          scale:
                            isRandomizing && zoomed && index === winningIndex
                              ? 1.1
                              : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <div className="mb-1 flex justify-center">{getClassIcon(wowClass.name, 32)}</div>
                        <div className="text-xs font-bold tracking-wide text-white" style={{ textShadow: '0 2px 8px #181825, 0 0px 2px #000' }}>{wowClass.name}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Gradient overlays for fade effect */}
                <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-[#181825]/90 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-[#181825]/90 to-transparent z-10 pointer-events-none"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Class Result */}
        <AnimatePresence>
          {showResult && selectedClass && !isRandomizing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{
                duration: 0.6,
                type: "spring",
                bounce: 0.4,
              }}
              className="mb-12"
            >
              <Card className="border-4 shadow-2xl rounded-2xl backdrop-blur-md" style={{ background: '#232336', borderColor: selectedClass.color }}>
                <CardContent className="p-8 text-center">
                  <motion.div
                    className="mb-4 flex justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                  >
                    {getClassIcon(selectedClass.name, 64)}
                  </motion.div>
                  <motion.h2
                    className="text-3xl font-bold mb-3"
                    style={{ color: selectedClass.color }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {selectedClass.name}
                  </motion.h2>
                  <motion.p
                    className="text-zinc-300 mb-6 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {selectedClass.description}
                  </motion.p>

                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-200 mb-2">Roles</h3>
                      <div className="flex justify-center gap-2 flex-wrap">
                        {selectedClass.roles.map((role, index) => (
                          <motion.div
                            key={role}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1 + index * 0.1 }}
                          >
                            <span
                              className={
                                `inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-semibold border ` +
                                (role === 'DPS'
                                  ? 'bg-red-900/10 text-red-300 border-red-700'
                                  : role === 'Healer'
                                  ? 'bg-green-900/10 text-green-300 border-green-700'
                                  : 'bg-blue-900/10 text-blue-300 border-blue-700')
                              }
                            >
                              {getRoleIcon(role)}
                              {role}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Class Grid - Only show when not randomizing */}
        {!isRandomizing && (
          <motion.div
            className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4 md:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: showResult ? 1.5 : 0 }}
          >
            {classicClasses.map((wowClass, index) => (
              <motion.div
                key={wowClass.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (showResult ? 1.5 : 0) + index * 0.05, duration: 0.3 }}
                className={
                  `border-4 rounded-2xl p-3 text-center hover:scale-110 transition-transform cursor-pointer shadow-xl backdrop-blur-md ` +
                  (selectedClass?.name === wowClass.name ? "ring-2 ring-white" : "")
                }
                style={{ background: wowClass.color + '55', borderColor: wowClass.color }}
                onClick={() => {
                  setSelectedClass(wowClass)
                  setShowResult(true)
                }}
              >
                <div className="mb-1 flex justify-center">{getClassIcon(wowClass.name, 32)}</div>
                <div className="text-xs font-bold tracking-wide" style={{ color: wowClass.color, textShadow: '0 2px 8px #181825, 0 0px 2px #000' }}>{wowClass.name}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
