// Remove static user/playlist/recommended data
// Instead, only set profile from backend if needed
// document.getElementById('profileName').textContent = user.name;
// document.getElementById('profilePic').src = user.profilePic;

// Remove static playlists/recommended
let currentPlaylist = { songs: [] };
let currentSongIndex = 0;
let isPlaying = false;
let audio = document.getElementById('audioPlayer');
let progressInterval = null;

// Helper: always set play/pause button icon
function updatePlayPauseBtn() {
    const btn = document.getElementById('playPauseBtn');
    if (!btn) return;
    btn.innerHTML = isPlaying
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#1976d2" class="bi bi-pause-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6 5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5A.5.5 0 0 0 6 5zm4 0a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#1976d2" class="bi bi-play-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.271 5.055A.5.5 0 0 1 7 5.5v5a.5.5 0 0 1-.76.429l-3.5-2.5a.5.5 0 0 1 0-.858l3.5-2.5a.5.5 0 0 1 .531-.016z"/></svg>';
}

// Show alert
function showAlert(message, type = 'success') {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    alertPlaceholder.innerHTML = `<div class="alert alert-${type}" role="alert" style="animation:fadeInUp 0.5s;">
        ${message}
        <button type="button" class="btn-close" aria-label="Close">&times;</button>
    </div>`;
    const closeBtn = alertPlaceholder.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.onclick = () => alertPlaceholder.innerHTML = '';
    }
    setTimeout(() => {
        if (alertPlaceholder.firstChild) {
            alertPlaceholder.firstChild.style.opacity = '0';
            setTimeout(() => alertPlaceholder.innerHTML = '', 400);
        }
    }, 3000);
}

// Load playlists from backend if needed, else leave empty
function loadPlaylists() {
    const playlistList = document.getElementById('playlistList');
    playlistList.innerHTML = '';
    // Optionally fetch playlists from backend here
    // For now, leave empty or show message
    // playlistList.innerHTML = '<li>No playlists loaded.</li>';
}

// Remove recommended section logic
function loadRecommended() {
    // No-op: recommended section removed
}

// Load songs for current playlist
function loadSongs() {
    const songList = document.getElementById('songList');
    songList.innerHTML = '';
    // Only show the first 6 songs
    const songsToShow = (currentPlaylist.songs || []).slice(0, 6);
    songsToShow.forEach((song, idx) => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action' + (idx === currentSongIndex ? ' active' : '');
        li.textContent = `${song.title} - ${song.artist}`;
        li.onclick = () => {
            currentSongIndex = idx;
            playSong();
        };
        songList.appendChild(li);
    });
    updateNowPlaying();
}

// Play a song from data (object with title, artist, album, albumArt, duration, preview_url)
function playSongFromData(song) {
    document.getElementById('trackTitle').textContent = song.title;
    document.getElementById('trackArtist').textContent = song.artist;
    document.getElementById('albumName').textContent = song.album;
    document.getElementById('albumArt').src = song.albumArt || 'https://placehold.co/100x100/43e97b/fff?text=♪';
    document.getElementById('duration').textContent = formatTime(song.duration);
    document.getElementById('currentTime').textContent = '0:00';
    document.getElementById('progress').style.width = '0%';
    if (song.preview_url) {
        audio.src = song.preview_url;
        audio.play();
        isPlaying = true;
    } else {
        audio.src = '';
        isPlaying = false;
        showAlert('No preview available for this track.', 'warning');
    }
    updatePlayPauseBtn();
}

// Play current song in playlist
function playSong() {
    const song = (currentPlaylist.songs || [])[currentSongIndex];
    if (!song) return;
    if (!song.preview_url) {
        showAlert('No preview available for this track.', 'warning');
        isPlaying = false;
        updatePlayPauseBtn();
        // Auto-skip to next available song
        nextSong();
        return;
    }
    playSongFromData(song);
    highlightActiveSong();
    clearInterval(progressInterval);
    let elapsed = 0;
    progressInterval = setInterval(() => {
        if (!isPlaying) return;
        elapsed++;
        updateProgress(elapsed, song.duration);
        if (elapsed >= song.duration) {
            clearInterval(progressInterval);
            nextSong();
        }
    }, 1000);
}

// Update now playing info
function updateNowPlaying() {
    const song = (currentPlaylist.songs || [])[currentSongIndex];
    document.getElementById('trackTitle').textContent = song ? song.title : 'No song playing';
    document.getElementById('trackArtist').textContent = song ? song.artist : '';
    document.getElementById('albumName').textContent = song ? song.album : '';
    document.getElementById('albumArt').src = song && song.albumArt ? song.albumArt : 'https://placehold.co/100x100/43e97b/fff?text=♪';
    document.getElementById('duration').textContent = song ? formatTime(song.duration) : '0:00';
    document.getElementById('currentTime').textContent = '0:00';
    document.getElementById('progress').style.width = '0%';
    updatePlayPauseBtn();
    highlightActiveSong();
}

// Highlight active song in list (add .playing class for lighter highlight)
function highlightActiveSong() {
    const songList = document.getElementById('songList').children;
    for (let i = 0; i < songList.length; i++) {
        songList[i].className = 'list-group-item list-group-item-action';
        if (i === currentSongIndex) {
            songList[i].classList.add('playing');
        }
    }
}

