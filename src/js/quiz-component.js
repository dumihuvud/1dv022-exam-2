import { message_, question_, alt_, quizForm_, template_ } from './templates.js'

export class QuizGame extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._start = this.shadowRoot.querySelector('button')
    this._container = this.shadowRoot.querySelector('.container')
    this._inputField = this.shadowRoot.querySelector('.inputfield')

    this.questionURL = 'http://vhost3.lnu.se:20080/question/1'
    this.answerURL = ''
  }

  static get observedAttributes () {
    return []
  }

  attributeChangedCallback () {

  }

  connectedCallback () {
    this._start.addEventListener('click', event => {
      this.startQuiz()
    })
  }

  disconnectedCallback () {
    this._start.addEventListener('click', event => {
      this.startQuiz()
    })
  }

  /**
   * Quiz game logic
   * TODOs:needs a timer
   */
  startQuiz () {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }
    this._search(this.questionURL)
    // this.sendAnswer(this.answerURL)
    // this.test()
  }

  /**
   * Gets the response from the server
   * @param {url} questionURL
   */
  async _search (questionURL) {
    let searchResult = await window.fetch(questionURL)

    searchResult = await searchResult.json()

    this.parser(searchResult)
  }

  /**
   * Parses throgh obj and gets entries and values. Creates nodes based on values.
   * @param {json Object} searchResult
   */
  parser (searchResult) {
    console.log(searchResult)
    const inputValue = ''
    if (!('alternatives' in searchResult)) {
      this._inputField.appendChild(quizForm_.content.cloneNode(true))
      const input = this.shadowRoot.querySelector('#answer')
      input.addEventListener('keydown', event => {
        inputValue = input.value + String.fromCharCode(event.which)
        if (event.keyCode === 13) {
          console.log(inputValue)
          return inputValue
        }
      })
    }
    for (const [key, value] of Object.entries(searchResult)) {
      switch (key) {
        case 'id':
          break
        case 'message':
          break
        case 'question':
          question_.innerHTML = `<p>${value}</p>`
          this._container.appendChild(question_.content.cloneNode(true))
          break
        case 'alternatives':
          for (const [key, val] of Object.entries(value)) {
            alt_.innerHTML = `<button>${val}</button>`
            this._container.appendChild(alt_.content.cloneNode(true))
          }
          break
        case 'nextURL':
          console.log(value)
          //   !! figure out !!
          this.answerURL = value
          break
        default:
          break
      }
    }
    this.sendAnswer(inputValue, this.answerURL)
  }

  /**
   * sends the answer to server and gets response
   * ${inputVal}
   */
  async sendAnswer (inputValue, answerURL) {
    const data = { answer: inputValue }
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
      return data
    } catch (error) {
      console.log(error)
      return error
    }
  }

  // do something when changes happen
  _updateRendering () {

  }

  _timer () {
    // todo: timer to use in startQuiz()
  }

  // test () {
  //   this._inputField.appendChild(quizForm_.content.cloneNode(true))
  //   const input = this.shadowRoot.querySelector('#answer')
  //   input.addEventListener('keypress', event => {
  //     const inputValue = input.value + String.fromCharCode(event.which)
  //     if (event.keyCode === 13) {
  //       console.log(inputValue)
  //     }
  //   })
  // }
}

window.customElements.define('x-quiz-game', QuizGame)