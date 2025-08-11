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

<p className="progress">
  Question {currentIndex + 1} of {questions.length}
</p>

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
<button
  className="restart-button"
  onClick={() => {
    setCurrentIndex(0);
    setScores({});
    setShowResults(false);
  }}
>
  Retake Quiz
</button>
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

<p className="description">{personalityDescriptions[topPersonality]}</p>

const personalityDescriptions = {
  "1 PERCENTER": `Your life is the epitome of luxury, success, and elegance. Keeping this in mind, you know you must find pieces with not only external beauty, but future increased value. However, tradition is king and fashion codes that represent the traditions of wealth are what you want and must have. Cheers!`,
  INFLUENCERS: `Hopefully you go viral in any of these fits so the world knows you’re draped up and dripped out. You have to stay on trend so might even be good to tell your stylist to check here. You love the most popular fit and who would blame you; why not when you can buy it.`,
  CREATIVE: `You strive for individuality and to release your creative energy to the world. The clothes you wear matter but they don’t have to be expensive. Everything must have YOU in it.`,
  "HOODS FINEST": `Where you get your money from nobody knows but you are certainly contributing to the economy. Oversized fits and flashy accessories are a must. Something crazy on your feet is a need.`,
  "RICH HOUSEWIFE": `While close to the one percenter, the rich housewife has many luxuries and freedoms which allow for more expressions. More colorful and experimental silhouettes with this persona and want to focus on finding garments and brands that you love and will grow with. No need to worry about budgets tho. Cheers!`,
  EXECUTIVE: `You must exemplify reliability and respect, your decisions affect numerous departments and agencies. Your suits and quiet luxury exude somewhat of a 1 percenter perspective but you are not there just yet. So dress well, smell good, and handle business.`,
  "9TO5ER": `Work hard Chill hard. Life gets hard but you still want to look good. So you find the sale items and bang for your bucks and every now and then there is a piece you have to have. Nothing wrong with that and matter of fact clothes are the best way for the 9TO5SER to gain control.`,
  ALT: `You are not like everyone else, you’re ALT. Like creatives, you express your individuality but that creativity is put towards rebellion. The systems and powers are oppressors and your clothes will relay the freedom you feel inside. Grunge, punk, and everything anti are the best descriptors of your style and persona.`,
};

export default Quiz;
