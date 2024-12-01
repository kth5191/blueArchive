import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { setCookie, getCookie } from '../utils/cookieUtils';
import characters from '../data/characterData';

function CharacterGrid() {
  const [selectedCharacters, setSelectedCharacters] = useState(() => {
    const savedCharacters = getCookie('selectedCharacters');
    return new Set(savedCharacters || []);
  });
  const [showSelected, setShowSelected] = useState(false);
  const [randomCharacter, setRandomCharacter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSelectedCharacter, setLastSelectedCharacter] = useState(() => {
    return getCookie('lastSelectedCharacter') || null;
  });

  useEffect(() => {
    setCookie('selectedCharacters', Array.from(selectedCharacters));
  }, [selectedCharacters]);

  useEffect(() => {
    if (lastSelectedCharacter) {
      setCookie('lastSelectedCharacter', lastSelectedCharacter);
    }
  }, [lastSelectedCharacter]);

  const toggleCharacter = (id) => {
    setSelectedCharacters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectRandomCharacter = () => {
    const selectedArray = Array.from(selectedCharacters).filter(id => id !== lastSelectedCharacter);
    if (selectedArray.length > 0) {
      const randomId = selectedArray[Math.floor(Math.random() * selectedArray.length)];
      const character = characters.find(c => c.id === randomId);
      if (character) {
        setRandomCharacter(character);
        setLastSelectedCharacter(character.id);
        setIsModalOpen(true);
      }
    }
  };

  const filteredCharacters = showSelected
    ? characters.filter(character => selectedCharacters.has(character.id))
    : characters;

  return (
    <div className="character-grid">
      <h1>학생 리스트</h1>
      <div className="button-container">
        <Button 
          onClick={() => setShowSelected(!showSelected)}
          variant={showSelected ? "contained" : "outlined"}
        >
          {showSelected ? "모든 학생 보기" : "보유 학생만 보기"}
        </Button>
        <Button 
          onClick={selectRandomCharacter}
          disabled={selectedCharacters.size === 0}
          variant="contained"
          color="primary"
        >
          당번 정하기
        </Button>
      </div>
      <div className="grid-container">
        {filteredCharacters.map((character) => (
          <div
            key={character.id}
            className={`character-item ${selectedCharacters.has(character.id) ? 'selected' : ''} ${character.id === lastSelectedCharacter ? 'last-selected' : ''}`}
            onClick={() => toggleCharacter(character.id)}
          >
            <img src={`${character.imageUrl}.webp`} alt={character.name} />
            <div className="character-name">{character.name}</div>
            {character.id === lastSelectedCharacter && <div className="last-selected-indicator">마지막 당번</div>}
          </div>
        ))}
      </div>
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          오늘의 당번
          <IconButton
            aria-label="close"
            onClick={() => setIsModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {randomCharacter && (
            <div className="random-character">
              <img src={`${randomCharacter.imageUrl}.webp`} alt={randomCharacter.name} />
              <p>{randomCharacter.name}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CharacterGrid;

