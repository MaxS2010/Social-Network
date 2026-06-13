const DEFAULT_GROUP_AVATAR = '/static/chat_app/icons/people.svg'

const avatarInput = document.getElementById('group-avatar-input')
const avatarPreview = document.getElementById('group-avatar-preview')

export function resetGroupAvatarPreview() {
    if (!avatarPreview) return

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

        avatarPreview.src = URL.createObjectURL(file)
        avatarPreview.classList.add('group-avatar-preview--custom')
    })
}

export function getDefaultGroupAvatar() {
    return avatarPreview?.dataset.defaultSrc || DEFAULT_GROUP_AVATAR
}
