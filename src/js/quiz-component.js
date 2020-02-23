import { messageResponse_, question_, alt_, nextQBtn_, quizForm_, template_ } from './templates.js'

export class QuizGame extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._container = this.shadowRoot.querySelector('.container')
    this._altBtns = this.shadowRoot.querySelector('.altBtns')
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

  async _getFirstQuestion () {
    let firstQuestion = await window.fetch('http://vhost3.lnu.se:20080/question/1')
    firstQuestion = await firstQuestion.json()
    console.log(firstQuestion)
    this._renderQuestion(firstQuestion)
  }

  async _getNextQuestion (nextURL) {
    let nextQuestion = await window.fetch(nextURL)
    nextQuestion = await nextQuestion.json()
    console.log(nextQuestion)
    this._renderQuestion(nextQuestion)
  }

  _renderQuestion (question) {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }
    question_.innerHTML = `<p id="questionPTag">${question.question}</p>`
    this._container.appendChild(question_.content.cloneNode(true))
    if (!('alternatives' in question)) {
      this._container.appendChild(quizForm_.content.cloneNode(true))
      const input = this.shadowRoot.querySelector('#quizForm')
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          const answerValue = input.value
          const nextURL = question.nextURL
          console.log(answerValue)
          console.log(nextURL)
          this._postAnswer(answerValue, nextURL)
        }
      })
    } else {
      console.log('alternatives')
      for (const [key, val] of Object.entries(question.alternatives)) {
        alt_.innerHTML = `<button value="${key}">${val}</button>`
        this._altBtns.appendChild(alt_.content.cloneNode(true))
      }
      this._altBtns.addEventListener('click', event => {
        console.log(event.target)
        const answerValue = event.target.value
        const nextURL = question.nextURL
        this._postAnswer(answerValue, nextURL)
        while (this._container.firstChild) {
          this._altBtns.removeChild(this._altBtns.lastChild)
        }
      })
    }
  }

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
