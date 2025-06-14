// Script for workout page
// Dummy user for sidebar
const user = { name: "Name", profilePic: "https://placehold.co/48x48/38f9d7/fff?text=U" };
document.getElementById('profileName').textContent = user.name;
document.querySelectorAll('.profile-pic').forEach(img => img.src = user.profilePic);

function showAlert(message, type = 'success') {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    if (alertPlaceholder) {
        alertPlaceholder.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
        setTimeout(() => alertPlaceholder.innerHTML = '', 4000);
    }
}

// Store all exercises loaded from API
let allExercises = [];

// Add a pagination container below the workout grid
const paginationContainerId = 'paginationContainer';
if (!document.getElementById(paginationContainerId)) {
    const container = document.createElement('div');
    container.id = paginationContainerId;
    container.style = 'display:flex;justify-content:center;align-items:center;margin:2em 0;gap:1em;';
    document.querySelector('.main-content').appendChild(container);
}

let currentPage = 1;
const cardsPerPage = 18;

async function fetchExercises(query = '') {
    const exercisesDiv = document.getElementById('exercises');
    exercisesDiv.innerHTML = 'Loading...';
    let url = '';
    if (query) {
        url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(query)}?limit=50&offset=0`;
    } else {
        url = 'https://exercisedb.p.rapidapi.com/exercises?limit=1300&offset=0';
    }
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
                'x-rapidapi-key': '7fd20994b0mshb3b32bb324d9b3dp1ba9f3jsn2faad4fa81a9'
            }
        });
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        allExercises = Array.isArray(data) ? data : [data];
        renderExercises(1);
    } catch (err) {
        exercisesDiv.innerHTML = 'Failed to load exercises.';
        showAlert('Failed to load exercises.', 'danger');
    }
}

function renderExercises(page = 1) {
    const exercisesDiv = document.getElementById('exercises');
    exercisesDiv.innerHTML = '';
    // Get filter values
    const type = document.getElementById('filterType').value;
    const intensity = document.getElementById('filterIntensity') ? document.getElementById('filterIntensity').value : '';
    const equipment = document.getElementById('filterEquipment').value;
    const target = document.getElementById('filterTarget').value;
    // Filter logic: only filter if filter is set, otherwise include all
    let filtered = allExercises.filter(ex => {
        let match = true;
        if (type && (!ex.bodyPart || ex.bodyPart.toLowerCase() !== type)) match = false;
        if (intensity && (!ex.level || ex.level.toLowerCase() !== intensity)) match = false;
        if (equipment && (!ex.equipment || ex.equipment.toLowerCase().trim() !== equipment.toLowerCase().trim())) match = false;
        if (target && (!ex.target || ex.target.toLowerCase() !== target)) match = false;
        return match;
    });
    if (filtered.length === 0) {
        exercisesDiv.innerHTML = '<div style="padding:2em;text-align:center;">No exercises found.</div>';
        document.getElementById(paginationContainerId).innerHTML = '';
        return;
    }
    // Pagination logic
    const totalPages = Math.ceil(filtered.length / cardsPerPage);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    const startIdx = (page - 1) * cardsPerPage;
    const endIdx = startIdx + cardsPerPage;
    const pageExercises = filtered.slice(startIdx, endIdx);
    pageExercises.forEach((ex, idx) => {
        const div = document.createElement('div');
        div.className = 'workout-card';
        div.style.cursor = 'pointer';
        div.onclick = function() {
            window.location.href = "exercise-detail.html?id=" + encodeURIComponent(ex.id);
        };
        const img = document.createElement('div');
        img.className = 'workout-img';
        img.innerHTML = `<img src="${ex.gifUrl || 'https://placehold.co/120x120/43e97b/fff?text=🏋️'}" alt="${ex.name}" style="width:100px;height:100px;">`;
        const title = document.createElement('div');
        title.className = 'workout-title';
        title.textContent = ex.name;
        const target = document.createElement('div');
        target.className = 'workout-target';
        if (Array.isArray(ex.target)) {
            if (ex.target.length > 1) {
                target.textContent = `Targets: ${ex.target.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}`;
            } else if (ex.target.length === 1) {
                target.textContent = `Target: ${ex.target[0].charAt(0).toUpperCase() + ex.target[0].slice(1)}`;
            } else {
                target.textContent = '';
            }
        } else {
            target.textContent = ex.target ? `Target: ${ex.target.charAt(0).toUpperCase() + ex.target.slice(1)}` : '';
        }
        div.appendChild(img);
        div.appendChild(title);
        div.appendChild(target);
        exercisesDiv.appendChild(div);
    });
    // Render pagination controls
    renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
    const container = document.getElementById(paginationContainerId);
    if (!container) return;
    container.innerHTML = '';
    if (totalPages <= 1) return;
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.className = 'btn btn-outline-primary';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => renderExercises(currentPage - 1);
    container.appendChild(prevBtn);
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = 'btn ' + (i === currentPage ? 'btn-primary' : 'btn-outline-primary');
            pageBtn.disabled = i === currentPage;
            pageBtn.onclick = () => renderExercises(i);
            container.appendChild(pageBtn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style = 'margin:0 0.5em;';
            container.appendChild(dots);
        }
    }
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.className = 'btn btn-outline-primary';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => renderExercises(currentPage + 1);
    container.appendChild(nextBtn);
}

// Fetch filter options from API and populate dropdowns
async function populateFilters() {
    // Body Parts
    fetch('https://exercisedb.p.rapidapi.com/exercises/bodyPartList', {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
            'x-rapidapi-key': '7fd20994b0mshb3b32bb324d9b3dp1ba9f3jsn2faad4fa81a9'
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log('Body Parts:', data);
        const select = document.getElementById('filterType');
        select.innerHTML = '<option value="">All Body Parts</option>';
        if (Array.isArray(data)) {
            data.forEach(bp => {
                select.innerHTML += `<option value="${bp.toLowerCase()}">${bp.charAt(0).toUpperCase() + bp.slice(1)}</option>`;
            });
        }
    })
    .catch(err => { console.error('Body Part List Error:', err); });
    // Equipment
    fetch('https://exercisedb.p.rapidapi.com/exercises/equipmentList', {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
            'x-rapidapi-key': '7fd20994b0mshb3b32bb324d9b3dp1ba9f3jsn2faad4fa81a9'
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log('Equipment:', data);
        const select = document.getElementById('filterEquipment');
        select.innerHTML = '<option value="">All Equipment</option>';
        if (Array.isArray(data)) {
            data.forEach(eq => {
                select.innerHTML += `<option value="${eq}">${eq.charAt(0).toUpperCase() + eq.slice(1)}</option>`;
            });
        }
    })
    .catch(err => { console.error('Equipment List Error:', err); });
    // Target
    fetch('https://exercisedb.p.rapidapi.com/exercises/targetList', {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
            'x-rapidapi-key': '7fd20994b0mshb3b32bb324d9b3dp1ba9f3jsn2faad4fa81a9'
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log('Targets:', data);
        const select = document.getElementById('filterTarget');
        select.innerHTML = '<option value="">All Targets</option>';
        if (Array.isArray(data)) {
            data.forEach(tg => {
                select.innerHTML += `<option value="${tg.toLowerCase()}">${tg.charAt(0).toUpperCase() + tg.slice(1)}</option>`;
            });
        }
    })
    .catch(err => { console.error('Target List Error:', err); });
}

// On page load, fetch all exercises and show first page
window.addEventListener('DOMContentLoaded', () => {
    fetchExercises();
    // Optionally, reset all filters to default
    if(document.getElementById('filterType')) document.getElementById('filterType').value = '';
    if(document.getElementById('filterEquipment')) document.getElementById('filterEquipment').value = '';
    if(document.getElementById('filterTarget')) document.getElementById('filterTarget').value = '';
    renderExercises(1);
    // Call populateFilters on page load (moved here to ensure elements exist)
    populateFilters();
});

document.getElementById('searchBtn').onclick = function() {
    const query = document.getElementById('searchInput').value.trim();
    fetchExercises(query);
};

document.getElementById('filterType').onchange = () => renderExercises(1);
document.getElementById('filterIntensity').onchange = () => renderExercises(1);
document.getElementById('filterEquipment').onchange = () => renderExercises(1);
document.getElementById('filterTarget').onchange = () => renderExercises(1);

// Load exercises on page load
fetchExercises();
