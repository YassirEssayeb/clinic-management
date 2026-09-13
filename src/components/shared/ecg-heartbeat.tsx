"use client"

import { useState, useEffect } from "react"

export function EcgHeartbeat({ svg, interval = 7 }: { svg: string; interval?: number }) {
  const [key, setKey] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setKey((k) => k + 1)
    }, interval * 1000)
    return () => clearInterval(timer)
  }, [interval])

  return (
    <div
      key={key}
      className="w-[120%] max-w-none opacity-[0.35] dark:opacity-[0.45] animate-ecg-drift"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
