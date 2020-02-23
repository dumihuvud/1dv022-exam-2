import { messageResponse_, question_, alt_, nextQBtn_, quizForm_, template_ } from './templates.js'

export class QuizGame extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._container = this.shadowRoot.querySelector('.container')
    this._startBtn = this.shadowRoot.querySelector('#start')

    this.searchResult = {}
    this.parsedResponse = {}
    this.questionURL = 'http://vhost3.lnu.se:20080/question/1'
    this.answerURL = 'http://vhost3.lnu.se:20080/answer/1'
    this.answer = ''
  }

  /**
   * onclick <start> gets the question
   */
  connectedCallback () {
    this._startBtn.addEventListener('click', event => {
      this._getQuestion(this.questionURL)
    })
  }

  /**
   * Gets the data from server and triggers _renderGET
   * @param {string} questionURL
   */
  async _getQuestion (questionURL) {
    let searchResult = await window.fetch(questionURL)
    searchResult = await searchResult.json()
    this.searchResult = searchResult
    this.answerURL = searchResult.nextURL
    console.log(this.searchResult)
    this._renderGET(this.searchResult)
  }

  /**
   * Takes json object as parameter and renders it to html
   * @param {object} searchResult
   */
  _renderGET (searchResult) {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }

    question_.innerHTML = `<p id="questionPTag">${searchResult.question}</p>`
    this._container.appendChild(question_.content.cloneNode(true))
    this._container.appendChild(quizForm_.content.cloneNode(true))

    const input = this.shadowRoot.querySelector('#quizForm')
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.answer = input.value
        console.log(this.answer)
        this._postAnswer(this.answer)
      }
    })
  }

  /**
   * renders json response obj. adds p and btn tags
   */
  _renderPOST () {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }
    messageResponse_.innerHTML = `<p>${this.parsedResponse.message}</p>`
    this._container.appendChild(messageResponse_.content.cloneNode(true))
    this._container.appendChild(nextQBtn_.content.cloneNode(true))
    const nextQBtn = this.shadowRoot.querySelector('#nextQBtn')
    nextQBtn.addEventListener('click', event => {
      console.log('click')
      this.questionURL = this.parsedResponse.nextURL
      console.log(this.parsedResponse)
      console.log(this.answerURL)
    })
  }

  async _postAnswer (inputValue) {
    const data = { answer: inputValue }
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
      this.parsedResponse = getData
      this._renderPOST()
      return getData
    } catch (error) {
      console.log(error)
      return error
    }
  }
}

window.customElements.define('x-quiz-game', QuizGame)
