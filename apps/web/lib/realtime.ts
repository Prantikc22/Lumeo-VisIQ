import { useEffect, useRef, useState } from "react"

export function useRealtime({ url, onEvent }: { url: string, onEvent: (event: any) => void }) {
  const [connected, setConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource(url)
    eventSourceRef.current = es
    setConnected(true)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        onEvent(data)
      } catch {}
    }
    es.onerror = () => {
      setConnected(false)
      es.close()
    }
    return () => {
      es.close()
      setConnected(false)
    }
  }, [url, onEvent])

  return { connected }
}