// Next song: only play next with preview, else show popup
function nextSong() {
    const songs = currentPlaylist.songs || [];
    let idx = currentSongIndex + 1;
    while (idx < songs.length) {
        if (songs[idx].preview_url) {
            currentSongIndex = idx;
            playSong();
            highlightActiveSong();
            return;
        } else {
            // Show notification for skipped song
            showAlert('No preview available for this track.', 'warning');
        }
        idx++;
    }
    highlightActiveSong();
}

function prevSong() {
    const songs = currentPlaylist.songs || [];
    let idx = currentSongIndex - 1;
    while (idx >= 0) {
        if (songs[idx].preview_url) {
            currentSongIndex = idx;
            playSong();
            highlightActiveSong();
            return;
        } else {
            // Show notification for skipped song
            showAlert('No preview available for this track.', 'warning');
        }
        idx--;
    }
    highlightActiveSong();
}

// Toggle play/pause
function togglePlayPause() {
    if (!audio.src) {
        showAlert('No track loaded.', 'warning');
        isPlaying = false;
        updatePlayPauseBtn();
        return;
    }
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        audio.play();
        isPlaying = true;
    }
    updatePlayPauseBtn();
}

// Update progress bar
function updateProgress(current, duration) {
    document.getElementById('currentTime').textContent = formatTime(current);
    document.getElementById('progress').style.width = (current / duration * 100) + '%';
}

// Format time mm:ss
function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// Button event listeners
document.getElementById('playPauseBtn').onclick = togglePlayPause;
document.getElementById('nextBtn').onclick = nextSong;
document.getElementById('prevBtn').onclick = prevSong;
document.getElementById('volumeBar').oninput = function(e) {
    audio.volume = e.target.value;
};

// Search functionality (integrate with backend, show album art, limit to 6 results, remove recommend section)
document.getElementById('searchBtn').onclick = async function() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    const res = await fetch('/api/spotify-search?q=' + encodeURIComponent(query));
    if (res.ok) {
        const data = await res.json();
        const songList = document.getElementById('songList');
        songList.innerHTML = '';
        (data.tracks.items || []).slice(0, 6).forEach((track, idx) => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-action d-flex align-items-center gap-3';
            // Show album art
            const img = document.createElement('img');
            img.src = (track.album.images && track.album.images[0]) ? track.album.images[0].url : 'https://placehold.co/60x60/43e97b/fff?text=♪';
            img.alt = 'Album Art';
            img.style.width = '48px';
            img.style.height = '48px';
            img.style.borderRadius = '8px';
            img.style.objectFit = 'cover';
            li.appendChild(img);

            const infoDiv = document.createElement('div');
            infoDiv.innerHTML = `<div><b>${track.name}</b></div>
                <div class="text-muted small">${track.artists.map(a => a.name).join(', ')}</div>
                <div class="text-muted small">${track.album.name}</div>`;
            li.appendChild(infoDiv);

            li.onclick = () => {
                // Remove .playing from all
                Array.from(songList.children).forEach(child => child.classList.remove('playing'));
                li.classList.add('playing');
                document.getElementById('trackTitle').textContent = track.name;
                document.getElementById('trackArtist').textContent = track.artists.map(a => a.name).join(', ');
                document.getElementById('albumName').textContent = track.album.name;
                document.getElementById('albumArt').src = (track.album.images && track.album.images[0]) ? track.album.images[0].url : 'https://placehold.co/100x100/43e97b/fff?text=♪';
                document.getElementById('duration').textContent = formatTime(Math.floor(track.duration_ms / 1000));
                document.getElementById('currentTime').textContent = '0:00';
                document.getElementById('progress').style.width = '0%';
                if (track.preview_url) {
                    audio.src = track.preview_url;
                    audio.play();
                    isPlaying = true;
                } else {
                    audio.src = '';
                    isPlaying = false;
                    showAlert('No preview available for this track.', 'warning');
                }
                updatePlayPauseBtn();
            };
            songList.appendChild(li);
        });
    } else {
        showAlert('Search failed', 'danger');
    }
    updatePlayPauseBtn();
};

// Responsive progress bar click
document.getElementById('progress').parentElement.onclick = function(e) {
    const song = (currentPlaylist.songs || [])[currentSongIndex];
    if (!song) return;
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = Math.floor(song.duration * percent);
    updateProgress(seekTime, song.duration);
};

// Sidebar toggle logic
document.addEventListener('DOMContentLoaded', function() {
    const mainContainer = document.querySelector('.main-container');
    const sidebarToggle = document.getElementById('sidebarToggle');
    let isSidebarOpen = true;
    sidebarToggle.addEventListener('click', function() {
        isSidebarOpen = !isSidebarOpen;
        if (isSidebarOpen) {
            mainContainer.classList.remove('sidebar-closed');
            mainContainer.classList.add('sidebar-open');
        } else {
            mainContainer.classList.remove('sidebar-open');
            mainContainer.classList.add('sidebar-closed');
        }
    });

    // Remove recommend section from UI after page load
    const recommendSection = document.querySelector('.recommend-section');
    if (recommendSection) recommendSection.remove();
    updatePlayPauseBtn();
});

// Ensure play/pause button updates on audio events
audio.addEventListener('play', () => {
    isPlaying = true;
    updatePlayPauseBtn();
});
audio.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayPauseBtn();
});
audio.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayPauseBtn();
});

// Initialize UI
loadPlaylists();
loadRecommended();
loadSongs();
updateNowPlaying();
updateNowPlaying();
updateNowPlaying();
loadSongs();
updateNowPlaying();
updateNowPlaying();
updateNowPlaying();
