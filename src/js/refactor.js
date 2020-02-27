export class Refactor extends window.HTMLElement {
  constructor () {
    super()

    const templateRef_ = document.createElement('template')
    templateRef_.innerHTML = `
    <div class="start">
    <h4><b>The quiz game</b></h4>
    <div id="timecontainer"></div>
    <div class="container-start">
        <form id="start-form">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username">
        </form><br>
        <p class="p-inline">Start the quiz </p><button id="start" disabled>Start</button>
    </div>
    <div class="quiz">
        <p id="question">Question</p>
        <input type="text" id="answer" />
        <div class="btns">
            <button id="alt1"></button><button id="alt2"></button><button id="alt3"></button><button id="alt4"></button>
        </div>
    </div>
    </div>

    <style>
    .start {
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    padding: 2px 20px 20px 20px;
    }

    .p-inline {
        display: inline;
    }

    .quiz {
        display: none;
    }

    #answer {
        display: none;
    }

    .btns {
        display: none;
    }
    </style>
    `
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(templateRef_.content.cloneNode(true))

    this.constainerStart = this.shadowRoot.querySelector('.container-start')
    this.startForm = this.shadowRoot.querySelector('#username')
    this.startBtn = this.shadowRoot.querySelector('#start')
    this.nextURL = 'http://vhost3.lnu.se:20080/question/1'
  }

  connectedCallback () {
    this.startForm.addEventListener('input', event => {
      this._validateForm()
    })
    this.startBtn.addEventListener('click', event => {
      this.hideStartForm()
    })
  }

  _validateForm () {
    const inputVal = this.shadowRoot.querySelector('#username').value
    if (!inputVal) {
      this.startBtn.disabled = true
    } else {
      this.startBtn.disabled = false
    }
  }

  async getQuestion (nextURL) {
    let firstQuestion = await window.fetch(nextURL)
    firstQuestion = await firstQuestion.json()
    const obj = firstQuestion
    const url = firstQuestion.nextURL

    this.renderQuestion(obj, url)
  }

  renderQuestion (obj, url) {

  }

  hideStartForm () {
    this.constainerStart.style.display = 'none'
    const pTag = document.createElement('p')
    pTag.innerText = 'Hey'
  }
}

window.customElements.define('x-refactor', Refactor)
