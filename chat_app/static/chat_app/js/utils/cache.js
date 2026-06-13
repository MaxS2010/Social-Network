const CACHE_KEY = "chat_contacts_cache_v1"

export function saveCache(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
        ts: Date.now(),
        data
    }))
}

export function loadCache() {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)

    if (Date.now() - parsed.ts > 5 * 60 * 1000) {
        return null
    }

    return parsed.data
}