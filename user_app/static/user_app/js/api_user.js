import { getCSRFToken } from './utils.js'

export async function postForm(url, formData) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
            body: formData,
            credentials: 'same-origin'
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        return await response.json()

    } catch (err) {
        console.error('Request failed:', err)
        return { success: false, error: 'network' }
    }
}