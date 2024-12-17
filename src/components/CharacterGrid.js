import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Button, Dialog, DialogContent, DialogTitle, IconButton, 
  CircularProgress, ButtonGroup, Popper, Grow, Paper, 
  MenuItem, MenuList, ClickAwayListener, useMediaQuery, useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { setCookie, getCookie } from '../utils/cookieUtils';

function CharacterGrid() {
  // State variables
  const [students, setStudents] = useState([]); // 전체 학생 리스트
  const [selectedStudents, setSelectedStudents] = useState(() => {
    const savedStudents = getCookie('selectedStudents');
    return new Set(savedStudents || []);
  }); // 선택된 학생들
  const [showSelected, setShowSelected] = useState(false); // 선택된 학생만 보기 토글
  const [randomStudent, setRandomStudent] = useState(null); // 랜덤으로 선택된 학생
  const [randomStudents, setRandomStudents] = useState([]); // 다수 랜덤으로 선택된 학생들
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [open, setOpen] = useState(false); // 드롭다운 상태
  const [isMultipleSelectionMode, setIsMultipleSelectionMode] = useState(false); // 다수 선택 모드
  const [lastSelectedStudent, setLastSelectedStudent] = useState(() => {
    return getCookie('lastSelectedStudent') || null;
  }); // 마지막으로 선택된 학생
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [numberOfStudentsToSelect, setNumberOfStudentsToSelect] = useState(2); // 다수 선택 시 학생 수
  const anchorRef = useRef(null); // 드롭다운 버튼 참조
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 학생 데이터 가져오기
  useEffect(() => {
    fetchStudents();
  }, []);

  // `selectedStudents` 쿠키 업데이트
  useEffect(() => {
    setCookie('selectedStudents', Array.from(selectedStudents), {
      expires: new Date('2038-01-19T03:14:07Z'),
      path: '/',
    });
  }, [selectedStudents]);

  // `lastSelectedStudent` 쿠키 업데이트
  useEffect(() => {
    if (lastSelectedStudent) {
      setCookie('lastSelectedStudent', lastSelectedStudent, {
        expires: new Date('2038-01-19T03:14:07Z'),
        path: '/',
      });
    }
  }, [lastSelectedStudent]);

  // 학생 데이터를 API에서 가져옴
  const fetchStudents = async () => {
    try {
      const response = await axios.get('https://holy-willow-kdhcompany-277b699c.koyeb.app/api/students');
      setStudents(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students. Please try again later.');
      setIsLoading(false);
    }
  };

  // 학생 선택 토글
  const toggleStudent = (id) => {
    setSelectedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 단일 학생 랜덤 선택
  const selectRandomStudent = () => {
    let selectedArray = Array.from(selectedStudents);

    if (selectedStudents.size >= 2) {
      selectedArray = selectedArray.filter((id) => id !== lastSelectedStudent);
    }

    if (selectedArray.length > 0) {
      const randomId = selectedArray[Math.floor(Math.random() * selectedArray.length)];
      const student = students.find((s) => s.student_id.toString() === randomId);

      if (student) {
        setRandomStudent(student);
        setIsMultipleSelectionMode(false);
        setLastSelectedStudent(student.student_id.toString());
        setIsModalOpen(true);
      }
    }
  };

  // 다수 학생 랜덤 선택
  const selectRandomStudents = () => {
    const selectedArray = Array.from(selectedStudents);

    if (selectedArray.length === 0) {
      alert('선택된 학생이 없습니다.');
      return;
    }

    if (selectedArray.length < numberOfStudentsToSelect) {
      alert(`선택된 학생 수(${selectedArray.length})가 선택할 학생 수(${numberOfStudentsToSelect})보다 적습니다.`);
      return;
    }

    const newSelectedStudents = getRandomElements(selectedArray, numberOfStudentsToSelect);
    const selectedStudentObjects = newSelectedStudents.map((id) =>
      students.find((s) => s.student_id.toString() === id)
    );

    setRandomStudents(selectedStudentObjects);
    setIsMultipleSelectionMode(true);
    setIsModalOpen(true);
  };

  // 배열에서 랜덤으로 N개의 요소 선택
  const getRandomElements = (array, n) => {
    return array.sort(() => 0.5 - Math.random()).slice(0, n);
  };

  // 드롭다운 메뉴 아이템 클릭
  const handleMenuItemClick = (event, index) => {
    setNumberOfStudentsToSelect(index + 2);
    setOpen(false);
  };

  // 드롭다운 열기/닫기 토글
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  // 드롭다운 닫기
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  // 선택된 학생만 보기
  const filteredStudents = showSelected
    ? students.filter((student) => selectedStudents.has(student.student_id.toString()))
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

      {/* 버튼 그룹 */}
      <div className="button-container">
        <Button
          onClick={() => setShowSelected(!showSelected)}
          variant={showSelected ? 'contained' : 'outlined'}
        >
          {showSelected ? '모든 학생 보기' : '보유 학생만 보기'}
        </Button>

        <Button
          onClick={selectRandomStudent}
          disabled={selectedStudents.size === 0}
          variant="contained"
          color="primary"
        >
          당번 정하기
        </Button>

        <ButtonGroup
          className="buttonGroup-container"
          variant="contained"
          color="primary"
          ref={anchorRef}
          aria-label="split button"
        >
          <Button onClick={selectRandomStudents}>당번 {numberOfStudentsToSelect}명 정하기</Button>
          <Button
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>

        {/* 드롭다운 메뉴 */}
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal placement="top-start" style={{ zIndex: 1300 }}>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((option, index) => (
                      <MenuItem
                        key={option}
                        selected={option === numberOfStudentsToSelect}
                        onClick={(event) => handleMenuItemClick(event, index)}
                      >
                        {option}명
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>

      {/* 학생 리스트 */}
      <div className="grid-container">
        {filteredStudents.map((student) => (
          <div
            key={student.student_id}
            className={`character-item ${
              selectedStudents.has(student.student_id.toString()) ? 'selected' : ''
            } ${student.student_id.toString() === lastSelectedStudent ? 'last-selected' : ''}`}
            onClick={() => toggleStudent(student.student_id.toString())}
          >
            <img src={`${student.thumbnail1}.webp`} alt={student.name} />
            <div className="character-name">{student.name}</div>
          </div>
        ))}
      </div>

      {/* 모달 */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            width: '1280px',
            maxWidth: 'none',
            height: '860px',
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
          {isMultipleSelectionMode ? (
            <div 
              className="grid-container" 
              style={{display: 'grid', gridTemplateColumns: 'repeat(5, 150px)', gap: '20px', justifyContent: 'center', alignItems: 'center', margin: '0 auto', padding: '50px', maxWidth: '800px'}}
            >
              {randomStudents.map((student) => (
                <div
                  key={student.student_id}
                  className={`character-item ${
                    selectedStudents.has(student.student_id.toString()) ? 'selected' : ''
                  }`}
                >
                  <img src={`${student.thumbnail1}.webp`} alt={student.name} />
                  <div className="character-name">{student.name}</div>
                </div>
              ))}
            </div>
          ) : (
            randomStudent && (
              <div className="random-character">
                
                <img src={`${isMobile ? randomStudent.thumbnail1 : randomStudent.thumbnail2}.webp`} alt={randomStudent.name} 
                  style={{
                    width: isMobile ? '100px' : auto,
                    height: isMobile ? '100px' : auto
                }}/>
                <p>{randomStudent.name}</p>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CharacterGrid;
