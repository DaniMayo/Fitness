import express, { Request, Response } from 'express';
import path from 'path';
import { searchTracks } from './spotifyApi';

const app = express();
const PORT = 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

app.get('/api/spotify-search', async (req: Request, res: Response): Promise<void> => {
    const q = req.query.q as string;
    if (!q) {
        res.status(400).json({ error: 'Missing query' });
        return;
    }
    try {
        const data = await searchTracks(q);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Spotify API error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/spotify.html`);
});
