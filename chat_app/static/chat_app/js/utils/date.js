export function getDateKey(datetime) {
    const date = new Date(datetime)
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function formatDateLabel(datetime) {
    return new Date(datetime).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })
}