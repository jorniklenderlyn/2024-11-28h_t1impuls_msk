document.getElementById('sendButton').addEventListener('click', function() {
    const selectedOption = document.getElementById('optionSelect').value;
    console.log('Selected option:', selectedOption);

    localStorage['selectedModel'] = selectedOption;
    // Replace 'your-api-endpoint' with the actual API endpoint
});

