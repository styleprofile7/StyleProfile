import React, { useState } from 'react';
import './Quiz.css';

const quizData = [
  {
    question: "What's your favorite style?",
    options: ["Minimalist", "Streetwear", "Avant-garde", "Boho"],
  },
  {
    question: "Pick a color palette:",
    options: ["Neutral", "Bright", "Pastel", "Dark"],
  },
  {
    question: "Go-to accessory?",
    options: ["Hat", "Necklace", "Sunglasses", "Bracelet"],
  },
];

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (currentQuestion + 1 < quizData.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="quiz-container">
      {showResult ? (
        <div className="result">
          Thanks for completing the quiz!
        </div>
      ) : (
        <>
          <div className="quiz-header">{quizData[currentQuestion].question}</div>
          <div className="answers">
            {quizData[currentQuestion].options.map((option) => (
              <button
                key={option}
                className={`answer-button ${selectedOption === option ? "selected" : ""}`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <button 
            className="next-button"
            onClick={handleNext}
            disabled={!selectedOption}
          >
            Next
          </button>
        </>
      )}
    </div>
  );
}

export default Quiz;
