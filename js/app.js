// declare global variables
let inputButtons
let goButton
let resetButton
let p1
let p2

// game victory logic
const victoryLogic = [
  {
    choice: 'rock',
    beats: ['scissors','lizard']
  },
  {
    choice: 'paper',
    beats: ['rock','spock']
  },
  {
    choice: 'scissors',
    beats: ['paper','lizard']
  },
  {
    choice: 'lizard',
    beats: ['spock','paper']
  },
  {
    choice: 'spock',
    beats: ['scissors','rock']
  }
]

window.addEventListener('DOMContentLoaded',init)

function init(){
  //select all the required DOM elements
  goButton = document.querySelector('#go-button')
  resetButton = document.querySelector('#reset-button')
  inputButtons = document.querySelectorAll('input')
  const p1board = document.querySelector('#player1')
  const p2board = document.querySelector('#player2')

  p1 = new Player('Player 1',p1board,'human')
  p2 = new Player('Player 2',p2board,'computer')

  //allow for the board to be reset
  resetButton.addEventListener('click',resetBoard)
  resetBoard()
}

function checkReady(){
  // put all checked buttons into the trueButtons array
  const trueButtons = []
  inputButtons.forEach( button => button.checked ? trueButtons.push(button) : false )
  // update the players base on current selections
  trueButtons.forEach( button => {
    switch (button.name) {
      case 'p1type':
        if (p1.type !== button.value) p1.changeType(button.value)
        break
      case 'p2type':
        if (p2.type !== button.value) p2.changeType(button.value)
        break
      case 'p1choice':
        if (p1.choice !== button.value) p1.changeChoice(button.value)
        break
      case 'p2choice':
        if (p2.choice !== button.value) p2.changeChoice(button.value)
        break
    }
  })
  //Now check to see if we are ready to play
  goOk()
}

function goOk(){
  if(p1.okToGo() && p2.okToGo()) {
    goButton.classList.add('ready')
    goButton.addEventListener('click',orchestrateRound)
  } else {
    goButton.classList.remove('ready')
    goButton.removeEventListener('click',orchestrateRound)
  }
}

function orchestrateRound(){
  //stop the routine triggering twice
  goOk(false)
  //launch the animation
  p1.status('thinking')
  p2.status('thinking')
  setTimeout( ()=>{
    //stop the user changing their choice
    inputButtons.forEach(button => button.removeEventListener('click',checkReady))
    p1.randomiseChoice()
    p2.randomiseChoice()
    p1.status('decided')
    p2.status('decided')
    // work out who won, after a slight delay
    setTimeout( ()=> victoryDecision(), 1000)
    // reset the board, after a longer delay
    setTimeout( ()=> resetBoard(), 4000)

  }, 4000)
}

function victoryDecision(){
  //Filter out a draw scenario
  if (p1.choice === p2.choice) {
    p1.addDraw()
    p2.addDraw()
    return
  }
  //Identify the victory logic for player 1's choice
  const playerOneLogic = victoryLogic.find( item => item.choice === p1.choice )

  // Use the victory logic from p1 to see if they should win
  if(playerOneLogic.beats.includes(p2.choice)){
    console.log('Winner: Player 1')
    p1.addWin()
    p2.addLoss()
  } else {
    console.log('Winner: Player 2')
    p1.addLoss()
    p2.addWin()
  }
}

function resetBoard(){
  document.querySelectorAll('form.choices').forEach( form => form.reset() )
  p1.reset()
  p2.reset()
  checkReady()
  //allow the buttons to be pressed - this will have been suspended once the routine is underway
  inputButtons.forEach(button => button.addEventListener('click',checkReady))
}

class Player{
  constructor(name, playAreaDom, type){
    this.name = name
    this.playArea = playAreaDom
    this.wins = 0
    this.draws = 0
    this.choice = null
    this.type = null
    this.changeType(type)
    this.playArea.querySelector('.scores').innerText = `Won:${this.wins} Drawn:${this.draws}`
  }
  changeType(newType){
    if (this.type === newType) return
    this.type = newType
    console.log('switching type', this.type)
    // based on the player being human, validate the other choices, and change the DOM
    this.type === 'human' ? this.playArea.classList.remove('computer') : this.playArea.classList.add('computer')
    if (this.type === 'computer') this.choice = null //clear any previous choices for a computer player
  }
  changeChoice(newChoice){
    if (this.choice === newChoice) return
    if (this.type === 'computer') return //do not allow a choice for computer players
    this.choice = newChoice
    console.log('switching choice:',this.choice)
  }
  randomiseChoice(){
    //do not allow a random choice for human players
    if (this.type !== 'computer') return
    const choices = ['rock','paper','scissors','lizard','spock']
    this.choice = choices[Math.floor(Math.random()*choices.length)]
    console.log('randomised choice:',this.choice)
    // force the choice to be checked
    this.playArea.querySelector(`input[value=${this.choice}]`).checked = true
  }
  okToGo(){
    if(this.type === 'human' && this.choice !== null) return true
    if(this.type === 'computer') return true
    return false
  }
  reset(){
    this.status('') // Call it as blank to clear all the statuses
  }
  addDraw(){
    this.draws++
    this.playArea.querySelector('.scores').innerText = `Won:${this.wins} Drawn:${this.draws}`
    this.playArea.classList.add('draw')
  }
  addWin(){
    this.wins++
    this.playArea.querySelector('.scores').innerText = `Won:${this.wins} Drawn:${this.draws}`
    this.playArea.classList.add('won')
  }
  addLoss(){
    this.playArea.querySelector('.scores').innerText = `Won:${this.wins} Drawn:${this.draws}`
    this.playArea.classList.add('lost')
  }
  status(newStatus){
    switch (newStatus) {
      case 'thinking':
        this.playArea.classList.add('thinking')
        break
      case 'decided':
        this.status('') //clear the other statuses
        this.playArea.classList.add('decided')
        break
      default:
        this.playArea.classList.remove('decided','thinking','won','lost','draw')
    }
  }
}
