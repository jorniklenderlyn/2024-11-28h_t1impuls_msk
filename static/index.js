function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearScene() {
    const chatBox = document.getElementById('chat-box');
    const chatInputContainer = document.querySelector('.chat-input-container');
    const fileForm = document.querySelector('.file-form');
    const settingsForm = document.querySelector('.settings-form');

    settingsForm.style.display = 'none';
    chatBox.style.display = 'none';
    chatInputContainer.style.display = 'none';
    fileForm.style.display = 'none';
}

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
let i = 0;
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

        ///
//         console.log("Hello");
// setTimeout(() => {  console.log("World!"); 
//         answers = answers = ['Модель бизнеса с прямым отгрузом товара клиенту со склада поставщика без участия продавца между ними.','Низкие стартовые инвестиции; отсутствие необходимости хранить товарный запас','Информация о авторе статьи отсутствует','Маркетинговая стратегия фокусируется привлечении клиентов к сайтам посредников (не напрямую производителям).','Доступность интернета; низкие издержки ведения бизнеса онлайн ; рост популярности интернет - магазины, желание предпринимателей снизить риски.'];
//         const messageElement2 = document.createElement('div');
//         messageElement2.classList.add('message', 'other');
//         messageElement2.textContent = answers[i];
//         chatBox.appendChild(messageElement2);
//         chatBox.scrollTop = chatBox.scrollHeight;
//         console.log(i);
//         i += 1;
//     }, Math.min(Math.ceil(Math.random() * 13000), 10000));
        ///

        // console.log({'message': messageText, 'model_name': localStorage['selectedModel'], 'chat_history': localStorage['chatHistory']});
        fetch(`http://localhost:8000/${localStorage['chatId']}/chat/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'message': messageText, 'model_name': localStorage['selectedModel'], 'chat_history': JSON.parse(localStorage['chatHistory'])})
        })
        .then(response => response.json())
        .then(data => {
            localStorage['chatHistory'] = JSON.stringify(data.chat_history);
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'other');
            messageElement.textContent = data.response;
            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
            console.log('Upload successful:', data);
            // alert('Upload successful!');
        })
        .catch(error => {
            console.error('Error during upload:', error);
            // alert('Upload failed. Please try again.');
        });
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

    clearScene();
    chatBox.style.display = 'none';
    chatInputContainer.style.display = 'none';
    fileForm.style.display = 'flex';
});

// document.querySelector('.file-form button').addEventListener('click', function() {
//     const chatBox = document.getElementById('chat-box');
//     const chatInputContainer = document.querySelector('.chat-input-container');
//     const fileForm = document.querySelector('.file-form');

//     chatBox.style.display = 'block';
//     chatInputContainer.style.display = 'flex';
//     fileForm.style.display = 'none';
// });

document.getElementById('settings-button').addEventListener('click', function() {
    const chatBox = document.getElementById('chat-box');
    const chatInputContainer = document.querySelector('.chat-input-container');
    const settingsForm = document.querySelector('.settings-form');

    clearScene();
    chatBox.style.display = 'none';
    chatInputContainer.style.display = 'none';
    settingsForm.style.display = 'flex';
});

// document.querySelector('.settings-form button').addEventListener('click', function() {
//     const chatBox = document.getElementById('chat-box');
//     const chatInputContainer = document.querySelector('.chat-input-container');
//     const settingsForm = document.querySelector('.settings-form');

//     chatBox.style.display = 'block';
//     chatInputContainer.style.display = 'flex';
//     settingsForm.style.display = 'none';
// });

Array.from(document.getElementsByClassName('back-button')).forEach(btn => {
    btn.addEventListener('click', function() {
        // alert("");
        const chatBox = document.getElementById('chat-box');
        const chatInputContainer = document.querySelector('.chat-input-container');
        
        clearScene();
    
        chatBox.style.display = 'block';
        chatInputContainer.style.display = 'flex';
    });
});