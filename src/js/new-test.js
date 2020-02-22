import { messageResponse_, question_, alt_, quizForm_, template_, answerBtn_ } from './templates.js'

export class NewTest extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._container = this.shadowRoot.querySelector('.container')
    this.startBtn = this.shadowRoot.querySelector('#start')

    this.questionURL = 'http://vhost3.lnu.se:20080/question/1'
    this.answerURL = 'http://vhost3.lnu.se:20080/answer/1'
    this.answer = ''
  }

  connectedCallback () {
    this.startBtn.addEventListener('click', event => {
      this._startQuiz()
    })
  }

  _startQuiz (respose) {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }
    this._searchQuestion(this.questionURL)
  }

  async _searchQuestion (questionURL) {
    let searchResult = await window.fetch(questionURL)

    searchResult = await searchResult.json()

    console.log(searchResult)

    if (!searchResult.alternatives) {
      this._renderQuestion(searchResult)
    } else {
      this._renderAlternatives(searchResult)
    }
  }

  async _renderQuestion (searchResult) {
    question_.innerHTML = `<p>${searchResult.question}</p>`
    this._container.appendChild(question_.content.cloneNode(true))
    this._container.appendChild(quizForm_.content.cloneNode(true))

    const input = this.shadowRoot.querySelector('#answer')
    input.addEventListener('keydown', async event => {
      if (event.key === 'Enter') {
        this.answer = input.value
        this.answerURL = searchResult.nextURL
        // await this._submitAnswer(this.answer, this.answerURL)
        await this._renderResult()
      }
    })
  }

  async _renderAlternatives (searchResult) {
    question_.innerHTML = `<p>${searchResult.question}</p>`
    this._container.appendChild(question_.content.cloneNode(true))
    for (const [key, val] of Object.entries(searchResult.alternatives)) {
      alt_.innerHTML = `<button value="${key}">${val}</button>`
      this._container.appendChild(alt_.content.cloneNode(true))
    }
    this._container.addEventListener('click', async event => {
      this.answer = event.target.value
      this.answerURL = searchResult.nextURL
      console.log(this.answer)
      console.log(this.answerURL)
      // await this._submitAnswer(this.answer, this.answerURL)
      await this._renderResult()
    })
  }

  async _renderResult () {
    const pTag = document.createElement('p')
    this._container.appendChild(answerBtn_.content.cloneNode(true))
    const answerBtn = this.shadowRoot.querySelector('#answerBtn')
    pTag.innerText = await this.parsedResponse.message
    this._container.appendChild(pTag)

    answerBtn.addEventListener('click', async event => {
      console.log(this.parsedResponse.nextURL + ' =answerBtn')
      this.questionURL = this.parsedResponse.nextURL
      await this._searchQuestion(this.questionURL)
    })
  }

  /**
   * onclick summit result to url and trigger render again
   */
  async _submitAnswer (submittedAnswer, answerURL) {
    console.log(submittedAnswer + ' = submittedAnswer')
    console.log(answerURL + ' = answerURL')
    const data = { answer: submittedAnswer }
    const settings = {
      method: 'Post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)

    }
    try {
      const fetchResponse = await window.fetch(answerURL, settings)
      const data = await fetchResponse.json()
      console.log(data)
      this.parsedResponse = data
      return data
    } catch (error) {
      console.log(error)
      return error
    }
  }
}

window.customElements.define('x-new-test', NewTest)
