import { messageResponse_, question_, alt_, quizForm_, template_, nextBtn_ } from './templates.js'

export class QuizGame extends window.HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._container = this.shadowRoot.querySelector('.container')
    this.startBtn = this.shadowRoot.querySelector('#start')

    this.responseData = {}
    this.answerURL = 'http://vhost3.lnu.se:20080/answer/1'
    this.questionURL = 'http://vhost3.lnu.se:20080/question/1'
  }

  /**
   * Called everytime the component is added to the code
   */
  connectedCallback () {
    this.startBtn.addEventListener('click', event => {
      this._startQuiz()

      // Should be in different function...
      // onclick.submitAnswer() or something
      this._submitAnswer()
    })
  }

  /**
   *
   * Onclick sends first promise and parses a dom
   */
  _startQuiz () {
    this._removeDiv()
    this._getResponse(this.questionURL)
    this._parseResponse()
  }

  async _getResponse (questionURL) {
    const response = await window.fetch(questionURL)
    this.responseData = await response.json()
    console.log(this.responseData)
    return this.responseData
  }

  /**
   * parses a .json answer and creates dom structure
   */
  _parseResponse () {
    this._removeDiv()
    question_.innerHTML = `<p>${this.responseData.question}</p>`
    this._container.appendChild(question_.content.cloneNode(true))
    this._container.appendChild(quizForm_.content.cloneNode(true))
    this._container.appendChild(nextBtn_.content.cloneNode(true))
    this._getVal()
  }

  /**
   * POST function
   */
  async _submitAnswer () {
    const data = { answer: '2' }
    const settings = {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)

    }
    try {
      const fetchResponse = await window.fetch('http://vhost3.lnu.se:20080/answer/1', settings)
      const data = await fetchResponse.json()
      console.log(data)
      return data
    } catch (error) {
      return error
    }
  }

  /**
   * Gets value input field on keypdown
   */
  _getVal () {
    const input = this.shadowRoot.querySelector('#answer')
    input.addEventListener('keydown', async event => {
      if (event.key === 'Enter') {
        return event.value
      }
    })
  }

  /**
   *  Helper function
   *  clears div node
   */
  _removeDiv () {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }
  }
}

window.customElements.define('x-quiz-game', QuizGame)
