// Parse query param
function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}
const exId = getQueryParam('id');
if (!exId) {
    document.getElementById('exInfo').textContent = 'No exercise selected.';
} else {
    fetch(`https://exercisedb.p.rapidapi.com/exercises/exercise/${encodeURIComponent(exId)}`, {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
            'x-rapidapi-key': '7fd20994b0mshb3b32bb324d9b3dp1ba9f3jsn2faad4fa81a9'
        }
    })
    .then(res => res.json())
    .then(ex => {
        if (!ex || !ex.id) {
            document.getElementById('exInfo').textContent = 'Exercise not found.';
            return;
        }
        // Show GIF at the top
        document.getElementById('exGif').innerHTML = ex.gifUrl ? `<img src='${ex.gifUrl}' class='exercise-video' alt='${ex.name}'>` : '';
        document.getElementById('exTitle').textContent = ex.name;
        document.getElementById('exInfo').innerHTML = `<b>Equipment:</b> ${ex.equipment || 'N/A'}<br><b>Body Part:</b> ${ex.bodyPart || 'N/A'}<br><b>Instructions:</b> ${ex.instructions || 'N/A'}`;
        // Support multiple targets
        if (Array.isArray(ex.target)) {
            if (ex.target.length > 1) {
                document.getElementById('exMuscles').innerHTML = ex.target.map(t => `<span class='muscle-badge'>${t}</span>`).join(' ');
            } else if (ex.target.length === 1) {
                document.getElementById('exMuscles').innerHTML = `<span class='muscle-badge'>${ex.target[0]}</span>`;
            } else {
                document.getElementById('exMuscles').innerHTML = 'N/A';
            }
        } else {
            document.getElementById('exMuscles').innerHTML = ex.target ? `<span class='muscle-badge'>${ex.target}</span>` : 'N/A';
        }
        
        
    })
    .catch(() => {
        document.getElementById('exInfo').textContent = 'Failed to load exercise.';
    });
}