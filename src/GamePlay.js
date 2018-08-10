import React, {Component} from 'react';
import Question from './Question';
import CorrectAnswer from './CorrectAnswer';
import IncorrectAnswer from './IncorrectAnswer';
import axios from 'axios';

const QUESTIONSTATE = {
  QUESTION: 0,
  CORRECT: 1,
  INCORRECT: 2
}

class GamePlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [],
      gameState: QUESTIONSTATE.QUESTION,
      currentQuestionIndex: 0,
    }
    this.gameStatus = {
      correct_answers: 0,
      incorrect_answers: 0,
      points: 0,
      max_points: 0
    }
    this.answerChecked = this.answerChecked.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.addFavorite = this.addFavorite.bind(this);
    this.getQuestionsFromAPI = this.getQuestionsFromAPI.bind(this);
  }

  componentDidMount() {
    if (this.props.favGame) {
      this.getFavoriteQuestions();
    } else {
      this.getQuestionsFromAPI();
    }
  }

  getFavoriteQuestions() {
    let url = `http://localhost:3001/users/${this.props.user._id}/questions`;
    axios.get(url)
    .then(res => res.data)
    .then(questions => this.setState({questions}));
  }

  getQuestionsFromAPI() {
    const {num_questions, category, difficulty, type} = this.props.instructions;
    console.log(num_questions, category, difficulty, type);
    const url = `https://opentdb.com/api.php?amount=${num_questions}&category=${category}&difficulty=${difficulty}&type=${type}`;
    axios.get(url)
    .then(res => res.data)
    .then(data => data.results)
    .then(questions => this.setState({questions}));
  }


  addFavorite(ques) {
    let url = `http://localhost:3001/users/${this.props.user._id}/questions`;
    axios.post(url, {
      question: ques.question,
      incorrect_answers: ques.incorrect_answers,
      correct_answer: ques.correct_answer
    })
    .then(res => res.data)
    .then(data => console.log("Successfully Added to Favorites"))
    .catch(err => console.log(err));
  }

  answerChecked(gotRight) {
    this.setState({gameState: (gotRight ? QUESTIONSTATE.CORRECT : QUESTIONSTATE.INCORRECT)});
    if(gotRight) {
      this.gameStatus.correct_answers += 1;
      this.gameStatus.points += 10;
    } else {
      this.gameStatus.incorrect_answers += 1;
      this.gameStatus.points -= 5;
    }
  }

  nextQuestion() {
    const {questions, currentQuestionIndex} = this.state;
    if (currentQuestionIndex === questions.length - 1) {
      this.gameStatus.max_points = this.state.questions.length * 10;
      this.props.gameOver(this.gameStatus);
    } else {
      this.setState(prevState => ({
        currentQuestionIndex: prevState.currentQuestionIndex + 1,
        gameState: QUESTIONSTATE.QUESTION
      }));
    }
  }

  render() {
    const {gameState, questions, currentQuestionIndex} = this.state;
    let componentToRender;
    const currentQuestion = questions[currentQuestionIndex];
    switch(gameState) {
      case QUESTIONSTATE.QUESTION:
        componentToRender = <Question addFavorite={this.addFavorite} answerChecked={this.answerChecked} ques={currentQuestion} />;
        break;
      case QUESTIONSTATE.CORRECT:
        componentToRender = <CorrectAnswer nextQuestion={this.nextQuestion} answer={currentQuestion.correct_answer}/>;
        break;
      case QUESTIONSTATE.INCORRECT:
        componentToRender = <IncorrectAnswer nextQuestion={this.nextQuestion} answer={currentQuestion.correct_answer}/>
        break;
      default:
        // NOT POSSIBLE
    }
    return (
      <div>
        {componentToRender}
      </div>
    );
  }
}

export default GamePlay;
