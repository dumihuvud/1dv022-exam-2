import { messageResponse_, question_, alt_, nextQBtn_, quizForm_, template_, answerBtn_ } from './templates.js'

export class QuizGame extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._container = this.shadowRoot.querySelector('.container')
    this._startBtn = this.shadowRoot.querySelector('#start')
    this._altDiv = this.shadowRoot.querySelector('.altBtns')

    this.nextURL = 'http://vhost3.lnu.se:20080/question/1'

    this.totalTimeArr = []
    this.currentTime = 6
    this.totalTime = 0
    this.countTime = setTimeout(args => { }, 0)
  }

  /**
   * onclick <start> gets the question
   */
  connectedCallback () {
    this._startBtn.addEventListener('click', event => {
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
    this.startTimer()
  }

  /**
   * Renders json obj and creates DOM nodes of it
   * @param {object} question
   */
  _renderQuestion (obj, url) {
    this._removeNodes()
    let answerValue = ''
    question_.innerHTML = `<p id="questionPTag">${obj.question}</p>`
    this._container.appendChild(question_.content.cloneNode(true))

    if (obj.alternatives) {
      for (const [key, val] of Object.entries(obj.alternatives)) {
        alt_.innerHTML = `<button id="${key}">${val}</button>`
        this._container.appendChild(alt_.content.cloneNode(true))
      }
      this._container.addEventListener('click', event => {
        if (event.target.id === 'alt1' || event.target.id === 'alt2' || event.target.id === 'alt3' || event.target.id === 'alt4') {
          answerValue = event.target.id
          console.log(answerValue)
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
      await this._postAnswer(answerValue, url)
      this.removeTimer()
    })
  }

  /**
   * Gets response from server and creates DOM with answer
   * @param {object} data
   */
  _renderAnswer (data) {
    if (!data.nextURL) {
      this._removeNodes()
      const won = document.createElement('p')
      won.innerText = 'You won'
      this._container.appendChild(won)
    } else {
      this._removeNodes()
      console.log(data)
      messageResponse_.innerHTML = `<p>${data.message}</p>`
      this._container.appendChild(messageResponse_.content.cloneNode(true))
      this._container.appendChild(nextQBtn_.content.cloneNode(true))
      this.shadowRoot.querySelector('#nextQBtn').addEventListener('click', event => {
        this._getQuestion(data.nextURL)
      })
    }
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

  // save total time untill the game is done or failed
  // reset current time each time next is pressed
  removeTimer () {
    this.currentTime = 6
    clearTimeout(this.countTime)
    console.log(this.totalTime)
    // this.totalTimeArr.push(this.totalTime)
    // console.log(this.totalTime)
  }

  startTimer () {
    this.countTime = setTimeout(args => {
      this.currentTime--
      this.totalTime++
      if (this.currentTime > 0) {
        console.log(this.currentTime)
        this.startTimer()
      } else {
        this.onLoss()
      }
    }, 1000)
  }

  onLoss () {
    console.log('loss')
    this.removeTimer()
    // this.totalTimeArr.push(this.totalTime)
    console.log(this.totalTime)
    // this._startBtn.disabled = true
    // this.answerBtn_.disabled = true
    // save to storage
    // render highscore
    // render start button agian
    // render other html elements
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
