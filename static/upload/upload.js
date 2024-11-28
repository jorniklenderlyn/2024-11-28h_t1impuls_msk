document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('dropArea');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const urlInput = document.getElementById('urlInput');
    const addUrlButton = document.getElementById('addUrlButton');
    const uploadButton = document.getElementById('uploadButton');

    let filesToUpload = [];
    let urlsToUpload = [];

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('highlight');
    }

    function unhighlight(e) {
        dropZone.classList.remove('highlight');
    }

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            addFileToList(file.name, 'file');
            filesToUpload.push(file);
        }
    }

    // Trigger file input click when drop area is clicked
    dropArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle URL input
    addUrlButton.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
            addFileToList(url, 'url');
            urlsToUpload.push(url);
            urlInput.value = ''; // Clear the input field
        }
    });

    function addFileToList(name, type) {
        const li = document.createElement('li');
        const iconClass = type === 'file' ? 'fas fa-file' : 'fas fa-link';
        li.innerHTML = `<i class="${iconClass}"></i> ${name} <button class="delete-button">Delete</button>`;
        fileList.appendChild(li);

        // Add event listener to delete button
        const deleteButton = li.querySelector('.delete-button');
        deleteButton.addEventListener('click', () => {
            fileList.removeChild(li);
            if (type === 'file') {
                filesToUpload = filesToUpload.filter(file => file.name !== name);
            } else {
                urlsToUpload = urlsToUpload.filter(url => url !== name);
            }
        });
    }

    // Handle upload button click
    uploadButton.addEventListener('click', () => {
        if (filesToUpload.length === 0 && urlsToUpload.length === 0) {
            alert('No files or URLs to upload.');
            return;
        }

        const formData = new FormData();

        filesToUpload.forEach(file => {
            formData.append('files', file);
        });

        urlsToUpload.forEach(url => {
            formData.append('urls', url);
        });

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Upload successful:', data);
            alert('Upload successful!');
            fileList.innerHTML = ''; // Clear the file list
            filesToUpload = []; // Clear the files array
            urlsToUpload = []; // Clear the URLs array
        })
        .catch(error => {
            console.error('Error during upload:', error);
            alert('Upload failed. Please try again.');
        });
    });
});