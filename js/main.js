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
  console.log(arr1)
  console.log(arr2)
  console.log(`arr1_slice: ${arr1.slice(0, arr2.length)}`)
  console.log(`arr2__full: ${arr2}`)
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
  on: false, started: false, turn: TURNS.computer,
  strict: false, last: [], recalled: [], lost: false
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
const DELAY2 = 3000

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
  if (timer) {
    timer.cancel()
    timer1.cancel()
    timer2.cancel()
  }
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
let buttonPressed = length => length < STATES.last.length

const listen = async () => {
  // todo: set listen timer to reset after each button press
  STATES.turn = TURNS.human
  let length = STATES.recalled.length
  timer = await sleep(DELAY2)

  if (buttonPressed(length)) {
    console.log('Pressed')
    if (arrayIsEqual(STATES.last, STATES.recalled)) {
      console.log('Equal')
      STATES.lost = false
    } else {
      console.log('Not Equal')
      STATES.lost = true
      // if (STATES.strict) return
    }
  } else { // timed-out
    console.log('Timed out')
    STATES.lost = true
    // if (STATES.strict) return
  }
}

const playGame = async () => {
  while (running()) {
    if (STATES.lost) {
      console.log('Lost last round')
    } else {
      addMove();
    }
    console.log(STATES.last)
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

let playTone = tone => {
  new Sound(tone).play()
}

// Events
buttonsPads.forEach(pad => {
  pad.button.onmousedown = () => {
    if (STATES.turn === TURNS.computer) return
    pad.button.classList.add(PRESS)
    STATES.recalled.push(pad.key)
    // todo: create tone for incorrect entry
    playTone(pad.tone)
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