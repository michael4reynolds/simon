// Utilities
function randomNote() {
  return Math.floor(Math.random() * 4)
}

function sleep(ms = 0) {
  let timeout
  const promise = new Promise(r => timeout = setTimeout(r, ms))
  promise.cancel = () => clearTimeout(timeout)

  return promise
}

const arrayIsEqual = (arr1, arr2) => {
  return JSON.stringify(arr1.slice(0, arr2.length)) === JSON.stringify(arr2)
}

class Sound {
  constructor(src) {
    this.sound = document.createElement("audio")
    this.sound.src = src
    this.sound.setAttribute("preload", "auto")
    this.sound.setAttribute("controls", "none")
    this.sound.style.display = "none"
    document.body.appendChild(this.sound)
  }

  play() {
    this.sound.play()
  }
}

// Model
const TURNS = {computer: 'computer', human: 'human'}
const STATES = {on: false, started: false, turn: TURNS.computer, strict: false, last: [], longest: []}
const GREEN = {key: 0, button: document.querySelector('#GreenBtn'), tone: 'sounds/simonSound0.mp3'}
const RED = {key: 1, button: document.querySelector('#RedBtn'), tone: 'sounds/simonSound1.mp3'}
const BLUE = {key: 2, button: document.querySelector('#BlueBtn'), tone: 'sounds/simonSound2.mp3'}
const YELLOW = {key: 3, button: document.querySelector('#YellowBtn'), tone: 'sounds/simonSound3.mp3'}
const recalled = []

const buttonsPads = [GREEN, RED, BLUE, YELLOW]
const PRESS = 'press'
const DELAY = 500
const DELAY2 = 3000

// View
const gameOnBtn = document.querySelector('#GameOnBtn')
const gameOffBtn = document.querySelector('#GameOffBtn')
const scoreView = document.querySelector('#Score')
const startBtn = document.querySelector('#StartBtn')

// Controller
let resetState = (strict = false) => {
  STATES.turn = TURNS.computer
  STATES.last = []
  STATES.longest = []
  STATES.strict = strict
}

const addMove = () => {
  STATES.last.push(randomNote())
}

const playMove = async function (move) {
  let sound = new Sound(buttonsPads[move].tone)
  sound.play()
  let button = buttonsPads[move].button
  button.classList.add(PRESS)
  await sleep(DELAY)
  button.classList.remove(PRESS)
  await sleep(DELAY)
}

const playMoves = async () => {
  STATES.turn = TURNS.computer
  for (let move of STATES.last) {
    if (!STATES.on || !STATES.started) break
    await playMove(move)
  }
}

const listen = async () => {
  STATES.turn = TURNS.human
}

const playGame = async () => {
  while (STATES.on && STATES.started) {
    addMove()
    console.log(STATES.last)
    await playMoves()
    await listen()
  }
}

const beginGame = async () => {
  if (!STATES.on) return
  STATES.started = !STATES.started
  resetState(STATES.strict)
  await playGame()
}

// Events
buttonsPads.forEach(pad => {
  pad.button.onmousedown = () => {
    if (STATES.turn === TURNS.computer) return
    pad.button.classList.add(PRESS)
    new Sound(pad.tone).play()
  }
  pad.button.onmouseup = async () => {
    pad.button.classList.remove(PRESS)
  }
})

gameOffBtn.onclick = () => {
  gameOnBtn.classList.remove('active')
  gameOffBtn.classList.add('active')
  STATES.on = false
  STATES.started = false
  resetState(false)
}

gameOnBtn.onclick = () => {
  gameOffBtn.classList.remove('active')
  gameOnBtn.classList.add('active')
  STATES.on = true
}

startBtn.onclick = () => {
  if (!STATES.on) return
  beginGame()
}

// Initialize
function init() {
  try {
    gameOffBtn.classList.add('active')
  } catch (e) {
    console.log(e)
  }
}

init()