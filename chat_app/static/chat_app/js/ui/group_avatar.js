const DEFAULT_GROUP_AVATAR = '/static/chat_app/icons/people.svg'
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // Лимит 5 МБ для защиты от зависаний

const avatarInput = document.getElementById('group-avatar-input')
const avatarPreview = document.getElementById('group-avatar-preview')

export function resetGroupAvatarPreview() {
    if (!avatarPreview) return

    if (avatarPreview.src.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview.src)
    }

    avatarPreview.src = avatarPreview.dataset.defaultSrc || DEFAULT_GROUP_AVATAR
    avatarPreview.classList.remove('group-avatar-preview--custom')

    if (avatarInput) {
        avatarInput.value = ''
    }
}

if (avatarInput && avatarPreview) {
    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files?.[0]
        
        if (!file) {
            resetGroupAvatarPreview()
            return
        }

        if (!file.type.startsWith('image/')) {
            alert('Оберіть файл зображення')
            resetGroupAvatarPreview()
            return
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            alert('Файл занадто великий. Максимальний розмір: 5 МБ')
            resetGroupAvatarPreview()
            return
        }

        if (avatarPreview.src.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview.src)
        }

        avatarPreview.src = URL.createObjectURL(file)
        avatarPreview.classList.add('group-avatar-preview--custom')
    })
}

export function getDefaultGroupAvatar() {
    return avatarPreview?.dataset.defaultSrc || DEFAULT_GROUP_AVATAR
}
