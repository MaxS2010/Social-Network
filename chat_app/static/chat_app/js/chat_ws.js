const url = `ws://${window.location.host}/chat/`
const chatSocket = new WebSocket(url)

chatSocket.onmessage = function(event){
    const data = JSON.parse(event.data)
    console.log(data.type)
    if (data.type == 'chat'){
        console.log(2)
        const text = document.createElement('h4')
        text.innerHTML = data.message
        document.querySelector('#message-container').append(text)
    }
}

const form = document.querySelector("#form-chat")
const input = form.querySelector("#message-id")
console.log(form)
form.addEventListener("submit", (event) =>{ 
    event.preventDefault()
    chatSocket.send(JSON.stringify({
        message: input.value
    }))
    input.value = ""
})