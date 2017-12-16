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
const STATES = {
  on: false, started: false, turn: TURNS.computer, strict: false,
  last: [], recalled: [], lost: false, pressed: false, timeout: false,
}
const SAVED = {last: [], longest: []}
const GREEN = {key: 0, button: document.querySelector('#GreenBtn'), tone: 'sounds/simonSound0.mp3'}
const RED = {key: 1, button: document.querySelector('#RedBtn'), tone: 'sounds/simonSound1.mp3'}
const BLUE = {key: 2, button: document.querySelector('#BlueBtn'), tone: 'sounds/simonSound2.mp3'}
const YELLOW = {key: 3, button: document.querySelector('#YellowBtn'), tone: 'sounds/simonSound3.mp3'}
let timer
let timer1
let timer2

const buttonsPads = [GREEN, RED, BLUE, YELLOW]
const PRESS = 'press'
const DELAY = 500
const DELAY2 = 5000

// View
const gameOnBtn = document.querySelector('#GameOnBtn')
const gameOffBtn = document.querySelector('#GameOffBtn')
const scoreView = document.querySelector('#Score')
const startBtn = document.querySelector('#StartBtn')

// Controller
let resetState = (strict = false) => {
  SAVED.last = STATES.last
  STATES.turn = TURNS.computer
  STATES.last = []
  STATES.lost = false
  STATES.strict = strict
}

let cancelTimers = () => {
  if (timer) timer.cancel()
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
  STATES.recalled = []
  for (let move of STATES.last) {
    if (!STATES.on || !STATES.started) break
    await playMove(move)
  }
}

let running = () => STATES.on && STATES.started

const listen = async () => {
  // todo: set listen timer to reset after each button press
  STATES.turn = TURNS.human

  checkTimeout(DELAY2)

  while (!STATES.timeout) {
    await sleep(1000)
  }
}

const playGame = async () => {
  while (running()) {
    if (STATES.lost) {
      console.log('Lost last round')
    } else {
      addMove()
    }
    console.log(STATES.lost, STATES.last)
    await playMoves()
    await listen()
  }
  resetState()
  cancelTimers()
}

const beginGame = async () => {
  if (!STATES.on) return
  STATES.started = !STATES.started
  resetState(STATES.strict)
  await playGame()
}

const playTone = tone => {
  new Sound(tone).play()
}

const setTimeoutState = () => {
  console.log(STATES.pressed, STATES.last, STATES.recalled)
  if (!STATES.pressed) {
    STATES.timeout = true
    // todo: check for equal here
    // if ( STATES.recalled.length === 0) STATES.lost = true
  }
  STATES.pressed = false
}

const checkTimeout = async function (delay = 0) {
  STATES.timeout = false
  await sleep(delay)
  setTimeoutState()
}

// Events
buttonsPads.forEach(pad => {
  pad.button.onmousedown = () => {
    if (STATES.turn === TURNS.computer) return
    pad.button.classList.add(PRESS)
    STATES.recalled.push(pad.key)
    // todo: create tone for incorrect entry
    playTone(pad.tone)
    STATES.pressed = true
  }
  pad.button.onmouseup = async () => {
    pad.button.classList.remove(PRESS)
    STATES.lost = arrayIsEqual(STATES.last, STATES.recalled)
    await checkTimeout(DELAY2)
  }
})

gameOffBtn.onclick = () => {
  gameOnBtn.classList.remove('active')
  gameOffBtn.classList.add('active')
  STATES.on = false
  STATES.started = false
  resetState(false)
  cancelTimers()
}

gameOnBtn.onclick = () => {
  gameOffBtn.classList.remove('active')
  gameOnBtn.classList.add('active')
  STATES.on = true
}

startBtn.onclick = () => {
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