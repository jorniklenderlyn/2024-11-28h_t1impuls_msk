document.getElementById('toggle-button').addEventListener('click', function() {
    const chatBox = document.getElementById('chat-box');
    const button = this;

    if (chatBox.style.display === 'none' || chatBox.style.display === '') {
        chatBox.style.display = 'block';
        button.style.backgroundColor = '#28a745';
    } else {
        chatBox.style.display = 'none';
        button.style.backgroundColor = '#007bff';
    }
});