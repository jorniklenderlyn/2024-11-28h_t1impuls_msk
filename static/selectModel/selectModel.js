document.getElementById('sendButton').addEventListener('click', function() {
    const selectedOption = document.getElementById('optionSelect').value;
    const inputText = document.getElementById('prompt').value;

    console.log('Selected option:', selectedOption);
    console.log('Input text:', inputText);

    localStorage['selectedModel'] = selectedOption;
    localStorage['prompt'] = inputText;
    // Replace 'your-api-endpoint' with the actual API endpoint
});