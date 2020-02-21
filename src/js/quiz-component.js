import { messageResponse_, question_, alt_, quizForm_, template_, nextBtn_ } from './templates.js'

export class QuizGame extends window.HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._container = this.shadowRoot.querySelector('.container')
    this.startBtn = this.shadowRoot.querySelector('#start')

    this.responseData = {}
    this.questionURL = 'http://vhost3.lnu.se:20080/question/1'
  }

  connectedCallback () {
    this.startBtn.addEventListener('click', event => {
      this._startQuiz()
    })
  }

  async _startQuiz (respose) {
    this._removeDiv()
    await this._getResponse(this.questionURL)
    this._parseResponse()
  }

  async _getResponse (questionURL) {
    const response = await window.fetch(questionURL)
    this.responseData = await response.json()
    console.log(this.responseData)
    return this.responseData
  }

  _parseResponse () {
    this._removeDiv()
    question_.innerHTML = `<p>${this.responseData.question}</p>`
    this._container.appendChild(question_.content.cloneNode(true))
    this._container.appendChild(quizForm_.content.cloneNode(true))
    this._container.appendChild(nextBtn_.content.cloneNode(true))
    this._getVal()
  }

  _getVal () {
    const input = this.shadowRoot.querySelector('#answer')
    input.addEventListener('keydown', async event => {
      if (event.key === 'Enter') {
        console.log(input.value)
      }
    })
  }

  _removeDiv () {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }
  }
}

window.customElements.define('x-quiz-game', QuizGame)
