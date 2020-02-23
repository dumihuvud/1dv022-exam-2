import { messageResponse_, question_, alt_, nextQBtn_, quizForm_, template_, answerBtn_ } from './templates.js'

export class QuizGame extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._container = this.shadowRoot.querySelector('.container')
    this._startBtn = this.shadowRoot.querySelector('#start')
    this._altDiv = this.shadowRoot.querySelector('.altBtns')
  }

  /**
   * onclick <start> gets the question
   */
  connectedCallback () {
    this._startBtn.addEventListener('click', event => {
      this._getFirstQuestion()
    })
  }

  /**
   * Gets the first question from the server and sends json data for rendering.
   */
  async _getFirstQuestion () {
    let firstQuestion = await window.fetch('http://vhost3.lnu.se:20080/question/1')
    firstQuestion = await firstQuestion.json()
    const obj = firstQuestion
    const url = firstQuestion.nextURL
    this._renderQuestion(obj, url)
  }

  /**
   * Gets json URL link and sends it for rendering.
   * @param {string} nextURL
   */
  async _getNextQuestion (nextURL) {
    let nextQuestion = await window.fetch(nextURL)
    nextQuestion = await nextQuestion.json()
    console.log(nextQuestion)
    const obj = nextQuestion
    const url = nextQuestion.nextURL
    this._renderQuestion(obj, url)
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
    answerBTN.addEventListener('click', event => {
      this._postAnswer(answerValue, url)
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
        this._getNextQuestion(data.nextURL)
      })
    }
  }

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
