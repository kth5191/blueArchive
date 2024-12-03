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
    let selectedArray = [];
  
    // selectedStudents에 2명 이상 있는 경우, lastSelectedStudent를 제외한 배열 생성
    if (selectedStudents.size >= 2) {
      selectedArray = Array.from(selectedStudents).filter(
        (id) => id !== lastSelectedStudent
      );
    } else {
      // 그렇지 않은 경우 selectedStudents 배열을 그대로 사용
      selectedArray = Array.from(selectedStudents);
    }
  
    // 랜덤으로 학생 ID 선택
    if (selectedArray.length > 0) {
      const randomId = selectedArray[Math.floor(Math.random() * selectedArray.length)];
      const student = students.find((s) => s.student_id.toString() === randomId);
  
      // 학생이 존재할 경우 상태 업데이트
      if (student) {
        setRandomStudent(student); // 랜덤으로 선택된 학생 상태 업데이트
        setLastSelectedStudent(student.student_id.toString()); // 마지막 선택된 학생 ID 업데이트
        setIsModalOpen(true); // 모달을 열어 선택된 학생을 표시
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
          </div>
        ))}
      </div>
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            width: '1280px',
            maxWidth: 'none', // 최대 너비 제한을 없앰
            height: '800px',
          },
        }}
        >
        <DialogTitle 
          sx={{ 
            m: 0, 
            p: 2, 
            textAlign: 'center', 
            position: 'relative',
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          }}
        >
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
            <div className="random-character">
              <img src={randomStudent.thumbnail2+".webp"} alt={randomStudent.name} />
              <p>{randomStudent.name}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CharacterGrid;

