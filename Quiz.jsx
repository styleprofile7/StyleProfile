import './Quiz.css';

import React, { useState } from 'react';
import './Quiz.css';  

// Fashion personalities keys to show at the end, 8 for now
const personalities = {
  onePercenter: "1 PERCENTER",
  influencer: "INFLUENCERS",
  creative: "CREATIVE",
  hoodsFinest: "HOODS FINEST",
  richHousewife: "RICH HOUSEWIFE",
  executive: "EXECUTIVE",
  nineToFive: "9TO5ER",
  alt: "ALT",
};

// Questions with answers, each answer adds points to one or more personalities, results will show the most likely personality type for the quiz taker
const questions = [
  {
    id: 1,
    text: "Which vibe best describes your fashion style?",
    answers: [
      { text: "Luxury and tradition", scores: { onePercenter: 2, richHousewife: 1, executive: 1 } },
      { text: "Trendy and viral", scores: { influencer: 2 } },
      { text: "Creative and unique", scores: { creative: 2, alt: 1 } },
      { text: "Streetwear and flashy", scores: { hoodsFinest: 2 } },
      { text: "Colorful and experimental", scores: { richHousewife: 2 } },
      { text: "Professioand reliable", scores: { executive: 2, nineToFive: 1 } },
      { text: "Practical and budget conscious", scores: { nineToFive: 2 } },
      { text: "Rebellious and anti-system", scores: { alt: 2 } },
    ],
  },
 {
    id: 2,
    text: "What’s your go-to accessory?",
    answers: [
      { text: "Classic luxury watch", scores: { onePercenter: 2, executive: 1 } },
      { text: "Statement sneakers", scores: { hoodsFinest: 2, influencer: 1 } },
      { text: "DIY or handmade pieces", scores: { creative: 2 } },
      { text: "Bold jewelry and colors", scores: { richHousewife: 2 } },
      { text: "Minimal and practical", scores: { nineToFive: 2 } },
      { text: "Edgy punk accessories", scores: { alt: 2 } },
    ],
  },
  //I'll add more questions
];

function Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentIndex];

  
  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswerIndex(answerIndex);
  };

 
  const handleNext = () => {
    if (selectedAnswerIndex === null) return; 


    const answerScores = currentQuestion.answers[selectedAnswerIndex].scores;
    const newScores = { ...scores };

    Object.keys(answerScores).forEach(key => {
      newScores[key] = (newScores[key] || 0) + answerScores[key];
    });

    setScores(newScores);
    setSelectedAnswerIndex(null);

  
    if (currentIndex === questions.length - 1) {
      setShowResults(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };
  const getTopPersonality = () => {
    if (!scores || Object.keys(scores).length === 0) return null;
    const top = Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a));
    return personalities[top[0]];
  };

  if (showResults) {
    const topPersonality = getTopPersonality();
    return (
      <div className="quiz-container">
        <h2>Your Fashion Personality Result:</h2>
        <p className="result">{topPersonality || "No result"}</p>
        <button onClick={() => {
          setCurrentIndex(0);
          setScores({});
          setShowResults(false);
        }}>
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h2 className="quiz-header">{currentQuestion.text}</h2>
      <div className="answers">
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={index}
            className={selectedAnswerIndex === index ? "answer-button selected" : "answer-button"}
            onClick={() => handleAnswerSelect(index)}
          >
            {answer.text}
          </button>
        ))}
      </div>
      <button
        className="next-button"
        onClick={handleNext}
        disabled={selectedAnswerIndex === null}
      >
        {currentIndex === questions.length - 1 ? "See Results" : "Next"}
      </button>
    </div>
  );
}

export default Quiz;
