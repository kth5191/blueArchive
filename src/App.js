import React from 'react';
import { CookiesProvider } from 'react-cookie';
import CharacterGrid from './components/CharacterGrid';
import './App.css';

function App() {
  return (
    <div className="App">
      <CharacterGrid />
    </div>
  );
}

export default App;

