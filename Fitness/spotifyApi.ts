import fetch from 'node-fetch';

const clientId = 'c5080bfc38514efeb204256caaadd2d8';
const clientSecret = '31f66924cb9d46c1bc8a33951bba23c1';

async function getAccessToken(): Promise<string> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json() as any;
    return data.access_token;
}

export async function getSpotifyProfile() {
    const token = await getAccessToken();
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch profile');
    }
    return await response.json();
}

export async function searchTracks(query: string) {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to search tracks');
    }
    return await response.json();
}

// Example usage: (uncomment to test)
// getSpotifyProfile().then(console.log).catch(console.error);
// searchTracks('your search query').then(console.log).catch(console.error);
