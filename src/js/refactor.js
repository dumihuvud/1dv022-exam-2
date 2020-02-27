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
        <p id="question"></p>
        <input type="text" id="answerInput" /> <button id="answerBtn">Answer</button>
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

    #answerInput {
        display: none;
    }

    #answerBtn {
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
    this.quiz = this.shadowRoot.querySelector('.quiz')
    this.btns = this.shadowRoot.querySelector('.btns')
    this.alt1 = this.shadowRoot.querySelector('#alt1')
    this.alt2 = this.shadowRoot.querySelector('#alt2')
    this.alt3 = this.shadowRoot.querySelector('#alt3')
    this.alt4 = this.shadowRoot.querySelector('#alt4')
    this.pQuestion = this.shadowRoot.querySelector('#question')
    this.answerInput = this.shadowRoot.querySelector('#answerInput')
    this.answerBtn = this.shadowRoot.querySelector('#answerBtn')
    this.nextURL = 'http://vhost3.lnu.se:20080/question/21'
  }

  connectedCallback () {
    this.startForm.addEventListener('input', event => {
      this._validateForm()
    })
    this.startBtn.addEventListener('click', event => {
      this.hideStartForm()
      this.getQuestion(this.nextURL)
      this.getAnswer()
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
    console.log(obj)
    this.pQuestion.innerText = `${obj.question}`
    this.quiz.style.display = 'block'
    if (obj.alternatives) {
      this.alt1.innerHTML = obj.alternatives.alt1
      this.alt2.innerHTML = obj.alternatives.alt2
      this.alt3.innerHTML = obj.alternatives.alt3
      this.alt4.innerHTML = obj.alternatives.alt4
      this.quiz.style.display = 'block'
      this.btns.style.display = 'block'
    } else {
      this.answerInput.style.display = 'inline'
      this.answerBtn.style.display = 'inline'
    }
  }

  getAnswer () {
    this.answerInput.addEventListener('input', event => {
      console.log(this.answerInput.value)
    })
    this.btns.addEventListener('click', event => {
      if (event.target.id === 'alt1' || event.target.id === 'alt2' || event.target.id === 'alt3' || event.target.id === 'alt4') {
        console.log(event.target.id)
      }
    })
  }

  hideStartForm () {
    this.constainerStart.style.display = 'none'
  }
}

window.customElements.define('x-refactor', Refactor)
