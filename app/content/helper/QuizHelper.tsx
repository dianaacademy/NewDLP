import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ChapterDetails, QuizQuestion } from './Types';

interface Option {
  option: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  hint: string;
  options: Option[];
}

interface QuizHelperProps {
  details: {
    questions: QuizQuestion[];
  };
}

const QuizHelper: React.FC<QuizHelperProps> = ({ details }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Access questions from details instead of content
  const questions = details?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = (optionIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      const selectedOptionIndex = selectedAnswers[index];
      if (selectedOptionIndex !== undefined && question.options[selectedOptionIndex].isCorrect) {
        score++;
      }
    });
    return score;
  };

  const handleNext = () => {
    if (selectedAnswers[currentQuestionIndex] === undefined) {
      Alert.alert('Please select an answer before proceeding');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowHint(false);
    } else {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowHint(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setShowHint(false);
  };

  if (showResult) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Quiz Complete!</Text>
        <Text style={styles.scoreText}>
          You scored: {score}/{questions.length} ({percentage.toFixed(1)}%)
        </Text>
        
        {questions.map((question, index) => (
          <View key={index} style={styles.resultQuestionContainer}>
            <Text style={styles.resultQuestion}>Q{index + 1}: {question.question}</Text>
            <Text style={[
              styles.resultAnswer,
              {
                color: question.options[selectedAnswers[index]]?.isCorrect 
                  ? '#4CAF50' 
                  : '#F44336'
              }
            ]}>
              Your answer: {question.options[selectedAnswers[index]]?.option}
              {question.options[selectedAnswers[index]]?.isCorrect 
                ? ' ✓' 
                : ' ✗'}
            </Text>
            <Text style={styles.correctAnswer}>
              Correct answer: {question.options.find(opt => opt.isCorrect)?.option}
            </Text>
          </View>
        ))}
        
        <TouchableOpacity style={styles.retryButton} onPress={resetQuiz}>
          <Text style={styles.buttonText}>Retry Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {questions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index === currentQuestionIndex 
                  ? '#2196F3' 
                  : index < currentQuestionIndex 
                    ? '#4CAF50' 
                    : '#E0E0E0'
              }
            ]}
          />
        ))}
      </View>

      <Text style={styles.questionNumber}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </Text>

      <Text style={styles.questionText}>{currentQuestion?.question}</Text>

      {currentQuestion?.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            selectedAnswers[currentQuestionIndex] === index && styles.selectedOption
          ]}
          onPress={() => handleSelectOption(index)}
        >
          <Text style={[
            styles.optionText,
            selectedAnswers[currentQuestionIndex] === index && styles.selectedOptionText
          ]}>
            {option.option}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={styles.hintButton} 
        onPress={() => setShowHint(!showHint)}
      >
        <Text style={styles.hintButtonText}>
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </Text>
      </TouchableOpacity>

      {showHint && (
        <Text style={styles.hintText}>{currentQuestion?.hint}</Text>
      )}

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  questionNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'outfit',
  },
  questionText: {
    fontSize: 20,
    marginBottom: 24,
    fontFamily: 'outfit-bold',
  },
  optionButton: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'outfit',
  },
  selectedOptionText: {
    color: '#FFF',
  },
  hintButton: {
    alignSelf: 'center',
    marginVertical: 16,
  },
  hintButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontFamily: 'outfit',
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'outfit',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  navButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'outfit',
  },
  resultContainer: {
    flex: 1,
    padding: 16,
  },
  resultTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'outfit-bold',
  },
  scoreText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
    color: '#2196F3',
    fontFamily: 'outfit',
  },
  resultQuestionContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  resultQuestion: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'outfit-bold',
  },
  resultAnswer: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'outfit',
  },
  correctAnswer: {
    fontSize: 14,
    color: '#4CAF50',
    fontFamily: 'outfit',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
});

export default QuizHelper;