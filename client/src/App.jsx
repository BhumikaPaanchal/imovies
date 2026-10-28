
import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

const [newMovie, setNewMovie] = useState({
    title: '',
    genre: '',
    rating: '',
    release_year: '',
    description: '',
    duration: '',
    poster: ''
});
const [favorites, setFavorites] = useState(() => {
    try {
        const savedFavorites = localStorage.getItem('favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch {
        return [];
    }
});

const [showFavorites, setShowFavorites] = useState(false);

// Fetch movies from the backend
    useEffect(() => {
        fetch('http://localhost:5000/api/movies')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch movies');
                }
                return response.json();
            })
            .then((data) => {
                setMovies(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);
// Save favorites whenever they change
useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}, [favorites]);
    // Fetch details for one movie
    const viewMovie = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/movies/${id}`
            );

            if (!response.ok) {
                throw new Error('Could not load movie details');
            }

            const movie = await response.json();
            setSelectedMovie(movie);
        } catch (err) {
            alert(err.message);
        }
    };

   const toggleFavorite = (id) => {
    const movieId = Number(id);

    setFavorites((prevFavorites) => {
        const updatedFavorites = prevFavorites.includes(movieId)
            ? prevFavorites.filter((favId) => favId !== movieId)
            : [...prevFavorites, movieId];

        localStorage.setItem(
            'favorites',
            JSON.stringify(updatedFavorites)
        );

        return updatedFavorites;
    });
};

const addMovie = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('http://localhost:5000/api/movies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...newMovie,
                rating: newMovie.rating ? Number(newMovie.rating) : null,
                release_year: newMovie.release_year ? Number(newMovie.release_year) : null,
                duration: newMovie.duration ? Number(newMovie.duration) : null
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Unable to add movie');
        }

        alert('Movie added successfully!');

        setNewMovie({
            title: '',
            genre: '',
            rating: '',
            release_year: '',
            description: '',
            duration: '',
            poster: ''
        });

        setShowAddForm(false);

        const moviesResponse = await fetch('http://localhost:5000/api/movies');
        const updatedMovies = await moviesResponse.json();
        setMovies(updatedMovies);

    } catch (err) {
        alert(err.message);
    }
};

    // Loading and error messages
    if (loading) {
        return <h2>Loading movies...</h2>;
    }

    if (error) {
        return <h2>Error: {error}</h2>;
    }

    // Search and genre filtering
    // Search, genre, and favorites filtering
const filteredMovies = movies.filter((movie) => {
    const matchesSearch = (movie.title || '')
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesGenre =
        selectedGenre === 'All' ||
        (movie.genre || '')
            .toLowerCase()
            .includes(selectedGenre.toLowerCase());

    const matchesFavorites =
        !showFavorites ||
        favorites.includes(Number(movie.id));

    return matchesSearch && matchesGenre && matchesFavorites;
});

    return (
        <div className="app">
            <h1>🎬 iMovies</h1>
            
<button onClick={() => setShowAddForm(!showAddForm)}>
    {showAddForm ? 'Cancel' : '+ Add New Movie'}
</button>

{showAddForm && (
    <form onSubmit={addMovie} className="add-movie-form">
        <h2>Add New Movie</h2>

        <input
            placeholder="Movie title"
            value={newMovie.title}
            onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
            required
        />

        <input
            placeholder="Genre"
            value={newMovie.genre}
            onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
            required
        />

        <input
            type="number"
            placeholder="Rating (0–10)"
            min="0"
            max="10"
            step="0.1"
            value={newMovie.rating}
            onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
        />

        <input
            type="number"
            placeholder="Release year"
            value={newMovie.release_year}
            onChange={(e) => setNewMovie({ ...newMovie, release_year: e.target.value })}
        />

        <input
            type="number"
            placeholder="Duration in minutes"
            value={newMovie.duration}
            onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
        />

        <input
            placeholder="Poster image URL (optional)"
            value={newMovie.poster}
            onChange={(e) => setNewMovie({ ...newMovie, poster: e.target.value })}
        />

        <textarea
            placeholder="Movie description"
            value={newMovie.description}
            onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
        />

        <button type="submit">Save Movie</button>
    </form>
)}

            <h2>Popular Movies</h2>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Search movies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                >
                    <option value="All">All Genres</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Action">Action</option>
                    <option value="Drama">Drama</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Crime">Crime</option>
                </select>
            </div>
<button onClick={() => setShowFavorites(!showFavorites)}>
    {showFavorites ? '🎬 All Movies' : '⭐ Favorites'}
</button>
            <div className="movie-container">
                {filteredMovies.length === 0 ? (
                    <p>No movies found.</p>
                ) : (
                    filteredMovies.map((movie) => (
                        <div className="movie-card" key={movie.id}>
                            <img
                                className="movie-poster"
                                src={
                                    movie.poster ||
                                    'https://placehold.co/300x450/242424/ffffff?text=No+Poster'
                                }
                                alt={movie.title}
                            />

                            <h3>{movie.title}</h3>
                            <p>Genre: {movie.genre}</p>
                            <p>Rating: ⭐ {movie.rating}</p>
                            <p>
                                Year: {movie.year || movie.release_year || 'N/A'}
                            </p>

                            <button onClick={() => viewMovie(movie.id)}>
                                View Details
                            </button>
                           <button onClick={() => toggleFavorite(movie.id)}>
    {favorites.includes(movie.id)
        ? '❤️ Remove Favorite'
        : '🤍 Add to Favorites'}
</button>
                           
                        </div>
                    ))
                )}
            </div>

         
{selectedMovie && (
    <div className="movie-modal">
        <div className="modal-content">
            <button
                className="close-button"
                onClick={() => setSelectedMovie(null)}
            >
                Close ✕
            </button>

            <img
                className="movie-poster"
                src={selectedMovie.poster || 'https://placehold.co/300x450/242424/ffffff?text=No+Poster'}
                alt={selectedMovie.title}
            />

            <h2>{selectedMovie.title}</h2>

            <p><strong>Genre:</strong> {selectedMovie.genre}</p>
            <p><strong>Rating:</strong> ⭐ {selectedMovie.rating}</p>
            <p><strong>Release Year:</strong> {selectedMovie.release_year || 'N/A'}</p>
            <p><strong>Duration:</strong> {selectedMovie.duration ? `${selectedMovie.duration} minutes` : 'N/A'}</p>
            <p><strong>Description:</strong> {selectedMovie.description || 'No description available.'}</p>
        </div>
    </div>
)}

        </div>
    );
}

export default App;
