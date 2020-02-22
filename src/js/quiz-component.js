import { messageResponse_, question_, alt_, nextQ_, quizForm_, template_ } from './templates.js'

export class QuizGame extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this.questionURL = 'http://vhost3.lnu.se:20080/question/1'
    this.answerURL = 'http://vhost3.lnu.se:20080/answer/1'

    this._container = this.shadowRoot.querySelector('.container')
    this._startBtn = this.shadowRoot.querySelector('#start')

    this.searchResult = {}
  }

  connectedCallback () {
    this._startBtn.addEventListener('click', event => {
      this._getQuestion(this.questionURL)
    })
  }

  async _getQuestion (questionURL) {
    let searchResult = await window.fetch(questionURL)
    searchResult = await searchResult.json()
    console.log(searchResult)
    this.searchResult = searchResult
    this._renderGET(this.searchResult)
  }

  _renderGET (searchResult) {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }

    question_.innerHTML = `<p id="questionPTag">${searchResult.question}</p>`
    this._container.appendChild(question_.content.cloneNode(true))
    this._container.appendChild(quizForm_.content.cloneNode(true))

    this._inputVal()
  }

  _inputVal () {
    const input = this.shadowRoot.querySelector('#quizForm')
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        const valToSend = input.value
      }
    })
    this._postAnswer()
  }

  _renderPOST () {

  }

  async _postAnswer () {
    const data = { answer: '2' }
    const settings = {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)

    }
    try {
      const postResponse = await window.fetch(this.answerURL, settings)
      const getData = await postResponse.json()
      console.log(getData)
      this.parsedResponse = getData
      return getData
    } catch (error) {
      console.log(error)
      return error
    }
  }
}

window.customElements.define('x-quiz-game', QuizGame)
