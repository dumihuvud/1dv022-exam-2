import { message_, question_, alt_, quizForm_, template_ } from './templates.js'

export class NewTest extends window.HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template_.content.cloneNode(true))

    this._container = this.shadowRoot.querySelector('.container')
  }

  connectedCallback () {
    this._container.addEventListener('click', event => {
      this.startQuiz(event.target)
    })
  }

  startQuiz (target) {
    console.log(target)
  }
}

window.customElements.define('x-new-test', NewTest)
