export class Refactor extends window.HTMLElement {
  constructor () {
    super()

    const templateRef_ = document.createElement('template')
    templateRef_.innerHTML = `
    <div class="start">
    <h4><b>The quiz game</b></h4>
      <div class="container-start">
          <form id="start-form">
              <label for="username">Username:</label>
              <input type="text" id="username" name="username">
          </form><br>
          <p class="p-inline">Start the quiz </p><button id="start" disabled>Start</button>
      </div>
      <div class="quiz">
          <div class="quiz-question">
            <p id="p-total">Total time: <span id="total-time"></span></p>
            <p id="p-time-left">Time left: <span id="time-left"></span></p>
            <p id="question"></p>
            <input type="text" id="answerInput" /> <button id="answerBtn">Answer</button>
            <div class="btns">

            </div>
          </div>
          <div class="response">
            <p id="message-response"></p><button id="next-question">Next</button>
          </div>
      </div>
      <div class="restart-quiz">
        <p id="p-restart">Try again</p><button id="restart-btn">Restart</button>
      </div>
      <div class="score-board">
        <p id="p-score">Score board:</p>
        <ol id="score-list">
        
        </ol>
      </div>
    </div>

    <style>
    .start {
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    padding: 2px 20px 20px 20px;
    }

    .p-inline {
        display: inline;
    }

    .quiz {
        display: none;
    }

    #answerInput {
        display: none;
    }

    #answerBtn {
      display: none;
    }

    .response {
      display:none;
    }

    #message-response {
      display: inline;
    }

    #next-question {
      display: inline;
    }

    .btns {
        display: none;
    }

    .restart-quiz {
      display: none;
    }

    #p-restart {
      display: inline;
    }

    #restart-btn {
      display: inline;
    }

    .score-board {
      display: none;
    }
    </style>
    `
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

    this.nextURL = 'http://vhost3.lnu.se:20080/question/1'
    this.players = []
    this.timeLeft = 10
    this.totalTime = 0
    this.countTime = setTimeout(args => { }, 0)
  }

  connectedCallback () {
    // this._clearLocalStorage()
    this.startForm.addEventListener('input', event => {
      this._validateForm()
    })

    this.startBtn.addEventListener('click', event => {
      this.username = this.startForm.value

      this._hideStartForm()
      this.getQuestion(this.nextURL)
      this.getAnswer()
    })
  }

  /**
   * sends the url to servers and gets obj
   * @param {string} nextURL
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
   * @param {object} obj
   * @param {string} url
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
   * Checks the values of input and buttons
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

  renderAnswer (obj) {
    if (obj.message.length === 15 && !obj.nextURL) {
      this.onWin()
      this._hideQuiz()
      this._showScoreBoard()
    } else if (obj.message.length === 16) {
      this.onLoss()
      this._hideQuiz()
      this._showRestart()
    } else {
      this._hideQuiz()
      this.pAnswer.innerText = obj.message
      this.responseDiv.style.display = 'block'
      this.nextQBtn.addEventListener('click', event => {
        this.getQuestion(this.nextURL)
      })
    }
  }

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

  onWin () {
    console.log('win')
    this.removeTimer()
    this.players = this.saveToLocalStorage(this.username, parseFloat(this.totalTime.toFixed(2)))
    const sortedPlayers = this.players.slice(0, 5)

    for (let i = 0; i < sortedPlayers.length; i++) {
      const li = document.createElement('li')
      li.innerText = `Username: ${sortedPlayers[i].name}. Time: ${sortedPlayers[i].score}`
      this.scoreList.appendChild(li)
    }
  }

  onLoss () {
    console.log('loss')
    this.removeTimer()
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

window.customElements.define('x-refactor', Refactor)
