document.getElementById('sendButton').addEventListener('click', function() {
    const selectedOption = document.getElementById('optionSelect').value;

    // Replace 'your-api-endpoint' with the actual API endpoint
    fetch('https://your-api-endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedOption: selectedOption }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Option sent successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Failed to send option.');
    });
});