import { clearNewMessagesUI } from "../ui/message_renderer.js"
import { getCurrentChatId } from "./state.js"
import { sendChatMessage } from "./chat_socket.js"

const ChatForm = document.getElementById("form-chat")
const imageInput = document.getElementById("message-image")
const imagePreviewModal = document.getElementById("image-preview-modal")
const previewImage = document.getElementById("preview-image")
const sendWithPreviewBtn = document.getElementById("send-with-preview")
const cancelPreviewBtn = document.getElementById("cancel-preview")
const closePreviewBtn = document.querySelector(".image-preview-close")

let currentFile = null
let isUploading = false

imageInput?.addEventListener("change", function(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
        alert('Будь ласка, оберіть файл зображення')
        imageInput.value = ""
        return
    }

    currentFile = file

    if (previewImage.src.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage.src)
    }

    previewImage.src = URL.createObjectURL(file)
    imagePreviewModal.style.display = "flex"
})

function closePreviewModal() {
    if (imagePreviewModal) {
        imagePreviewModal.style.display = "none"
    }
    
    if (previewImage && previewImage.src.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage.src)
        previewImage.src = ""
    }

    currentFile = null
    if (imageInput) {
        imageInput.value = ""
    }
    
    if (sendWithPreviewBtn) {
        sendWithPreviewBtn.disabled = false
        sendWithPreviewBtn.textContent = "Надіслати"
    }
    isUploading = false
}

closePreviewBtn?.addEventListener("click", closePreviewModal)
cancelPreviewBtn?.addEventListener("click", closePreviewModal)

imagePreviewModal?.addEventListener("click", (e) => {
    if (e.target === imagePreviewModal) {
        closePreviewModal()
    }
})

sendWithPreviewBtn?.addEventListener("click", async function(e) {
    e.preventDefault()
    e.stopPropagation()

    if (!currentFile || isUploading) return

    const chatId = getCurrentChatId()
    if (!chatId || String(chatId) === "null") {
        alert("Помилка: не вдалося визначити ID чату")
        return
    }

    isUploading = true
    this.disabled = true
    this.textContent = "Завантаження..."

    const formData = new FormData(ChatForm)
    formData.set("image", currentFile)
    
    const messageText = (formData.get("message") || "").trim()
    if (!messageText) {
        formData.set("message", "")
    }

    try {
        const response = await fetch(`/chat/message_upload/${String(chatId)}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": formData.get("csrfmiddlewaretoken"),
                "X-Requested-With": "XMLHttpRequest"
            },
            body: formData,
        })

        const data = await response.json()

        if (response.ok && data.success) {
            closePreviewModal()
            ChatForm?.reset()
        } else {
            alert(`Помилка сервера: ${data.error || 'Невідома помилка'}`)
            isUploading = false
            this.disabled = false
            this.textContent = "Надіслати"
        }
    } catch (error) {
        console.error('Image upload failed:', error)
        alert('Не вдалося надіслати зображення. Перевірте з’єднання.')
        isUploading = false
        this.disabled = false
        this.textContent = "Надіслати"
    }
})

ChatForm?.addEventListener("submit", function(event) {
    event.preventDefault() 

    if (imageInput?.files?.[0]) {
        return
    }

    clearNewMessagesUI()

    const formData = new FormData(ChatForm)
    const messageText = (formData.get('message') || '').trim()

    if (!messageText) return

    const fromObject = Object.fromEntries(formData)
    sendChatMessage(fromObject)
    
    ChatForm.reset()
})

ChatForm?.querySelector('textarea, input[name="message"]')?.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault() 
        if (ChatForm) {
            ChatForm.requestSubmit() 
        }
    }
})
