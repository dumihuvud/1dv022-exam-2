
import { messageResponse_, question_, alt_, nextQBtn_, quizForm_, template_, answerBtn_ } from './templates.js'

export class QuizGame extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._container = this.shadowRoot.querySelector('.container')
    this._startBtn = this.shadowRoot.querySelector('#start')
    this._altDiv = this.shadowRoot.querySelector('.altBtns')
    this._timecontainer = this.shadowRoot.querySelector('#timecontainer')

    this.nextURL = 'http://vhost3.lnu.se:20080/question/1'

    this.timeLeft = 6
    this.totalTime = 0
    this.countTime = setTimeout(args => { }, 0)
  }

  /**
   * onclick <start> gets the question
   */
  connectedCallback () {
    // this._clearLocalStorage()
    this._startBtn.addEventListener('click', event => {
      this._saveUser()
      this._getQuestion(this.nextURL)
    })
  }

  /**
   * Gets json URL link and sends it for rendering.
   * @param {string} nextURL
   */
  async _getQuestion (nextURL) {
    let firstQuestion = await window.fetch(nextURL)
    firstQuestion = await firstQuestion.json()
    const obj = firstQuestion
    const url = firstQuestion.nextURL
    this._renderQuestion(obj, url)
    this._startTimer()
  }

  /**
   * Renders json obj and creates DOM nodes of it
   * @param {object} question
   */
  _renderQuestion (obj, url) {
    this._removeNodes()
    let answerValue = ''
    question_.innerHTML = `
    <p>Time left: <span id="timeLeft"></span> sec. Total time: <span id="totalTime"></span> sec.</p>
    <p id="questionPTag">${obj.question}</p>
    `
    this._container.appendChild(question_.content.cloneNode(true))

    if (obj.alternatives) {
      for (const [key, val] of Object.entries(obj.alternatives)) {
        alt_.innerHTML = `<button id="${key}">${val}</button>`
        this._container.appendChild(alt_.content.cloneNode(true))
      }
      this._container.addEventListener('click', event => {
        if (event.target.id === 'alt1' || event.target.id === 'alt2' || event.target.id === 'alt3' || event.target.id === 'alt4') {
          answerValue = event.target.id
        }
      })
    } else {
      this._container.appendChild(quizForm_.content.cloneNode(true))
      const input = this.shadowRoot.querySelector('#quizForm')
      input.addEventListener('input', event => {
        answerValue = input.value
      })
    }
    this._container.appendChild(answerBtn_.content.cloneNode(true))
    const answerBTN = this.shadowRoot.querySelector('#answerBtn')
    answerBTN.addEventListener('click', async event => {
      if (answerValue === '') {
        // return
      } else {
        await this._postAnswer(answerValue, url)
        this._removeTimer()
      }
    })
  }

  /**
   * Gets response from server and renders DOM
   * @param {object} data
   */
  async _renderAnswer (data) {
    if (data.message.length === 15 && !data.nextURL) {
      this._onWin()
    } else if (data.message.length === 16) {
      this._removeNodes()
      this._onLoss()
    } else {
      this._removeNodes()
      messageResponse_.innerHTML = `<p>${data.message}</p>`
      this._container.appendChild(messageResponse_.content.cloneNode(true))
      this._container.appendChild(nextQBtn_.content.cloneNode(true))
      this.shadowRoot.querySelector('#nextQBtn').addEventListener('click', async event => {
        await this._getQuestion(data.nextURL)
      })
    }
  }

  // should update onloss, onwin
  _updateScore () {
    const existing = window.localStorage.getItem(this.user)
    if (existing) {
      window.localStorage.setItem(this.user, this.totalTime)
    }
  }

  _saveUser () {
    const fname = this.shadowRoot.querySelector('#fname')
    const lname = this.shadowRoot.querySelector('#lname')
    this.user = `${fname.value} ${lname.value}`

    if (window.localStorage.getItem(this.user) === null) {
      window.localStorage.setItem(this.user, 'user')
    }
  }

  _clearLocalStorage () {
    window.localStorage.clear()
  }

  // save total time untill the game is done or failed
  // reset current time each time next is pressed
  _removeTimer () {
    this.timeLeft = 6
    clearTimeout(this.countTime)
  }

  _startTimer () {
    this.countTime = setTimeout(args => {
      this.timeLeft -= 0.1
      this.totalTime += 0.1
      this._renderTimer()
      if (this.timeLeft > 0.1) {
        this._startTimer()
      } else {
        this._onLoss()
      }
    }, 100)
  }

  _renderTimer () {
    this.shadowRoot.querySelector('#timeLeft').innerText = `${Math.round(this.timeLeft * 100) / 100}`
    this.shadowRoot.querySelector('#totalTime').innerText = `${Math.round(this.totalTime * 100) / 100}`
  }

  _onWin () {
    console.log('win')
    this._removeNodes()
    this._removeTimer()
    this._updateScore()
    const won = document.createElement('p')
    won.innerText = 'You won'
    this._container.appendChild(won)
    const winDiv = document.createElement('template')
    winDiv.innerHTML = `
    <p>Your total time was: <span>${Math.round(this.totalTime * 100) / 100}</span> seconds<p>
    <button id="again">Start again</button>
    `
    this._container.appendChild(winDiv.content.cloneNode(true))
    this.shadowRoot.querySelector('#again').addEventListener('click', event => {
      const againURL = 'http://vhost3.lnu.se:20080/question/1'
      this.totalTime = 0
      this._getQuestion(againURL)
    })
  }

  _onLoss () {
    console.log('loss')
    this._removeTimer()
    this._updateScore()
    this._removeNodes()
    const lossDiv = document.createElement('template')
    lossDiv.innerHTML = `
    <p>You didnt answer all questions</p>
    <p>Your total time was: <span>${Math.round(this.totalTime * 100) / 100}</span> seconds<p>
    <button id="again">Start again</button>
    `
    this._container.appendChild(lossDiv.content.cloneNode(true))
    this.shadowRoot.querySelector('#again').addEventListener('click', event => {
      const againURL = 'http://vhost3.lnu.se:20080/question/1'
      this.totalTime = 0
      this._getQuestion(againURL)
    })

    // save to storage
    // render highscore
    // render start button agian
    // render other html elements
  }

  /**
   * Helper function.
   * Removes nodes in div
   */
  _removeNodes () {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }
  }

  /**
   * Gets answer and URL values from _renderAnswer() and post it.
   * @param {string} answerValue
   * @param {string} nextURL
   */
  async _postAnswer (answerValue, nextURL) {
    const data = { answer: answerValue }
    const settings = {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)

    }
    try {
      const postResponse = await window.fetch(nextURL, settings)
      const getData = await postResponse.json()
      this._renderAnswer(getData)
      // this._getNextQuestion(getData.nextURL)
      return getData
    } catch (error) {
      console.log(error)
      return error
    }
  }
}

window.customElements.define('x-quiz-game', QuizGame)
