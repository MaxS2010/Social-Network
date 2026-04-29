import { getCSRFToken } from './utils.js'

export async function postForm(url, formData) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: formData
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
            return { success: false, ...data }
        }

        return data

    } catch (err) {
        return { success: false, error: 'network' }
    }
}