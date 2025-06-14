// Replace with your actual Pexels API key
const API_KEY = 'ZLPI0G4CMVXlHMEWaINSjkhS7bQjNMrcVUuSnbGydxpvTGTtFmkkeUCj';

// Function to fetch meditation videos from Pexels API
async function fetchMeditationVideos(query = 'meditation') {
    try {
        const response = await fetch(`https://api.pexels.com/videos/search?query=${query}&per_page=12`, {
            headers: { 'Authorization': API_KEY }
        });

        const data = await response.json();

        if (data && data.videos) {
            const videos = data.videos;
            const videoContainer = document.getElementById('meditation-videos');
            videoContainer.innerHTML = '';  // Clear previous content

            if (videos.length === 0) {
                videoContainer.innerHTML = '<p>No videos found. Please try another search.</p>';
            } else {
                // Loop through the fetched videos and display them in the grid
                videos.forEach(video => {
                    const videoElement = document.createElement('div');
                    videoElement.classList.add('meditation-card');

                    // Create an image for the video thumbnail
                    const img = document.createElement('img');
                    img.src = video.image || 'default-thumbnail.jpg'; // Fallback image if no thumbnail
                    img.alt = "Meditation Video Thumbnail";
                    img.classList.add('meditation-img');

                    // Create the video title
                    const title = document.createElement('h4');
                    title.classList.add('meditation-title');
                    title.textContent = 'Meditation Video';

                    // Create a paragraph for the video URL
                    const url = document.createElement('p');
                    url.classList.add('meditation-url');
                    url.textContent = `Video URL: ${video.url}`;

                    // Append elements to the video card
                    videoElement.appendChild(img);
                    videoElement.appendChild(title);
                    videoElement.appendChild(url);

                    // Add click listener to play the video
                    videoElement.addEventListener('click', () => {
                        playVideo(video.video_files[0].link); // Play the first video link
                    });

                    // Append the video card to the container
                    videoContainer.appendChild(videoElement);
                });
            }
        }
    } catch (error) {
        console.error('Error fetching meditation videos:', error);
    }
}

// Function to handle search
document.getElementById('searchBtn').onclick = function() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        fetchMeditationVideos(query);
    }
};

// Initial fetch for meditation videos when the page loads
fetchMeditationVideos();

// Add event listener for the enter key to search
document.getElementById('searchInput').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query) {
            fetchMeditationVideos(query);
        }
    }
});

// Function to play the selected video
function playVideo(videoUrl) {
    const videoModal = document.createElement('div');
    videoModal.classList.add('video-modal');
    videoModal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn" onclick="closeVideo()">×</span>
            <iframe width="560" height="315" src="${videoUrl}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    `;
    document.body.appendChild(videoModal);
}

// Function to close the video modal
function closeVideo() {
    const videoModal = document.querySelector('.video-modal');
    if (videoModal) {
        document.body.removeChild(videoModal);
    }
}
