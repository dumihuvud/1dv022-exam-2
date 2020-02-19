const quizForm = document.createElement('template')
quizForm.innerHTML = `
<div class="input-field">
  <label for="answer"></label>
  <input type="text" id="answer">
</div>
`

const template = document.createElement('template')
template.innerHTML = `
<div class="start">
<h4><b>The quiz game</b></h4>
  <div class="container">  
    <p>Start the game:</p>
    <button>Start</button>
  </div>
</div>

<style>
.start {
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  transition: 0.3s;
  padding: 2px 16px;
}

.container {
}
</style>
`

export class QuizGame extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

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
    this._container.appendChild(quizForm.content.cloneNode(true))
    const quizLabel = this.shadowRoot.querySelector('.input-field label')
    quizLabel.innerText = `lol${quizLabel}`
    this._search()
    this.getResponse()
  }

  async _search () {
    // can be updated to `${}`
    let searchResult = await window.fetch('http://vhost3.lnu.se:20080/question/21')

    // gets the responce from the server
    searchResult = await searchResult.json()

    // useless code below
    this.id = searchResult.id
    this.message = searchResult.message
    this.nextURL = searchResult.nextURL
    this.question = searchResult.question
    this.alternatives = searchResult.alternatives

    // console.log(searchResult)
    this._updateRendering(this.id, this.message, this.nextURL, this.question)
    this.parser(searchResult)
  }

  /**
   * Parses throgh obj and gets entries and values
   * @param {json Object} searchResult
   */
  parser (searchResult) {
    for (const [key, value] of Object.entries(searchResult)) {
      console.log(key)
      // console.log(value)
    }
    // Object.keys(searchResult).forEach(e => {
    //   if (e === 'id') {
    //     console.log(`key=${e}  value=${searchResult[e]}`)
    //   } else if (e === 'question') {
    //     console.log(`key=${e}  value=${searchResult[e]}`)
    //   } else if (e === 'alternatives') {
    //     console.log(`key=${e}  value=${searchResult[e]}`)
    //     // Object.keys(e).forEach(i => console.log(`key=${i} values=${e[i]}`))
    //   } else if (e === 'nextURL') {
    //     console.log(`key=${e}  value=${searchResult[e]}`)
    //   } else if (e === 'message') {
    //     console.log(`key=${e}  value=${searchResult[e]}`)
    //   }
    // })
  }

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
      const fetchResponse = await fetch('http://vhost3.lnu.se:20080/answer/1', settings)
      const data = await fetchResponse.json()
      console.log(data)
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
