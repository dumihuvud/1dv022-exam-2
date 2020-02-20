import { message_, question_, alt_, quizForm_, template_ } from './templates.js'

export class QuizGame extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._start = this.shadowRoot.querySelector('button')
    this._container = this.shadowRoot.querySelector('.container')

    this.id = 0
    this.message = ''
    this.nextURL = ''
    this.question = ''
    this.alternatives = {}
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
   * needs a timer
   * refactor
   */
  startQuiz () {
    while (this._container.firstChild) {
      this._container.removeChild(this._container.lastChild)
    }
    // this._container.appendChild(quizForm_.content.cloneNode(true))
    // const quizLabel = this.shadowRoot.querySelector('.input-field label')
    // quizLabel.innerText = `lol${quizLabel}`
    this._search()
    this.getResponse()
  }

  async _search () {
    // can be updated to `${}`
    let searchResult = await window.fetch('http://vhost3.lnu.se:20080/question/1')

    // gets the response from the server
    searchResult = await searchResult.json()

    // useless code below
    // this.id = searchResult.id
    // this.message = searchResult.message
    // this.nextURL = searchResult.nextURL
    // this.question = searchResult.question
    // this.alternatives = searchResult.alternatives

    // console.log(searchResult)
    // this._updateRendering(this.id, this.message, this.nextURL, this.question)
    this.parser(searchResult)
  }

  /**
   * Parses throgh obj and gets entries and values
   * @param {json Object} searchResult
   */
  parser (searchResult) {
    console.log(searchResult)
    if (!('alternatives' in searchResult)) {
      console.log('no alternatives')
    }
    for (const [key, value] of Object.entries(searchResult)) {
      switch (key) {
        case 'id':
          console.log(key)
          break
        case 'message':
          // message_.innerHTML = `<p>${value}</p>`
          // this._container.appendChild(message_.content.cloneNode(true))
          break
        case 'question':
          question_.innerHTML = `<p>${value}</p>`
          this._container.appendChild(question_.content.cloneNode(true))
          break
        case 'alternatives':
          for (const [key, val] of Object.entries(value)) {
            // console.log(key)
            alt_.innerHTML = `<button>${val}</button>`
            this._container.appendChild(alt_.content.cloneNode(true))
          }
          break
        case 'nextURL':
          console.log(key)
          break
        default:
          // console.log('no alternatives')
          break
      }
    }
  }

  /**
   * sends the answer to server and gets response
   */
  async getResponse () {
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
      // console.log(data)
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
}

window.customElements.define('x-quiz-game', QuizGame)
