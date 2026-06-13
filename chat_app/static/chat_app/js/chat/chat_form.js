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

// Handle image selection - show preview modal
imageInput?.addEventListener("change", function(event) {
    const file = event.target.files?.[0]
    if (!file) return

    currentFile = file
    const reader = new FileReader()
    reader.onload = (e) => {
        previewImage.src = e.target?.result || ""
        imagePreviewModal.style.display = "flex"
    }
    reader.readAsDataURL(file)
})

// Close modal functions
function closePreviewModal() {
    imagePreviewModal.style.display = "none"
    currentFile = null
    imageInput.value = ""
}

closePreviewBtn?.addEventListener("click", closePreviewModal)
cancelPreviewBtn?.addEventListener("click", closePreviewModal)

// Close modal when clicking outside
imagePreviewModal?.addEventListener("click", (e) => {
    if (e.target === imagePreviewModal) {
        closePreviewModal()
    }
})

// Send image after preview
sendWithPreviewBtn?.addEventListener("click", async () => {
    if (!currentFile) return

    const formData = new FormData(ChatForm)
    formData.set("image", currentFile)
    const messageText = (formData.get("message") || "").trim()

    const chatId = getCurrentChatId()
    if (!chatId) return

    if (!messageText) {
        formData.set("message", "")
    }

    await fetch(`/chat/message_upload/${chatId}/`, {
        method: "POST",
        headers: {
            "X-CSRFToken": formData.get("csrfmiddlewaretoken"),
        },
        body: formData,
    })

    ChatForm.reset()
    closePreviewModal()
})

ChatForm?.addEventListener("submit", async function(event) {
    event.preventDefault()

    // If there's a file, don't submit yet - let preview modal handle it
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
