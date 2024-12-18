import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './StudentModal.css';

function StudentModal({ isOpen, onClose, isMultipleSelectionMode, randomStudents, randomStudent }) {

    return (
        <Dialog open={isOpen} onClose={onClose} className="student-modal">
            <DialogTitle className="student-modal-title">
                오늘의 당번
                <IconButton
          aria-label="close"
          onClick={onClose}
          className="student-modal-close-button"
        >
          <CloseIcon />
        </IconButton>
            </DialogTitle>
            <DialogContent>
                {isMultipleSelectionMode ? (
                    <div className="student-modal-grid">
                        {randomStudents.map((student) => (
                            <div key={student.student_id} className="character-items">
                                <img src={`${student.thumbnail1}.webp`} alt={student.name} />
                                <div className="character-name">{student.name}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    randomStudent && (
                        <div className="random-character">
                            <img
                                src={`${ randomStudent.thumbnail2}.webp`}
                                alt={randomStudent.name}
                            />
                            <p>{randomStudent.name}</p>
                        </div>
                    )
                )}
            </DialogContent>
        </Dialog>
    );
}

export default StudentModal;

