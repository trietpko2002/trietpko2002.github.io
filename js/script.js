document.getElementById('getVideoBtn').addEventListener('click', async () => {
    const videoURL = document.getElementById('videoURL').value;
    
    if (!videoURL) {
        alert("Please enter a valid YouTube URL");
        return;
    }
    
    // Call the back-end API to fetch video formats
    const response = await fetch(`/api/getVideoLinks?url=${videoURL}`);
    const data = await response.json();
    
    if (data.success) {
        const qualityOptions = document.getElementById('qualityOptions');
        qualityOptions.innerHTML = '';
        data.formats.forEach(format => {
            const button = document.createElement('button');
            button.innerText = `Download ${format.quality}`;
            button.addEventListener('click', () => {
                window.location.href = format.url;
            });
            qualityOptions.appendChild(button);
        });
        
        document.getElementById('results').classList.remove('hidden');
    }
});

document.getElementById('downloadMP3Btn').addEventListener('click', async () => {
    const videoURL = document.getElementById('videoURL').value;
    const response = await fetch(`/api/downloadMP3?url=${videoURL}`);
    const data = await response.json();
    if (data.success) {
        window.location.href = data.mp3Url;
    }
});
