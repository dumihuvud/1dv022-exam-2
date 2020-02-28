import { templateRef_ } from './templates.js'

/**
 * Custom element. Quiz game. Refactored.
 * A different approach to handle DOM
 * Using CSS to display elements instead of rendering and rerendering DOM
 * @module templates is used to store html templates
 * @var this.nextURL is used to save the link to next question from the server
 * @class QuizGame
 * @extends (window.HTMLElement)
 */
export class QuizGameRef extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(templateRef_.content.cloneNode(true))

    this.scoreBoard = this.shadowRoot.querySelector('.score-board')
    this.pScore = this.shadowRoot.querySelector('#p-score')
    this.scoreList = this.shadowRoot.querySelector('#score-list')

    this.constainerStart = this.shadowRoot.querySelector('.container-start')
    this.startForm = this.shadowRoot.querySelector('#username')
    this.startBtn = this.shadowRoot.querySelector('#start')

    this.quiz = this.shadowRoot.querySelector('.quiz')
    this.quizQuestion = this.shadowRoot.querySelector('.quiz-question')
    this.pQuestion = this.shadowRoot.querySelector('#question')

    this.btns = this.shadowRoot.querySelector('.btns')

    this.answerInput = this.shadowRoot.querySelector('#answerInput')
    this.answerBtn = this.shadowRoot.querySelector('#answerBtn')

    this.responseDiv = this.shadowRoot.querySelector('.response')
    this.nextQBtn = this.shadowRoot.querySelector('#next-question')
    this.pAnswer = this.shadowRoot.querySelector('#message-response')

    this.spanTotal = this.shadowRoot.querySelector('#total-time')
    this.spanTimeLeft = this.shadowRoot.querySelector('#time-left')

    this.restartDiv = this.shadowRoot.querySelector('.restart-quiz')
    this.restartBtn = this.shadowRoot.querySelector('#restart-btn')
    this.restartBtnScore = this.shadowRoot.querySelector('#restart-btn-score')

    this.nextURL = 'http://vhost3.lnu.se:20080/question/1'
    this.players = []
    this.timeLeft = 10
    this.totalTime = 0
    this.countTime = setTimeout(args => { }, 0)
  }

  connectedCallback () {
    /**
     * Checks if the input is not empty
     * @memberof QuizGameRef
     */
    this.startForm.addEventListener('input', event => {
      this._validateForm()
    })

    /**
     * Gets the value of input field and updates this.username
     * Loads the first question with provided link in constructor
     * @memberof QuizGameRef
     */
    this.startBtn.addEventListener('click', event => {
      this.username = this.startForm.value

      this._hideStartForm()
      this.getQuestion(this.nextURL)
      this.getAnswer()
    })
  }

  /**
   * Sends the url to server and gets obj back
   * @param {string} nextURL
   * @var {obj} obj The response from the server, used to acquire information about the response
   * @var {string} firstQuestion.nextURL The response from the server, used to update this.nextURL
   * @memberof QuizGameRef
   */
  async getQuestion (nextURL) {
    let firstQuestion = await window.fetch(nextURL)
    firstQuestion = await firstQuestion.json()
    this.obj = firstQuestion
    this.nextURL = firstQuestion.nextURL

    this.renderQuestion(this.obj)
    this.setTimer()
  }

  /**
   * Renders the question to html
   * @param {object} obj The response obj is used to render the DOM
   * @memberof QuizGameRef
   */
  renderQuestion (obj) {
    this._hideResponse()
    this.pQuestion.innerText = `${obj.question}`
    this.quiz.style.display = 'block'

    if (obj.alternatives) {
      this._hideAnswerInput()
      this.btns.innerText = ''
      let i = 1
      for (const alt in this.obj.alternatives) {
        const altBtn = document.createElement('button')
        altBtn.innerText = this.obj.alternatives[alt]
        altBtn.setAttribute('id', 'alt' + i)
        this.btns.appendChild(altBtn)
        i++
      }
      this._showQuiz()
    } else {
      this.btns.style.display = 'none'
      this._showAnswerInput()
    }
    this.removeTimer()
  }

  /**
   * Gets the values of input field and buttons
   * @var {string} this.answer The value that is to be sent to the server
   * @memberof QuizGameRef
   */
  getAnswer () {
    this.answerBtn.addEventListener('click', async event => {
      this.answer = this.answerInput.value
      await this.postAnswer(this.answer)
    })
    this.btns.addEventListener('click', async event => {
      if (event.target.id === 'alt1' || event.target.id === 'alt2' || event.target.id === 'alt3' || event.target.id === 'alt4') {
        this.answer = event.target.id
        await this.postAnswer(this.answer)
      }
    })
    this.removeTimer()
  }

  /**
   *  Gets a response from the server as object and checks for differences
   *  Renders the HTML based on object properties
   * @param {object} obj The response from the server to be rendered into HTML
   * @memberof QuizGameRef
   */
  renderAnswer (obj) {
    if (obj.message.length === 15 && !obj.nextURL) {
      this.onWin()
      this._hideQuiz()
      this._showScoreBoard()
    } else if (obj.message.length === 16) {
      this.onLoss()
    } else {
      this._hideQuiz()
      this.pAnswer.innerText = obj.message
      this.responseDiv.style.display = 'block'
      this.nextQBtn.addEventListener('click', event => {
        this.getQuestion(this.nextURL)
      })
    }
  }

  /**
   * Sends the answer to the server via POST method, if error occurs it catches it and logs it
   * If no errors occurred it get the response and converts it to JSON object
   * The JSON object is then sent to render
   * @var {object} this.obj JSON
   * @param {string} answerVal The value of input or buttons that is to be sent to the server
   * @memberof QuizGameRef
   */
  async postAnswer (answerVal) {
    const data = { answer: answerVal }
    const settings = {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    try {
      const postResponse = await window.fetch(this.nextURL, settings)
      this.obj = await postResponse.json()
      this.nextURL = this.obj.nextURL
      this.renderAnswer(this.obj)
    } catch (error) {
      console.log(error)
      return error
    }
  }

  /**
   * Checks if the local storage does already have scoreBoard key
   * If it does not,  then it creates an object and stringify it to sent to local storage as key
   * If scoreBoard already exists, it parses the key and pushes new values to it
   * Saves the username value to local storage as a JSON object
   * @param {string} username
   * @param {string} time
   * @memberof QuizGameRef
   */
  saveToLocalStorage (username, time) {
    let players = window.localStorage.getItem('scoreBoard')
    if (players === null) {
      let players = []
      players[0] = { name: username, score: time }
      players = JSON.stringify(players)
      window.localStorage.setItem('scoreBoard', players)
      return JSON.parse(players)
    } else {
      players = JSON.parse(players)
      players.push({ name: username, score: time })
      this.sortScore(players)
    }
    players = JSON.stringify(players)
    window.localStorage.setItem('scoreBoard', players)
    return JSON.parse(players)
  }

  /**
   * Sorts the array by value
   * @param {array} players is used to be sorted by value
   * @memberof QuizGameRef
   */
  sortScore (players) {
    for (let i = 0; i < players.length; i++) {
      for (let y = i + 1; y < players.length; y++) {
        if (players[i].score > players[y].score) {
          const temp = players[y]
          players[y] = players[i]
          players[i] = temp
        }
      }
    }
  }

  /**
   * Creates a new list of elements to be shown in the score board
   * @function saveToLocalStorage Is used to save to local storage every user that has answered to all questions
   * @memberof QuizGameRef
   */
  onWin () {
    this.removeTimer()
    this.players = this.saveToLocalStorage(this.username, parseFloat(this.totalTime.toFixed(2)))
    const sortedPlayers = this.players.slice(0, 5)

    for (let i = 0; i < sortedPlayers.length; i++) {
      const li = document.createElement('li')
      li.innerText = `Username: ${sortedPlayers[i].name}. Time: ${sortedPlayers[i].score}`
      this.scoreList.appendChild(li)
    }

    this.restartBtnScore.addEventListener('click', event => {
      this.getQuestion('http://vhost3.lnu.se:20080/question/1')
      this.getAnswer()
      this.scoreBoard.style.display = 'none'
    })
  }

  /**
   * Provides an option for the user to start the quiz again
   * @memberof QuizGameRef
   */
  onLoss () {
    this._hideQuiz()
    this._showRestart()
    this.removeTimer()

    this.restartBtn.addEventListener('click', event => {
      this.getQuestion('http://vhost3.lnu.se:20080/question/1')
      this.getAnswer()
      this.restartDiv.style.display = 'none'
    })
  }

  /**
   *  Validates the input field if its empty
   */
  _validateForm () {
    const inputVal = this.shadowRoot.querySelector('#username').value
    if (!inputVal) {
      this.startBtn.disabled = true
    } else {
      this.startBtn.disabled = false
    }
  }

  /**
   * Timer functions below
   */
  setTimer () {
    this.countTime = setTimeout(args => {
      this.timeLeft -= 0.1
      this.totalTime += 0.1
      this.renderTimer()
      if (this.timeLeft > 0.1) {
        this.setTimer()
      } else {
        this.onLoss()
      }
    }, 100)
  }

  renderTimer () {
    this.spanTimeLeft.innerText = `${Math.round(this.timeLeft * 100) / 100}`
    this.spanTotal.innerText = `${Math.round(this.totalTime * 100) / 100}`
  }

  removeTimer () {
    this.timeLeft = 10
    clearTimeout(this.countTime)
  }

  /**
   * Helper methods below to hide or show dom elements
   */
  _showAnswerInput () {
    this.answerInput.value = ''
    this.quizQuestion.style.display = 'block'
    this.answerInput.style.display = 'inline'
    this.answerBtn.style.display = 'inline'
  }

  _showRestart () {
    this.restartDiv.style.display = 'block'
  }

  _showQuiz () {
    this.quizQuestion.style.display = 'block'
    this.quiz.style.display = 'block'
    this.btns.style.display = 'block'
  }

  _showScoreBoard () {
    this.scoreBoard.style.display = 'block'
  }

  _hideAnswerInput () {
    this.answerInput.style.display = 'none'
    this.answerBtn.style.display = 'none'
  }

  _hideResponse () {
    this.responseDiv.style.display = 'none'
  }

  _hideQuiz () {
    this.quizQuestion.style.display = 'none'
  }

  _hideStartForm () {
    this.constainerStart.style.display = 'none'
  }

  _clearLocalStorage () {
    window.localStorage.clear()
  }
}

window.customElements.define('x-quiz-game-ref', QuizGameRef)
