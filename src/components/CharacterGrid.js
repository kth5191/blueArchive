import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { setCookie, getCookie } from '../utils/cookieUtils';

function CharacterGrid() {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(() => {
    const savedStudents = getCookie('selectedStudents');
    return new Set(savedStudents || []);
  });
  const [showSelected, setShowSelected] = useState(false);
  const [randomStudent, setRandomStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSelectedStudent, setLastSelectedStudent] = useState(() => {
    return getCookie('lastSelectedStudent') || null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    setCookie('selectedStudents', Array.from(selectedStudents));
  }, [selectedStudents]);

  useEffect(() => {
    if (lastSelectedStudent) {
      setCookie('lastSelectedStudent', lastSelectedStudent);
    }
  }, [lastSelectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      setStudents(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students. Please try again later.');
      setIsLoading(false);
    }
  };

  const toggleStudent = (id) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectRandomStudent = () => {
    const selectedArray = Array.from(selectedStudents).filter(id => id !== lastSelectedStudent);
    if (selectedArray.length > 0) {
      const randomId = selectedArray[Math.floor(Math.random() * selectedArray.length)];
      const student = students.find(s => s.student_id.toString() === randomId);
      if (student) {
        setRandomStudent(student);
        setLastSelectedStudent(student.student_id.toString());
        setIsModalOpen(true);
      }
    }
  };

  const filteredStudents = showSelected
    ? students.filter(student => selectedStudents.has(student.student_id.toString()))
    : students;

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="student-grid">
      <h1>학생 리스트</h1>
      <div className="button-container">
        <Button 
          onClick={() => setShowSelected(!showSelected)}
          variant={showSelected ? "contained" : "outlined"}
        >
          {showSelected ? "모든 학생 보기" : "보유 학생만 보기"}
        </Button>
        <Button 
          onClick={selectRandomStudent}
          disabled={selectedStudents.size === 0}
          variant="contained"
          color="primary"
        >
          당번 정하기
        </Button>
      </div>
      <div className="grid-container">
        {filteredStudents.map((student) => (
          <div
            key={student.student_id}
            className={`character-item ${selectedStudents.has(student.student_id.toString()) ? 'selected' : ''} ${student.student_id.toString() === lastSelectedStudent ? 'last-selected' : ''}`}
            onClick={() => toggleStudent(student.student_id.toString())}
          >
            <img src={student.thumbnail1+".webp"} alt={student.name} />
            <div className="character-name">{student.name}</div>
            {student.student_id.toString() === lastSelectedStudent && <div className="last-selected-indicator">마지막 당번</div>}
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
          {randomStudent && (
            <div className="random-student">
              <img src={randomStudent.thumbnail2} alt={randomStudent.name} />
              <p>{randomStudent.name}</p>
              <p>생일: {randomStudent.birth_date}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CharacterGrid;

