import { messageResponse_, question_, alt_, nextQBtn_, quizForm_, template_ } from './templates.js'

export class Test extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._container = this.shadowRoot.querySelector('.container')
    this._startBtn = this.shadowRoot.querySelector('#start')
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
    console.log(firstQuestion)
    this._renderQuestion(firstQuestion)
  }

  /**
   * Gets json URL link and sends it for rendering.
   * @param {string} nextURL
   */
  async _getNextQuestion (nextURL) {
    let nextQuestion = await window.fetch(nextURL)
    nextQuestion = await nextQuestion.json()
    console.log(nextQuestion)
    this._renderQuestion(nextQuestion)
  }

  /**
   * Renders json obj and creates DOM nodes of it
   * @param {object} firstQuestion
   */
  _renderQuestion (firstQuestion) {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }
    question_.innerHTML = `<p id="questionPTag">${firstQuestion.question}</p>`
    this._container.appendChild(question_.content.cloneNode(true))
    this._container.appendChild(quizForm_.content.cloneNode(true))

    const input = this.shadowRoot.querySelector('#quizForm')
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        const answerValue = input.value
        const nextURL = firstQuestion.nextURL
        console.log(answerValue)
        console.log(nextURL)
        this._postAnswer(answerValue, nextURL)
      }
    })
  }

  /**
   * Gets response from server and creates DOM with answer
   * @param {object} data
   */
  _renderAnswer (data) {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }
    console.log(data)
    messageResponse_.innerHTML = `<p>${data.message}</p>`
    this._container.appendChild(messageResponse_.content.cloneNode(true))
    this._container.appendChild(nextQBtn_.content.cloneNode(true))
    this.shadowRoot.querySelector('#nextQBtn').addEventListener('click', event => {
      this._getNextQuestion(data.nextURL)
    })
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

window.customElements.define('x-test', Test)
