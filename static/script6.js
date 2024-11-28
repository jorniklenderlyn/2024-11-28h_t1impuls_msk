document.getElementById('chat-open-button').addEventListener('click', function() {
    const chatContainer = document.getElementById('chat-container');
    const button = this;

    chatContainer.style.display = 'flex';
    button.style.display = 'none';
});

document.getElementById('resize-button').addEventListener('click', function() {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.classList.toggle('full-screen');
});

document.getElementById('hide-button').addEventListener('click', function() {
    const chatContainer = document.getElementById('chat-container');
    const chatOpenButton = document.getElementById('chat-open-button');

    chatContainer.style.display = 'none';
    chatContainer.classList.remove('full-screen');
    chatOpenButton.style.display = 'block';
});

document.getElementById('send-button').addEventListener('click', function() {
    const messageInput = document.getElementById('message-input');
    const chatBox = document.getElementById('chat-box');
    const messageText = messageInput.value.trim();

    if (messageText !== '') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'self');
        messageElement.textContent = messageText;
        chatBox.appendChild(messageElement);
        messageInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});

document.getElementById('message-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('send-button').click();
    }
});