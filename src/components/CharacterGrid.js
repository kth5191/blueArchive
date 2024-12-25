import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import StudentModal from './StudentModal';
import { 
  Button, CircularProgress, ButtonGroup, Popper, Grow, Paper, 
  MenuItem, MenuList, ClickAwayListener, useMediaQuery, useTheme
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { setCookie, getCookie } from '../utils/cookieUtils';
import './CharacterGrid.css';

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
  const [arOpen, setAROpen] = useState(false); // AR 드롭다운 상태

  const [isMultipleSelectionMode, setIsMultipleSelectionMode] = useState(false); // 다수 선택 모드
  const [lastSelectedStudent, setLastSelectedStudent] = useState(() => {
    return getCookie('lastSelectedStudent') || null;
  }); // 마지막으로 선택된 학생
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  const [numberOfStudentsToSelect, setNumberOfStudentsToSelect] = useState(2); // 다수 선택 시 학생 수
  const [numberOfStudentsToARSelect, setNumberOfStudentsToARSelect] = useState(2); // AR 다수 선택 시 학생 수

  const anchorRef = useRef(null); // 드롭다운 버튼 참조
  const arAnchorRef = useRef(null); // 드롭다운 버튼 참조

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
      setError('오류가 발생했습니다. 잠시만 기다려주세요.');
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

  // 모든 학생 중 단일 학생 랜덤 선택
  const selectAllRandomStudent = () => {
    if (students.length === 0) {
      alert('오류가 발생했습니다. 잠시만 기달려주세요.');
      return;
    }

    const student = students[Math.floor(Math.random() * students.length)];

    if (student) {
      setRandomStudent(student);
      setIsMultipleSelectionMode(false);
      setLastSelectedStudent(student.student_id.toString());
      setIsModalOpen(true);
    }
  };

  // 모든 학생 중 다수 학생 랜덤 선택
  const selectAllRandomStudents = () => {
    if (!students || students.length === 0) {
      console.error("No students available.");
      return;
    }
  
    // `studentsArray`에서 랜덤으로 ID를 선택
    const studentsArray = students.map((s) => s.student_id.toString());
    const newStudentIds = getRandomElements(studentsArray, numberOfStudentsToARSelect);
  
    // ID를 기반으로 학생 객체를 찾아 매핑
    const randomStudentObjects = newStudentIds
      .map((id) => students.find((s) => s.student_id.toString() === id))
      .filter(Boolean); // 유효하지 않은 객체 제거
  
    if (randomStudentObjects.length > 0) {
      setRandomStudents(randomStudentObjects);
      setIsMultipleSelectionMode(true);
      setIsModalOpen(true);
    } else {
      console.error("No random students found.");
    }
  };
  

  // 배열에서 랜덤으로 N개의 요소 선택
  const getRandomElements = (array, n) => {
    if (n > array.length) {
      console.warn("Requested more elements than available in the array.");
      n = array.length; // 요청된 개수가 배열 크기를 초과하지 않도록 제한
    }
  
    const shuffled = [...array]; // 원본 배열을 복사
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]]; // 요소 교환
    }
  
    return shuffled.slice(0, n); // 상위 N개의 요소 반환
  };

  // 드롭다운 메뉴 아이템 클릭
  const handleMenuItemClick = (event, index) => {
    setNumberOfStudentsToSelect(index + 2);
    setOpen(false);
  };

  // AR드롭다운 메뉴 아이템 클릭
  const handleMenuARItemClick = (event, index) => {
    setNumberOfStudentsToARSelect(index + 2);
    setAROpen(false);
  };

  // 드롭다운 열기/닫기 토글
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  // 드롭다운 열기/닫기 토글
  const handleARToggle = () => {
    setAROpen((prevOpen) => !prevOpen);
  };

  // 드롭다운 닫기
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  // 드롭다운 닫기
  const handleARClose = (event) => {
    if (arAnchorRef.current && arAnchorRef.current.contains(event.target)) {
      return;
    }
    setAROpen(false);
  };

  // 선택된 학생만 보기
  const filteredStudents = showSelected
    ? students.filter((student) => selectedStudents.has(student.student_id.toString()))
    : students;

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <div className="error-grid">
        <p>{error}</p>
        <p>
          계속해서 오류가 발생 시 이쪽으로 신고해주시기 바랍니다.{' '}
          <a
            href="https://naver.me/GNWSIlCm"
            target="_blank"
            rel="noopener noreferrer"
            className="href-link"
          >
            Feedback
          </a>
        </p>
      </div>
    );
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

        <Button
          onClick={selectAllRandomStudent}
          variant="contained"
          color="primary"
          disabled={students.length === 0 || isLoading}
        >
          All Random(단일)
        </Button>

        <ButtonGroup
          className="buttonGroup-container"
          variant="contained"
          color="primary"
          ref={arAnchorRef}
          aria-label="split button"
        >
          <Button onClick={selectAllRandomStudents}>All Random ({numberOfStudentsToARSelect}명)</Button>
          <Button
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="menu"
            onClick={handleARToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>

        {/* 드롭다운 메뉴 */}
        <Popper open={arOpen} anchorEl={arAnchorRef.current} role={undefined} transition disablePortal placement="top-start" style={{ zIndex: 1300 }}>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleARClose}>
                  <MenuList id="split-button-menu">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((option, index) => (
                      <MenuItem
                        key={option}
                        selected={option === numberOfStudentsToARSelect}
                        onClick={(event) => handleMenuARItemClick(event, index)}
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

      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isMultipleSelectionMode={isMultipleSelectionMode}
        randomStudents={randomStudents}
        randomStudent={randomStudent}
      />

      <div className="href-container">
        <a 
          href="https://naver.me/GNWSIlCm" 
          target="_blank" 
          rel="noopener noreferrer"
          className="href-link"
        >
          Feedback
        </a>

        <a 
          href="https://burly-lobster-097.notion.site/17023e52a66b49bc88f7ce103901042a?v=67f48e866fe140acaefdc2eec49fcd6b&pvs=4" 
          target="_blank" 
          rel="noopener noreferrer"
          className="href-link"
        >
          이슈 보드
        </a>
      </div>

    </div>

    
  );
}

export default CharacterGrid;
