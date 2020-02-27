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
  <div id="timecontainer"></div>
  <div class="container">
    <form>
      <label for="fname">First name:</label><br>
      <input type="text" id="fname" name="fname"><br>
      <label for="lname">Last name:</label><br>
      <input type="text" id="lname" name="lname"><br><br>
    </form>
    <p class="p-inline">Start the game: </p><button id="start">Start</button>
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

.p-inline{
  display: inline;
}
</style>
`

export const templateRef_ = document.createElement('template')
templateRef_.innerHTML = `
<div class="start">
<h4><b>The quiz game</b></h4>
  <div id="timecontainer"></div>
  <div class="container">
    <form action="http://vhost3.lnu.se:20080/question/1">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" required>
      <input type="submit" value="Start">
    </form>
  </div>
  <div class="altBtns"></div>
</div>

<style>
.start {
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  padding: 2px 20px 20px 20px;
}
</style>
`
