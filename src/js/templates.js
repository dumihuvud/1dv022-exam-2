export const message_ = document.createElement('template')

export const question_ = document.createElement('template')

export const alt_ = document.createElement('template')

export const quizForm_ = document.createElement('template')
quizForm_.innerHTML = `
  <input type="text" id="answer">
`
export const template_ = document.createElement('template')
template_.innerHTML = `
<div class="start">
<h4><b>The quiz game</b></h4>
  <div class="container">  
    <p>Start the game:</p>
    <button>Start</button>
  </div>
  <div class="inputfield"></div>
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
