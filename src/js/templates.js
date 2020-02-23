export const messageResponse_ = document.createElement('template')

export const question_ = document.createElement('template')

export const alt_ = document.createElement('template')

export const answerBtn_ = document.createElement('template')
answerBtn_.innerHTML = `
<button id="answerBtn">Answer</button>
`

export const nextQBtn_ = document.createElement('template')
nextQBtn_.innerHTML = `
<button id="nextQBtn">Next</button>
`

export const quizForm_ = document.createElement('template')
quizForm_.innerHTML = `
  <input type="text" id="quizForm">
`
export const template_ = document.createElement('template')
template_.innerHTML = `
<div class="start">
<h4><b>The quiz game</b></h4>
  <div class="container">
    <p>Start the game:</p>
    <button id="start">Start</button>
  </div>
  <div class="altBtns"></div>
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

//   <label for="answer"></label>
// add div invisible
