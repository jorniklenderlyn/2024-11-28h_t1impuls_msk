document.getElementById('chat-open-button').addEventListener('click', function() {
    const chatContainer = document.getElementById('chat-container');
    const button = this;

    chatContainer.style.display = 'flex';
    button.style.display = 'none';
});

document.getElementById('resize-button').addEventListener('click', function() {
    const chatContainer = document.querySelector('.chat-container');
    const resizeButton = document.getElementById('resize-button');

    chatContainer.classList.toggle('full-screen');
    if (chatContainer.classList.contains('full-screen')) {
        resizeButton.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        resizeButton.innerHTML = '<i class="fas fa-expand"></i>';
    }
});

document.getElementById('hide-button').addEventListener('click', function() {
    const chatContainer = document.getElementById('chat-container');
    const chatOpenButton = document.getElementById('chat-open-button');
    const resizeButton = document.getElementById('resize-button');

    chatContainer.style.display = 'none';
    chatContainer.classList.remove('full-screen');
    resizeButton.innerHTML = '<i class="fas fa-expand"></i>';
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

document.getElementById('add-data-button').addEventListener('click', function() {
    const chatBox = document.getElementById('chat-box');
    const chatInputContainer = document.querySelector('.chat-input-container');
    const fileForm = document.querySelector('.file-form');

    chatBox.style.display = 'none';
    chatInputContainer.style.display = 'none';
    fileForm.style.display = 'flex';
});

document.querySelector('.file-form button').addEventListener('click', function() {
    const chatBox = document.getElementById('chat-box');
    const chatInputContainer = document.querySelector('.chat-input-container');
    const fileForm = document.querySelector('.file-form');

    chatBox.style.display = 'block';
    chatInputContainer.style.display = 'flex';
    fileForm.style.display = 'none';
});

document.getElementById('settings-button').addEventListener('click', function() {
    const chatBox = document.getElementById('chat-box');
    const chatInputContainer = document.querySelector('.chat-input-container');
    const settingsForm = document.querySelector('.settings-form');

    chatBox.style.display = 'none';
    chatInputContainer.style.display = 'none';
    settingsForm.style.display = 'flex';
});

document.querySelector('.settings-form button').addEventListener('click', function() {
    const chatBox = document.getElementById('chat-box');
    const chatInputContainer = document.querySelector('.chat-input-container');
    const settingsForm = document.querySelector('.settings-form');

    chatBox.style.display = 'block';
    chatInputContainer.style.display = 'flex';
    settingsForm.style.display = 'none';
});

const dropZone = document.querySelector('.drop-zone');
const fileInput = document.getElementById('file-input');
const fileNamesContainer = document.createElement('div');
fileNamesContainer.style.marginTop = '10px';
dropZone.appendChild(fileNamesContainer);

dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', function() {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('change', function() {
    const files = fileInput.files;
    handleFiles(files);
});

function handleFiles(files) {
    fileNamesContainer.innerHTML = '';
    for (let i = 0; i < files.length; i++) {
        const fileName = files[i].name;
        const fileNameElement = document.createElement('div');
        fileNameElement.textContent = fileName;
        fileNamesContainer.appendChild(fileNameElement);
    }
}