import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:5000'; // Your Flask backend URL

function Voting() {
    const [restaurants, setRestaurants] = useState([]);

    const fetchRestaurants = async () => {
        try {
            const response = await fetch(`${API_URL}/api/restaurants`);
            const data = await response.json();
            setRestaurants(data);
        } catch (error) {
            console.error("Error fetching restaurants:", error);
        }
    };

    const handleVote = async (id) => {
        try {
            await fetch(`${API_URL}/api/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });
            fetchRestaurants(); // Fetch new restaurants after voting
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    return (
        <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
            <h1>Which restaurant do you prefer?</h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {restaurants.map((restaurant) => (
                    <div
                        key={restaurant.id}
                        onClick={() => handleVote(restaurant.id)}
                        style={{
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            borderRadius: '10px',
                            padding: '20px',
                            width: '320px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <h2>{restaurant.name}</h2>
                        <p><strong>Cuisine:</strong> {restaurant.cuisine || 'Unknown'}</p>
                        <p><strong>Location:</strong> {restaurant.city}, {restaurant.region}</p>
                        <p><strong>Price:</strong> {restaurant.price || 'N/A'}</p>
                    </div>
                ))}
            </div>
            <Link
                to="/leaderboard"
                style={{
                    display: 'inline-block',
                    marginTop: '30px',
                    fontSize: '18px',
                    textDecoration: 'none',
                    color: '#007bff',
                }}
            >
                View Leaderboard
            </Link>
        </div>
    );
}

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`${API_URL}/api/leaderboard`);
                const data = await response.json();
                setLeaderboard(data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
            <h1>Top Restaurants</h1>
            <ol style={{ listStyleType: 'none', padding: 0 }}>
                {leaderboard.map((entry, index) => (
                    <li key={entry.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', marginRight: '20px' }}>{index + 1}</span>
                        <span style={{ fontSize: '20px', flexGrow: 1, textAlign: 'left' }}>{entry.name}</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{entry.score} points</span>
                    </li>
                ))}
            </ol>
            <Link to="/" style={{ display: 'block', marginTop: '30px', fontSize: '18px' }}>Back to Voting</Link>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Voting />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
        </Router>
    );
}

export default App;
