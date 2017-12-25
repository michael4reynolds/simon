// Utilities
function randomNote() {
  return Math.floor(Math.random() * 4)
}

function sleep(ms = 0, x) {
  let timeout
  // const promise = new Promise(r => timeout = setTimeout(r, ms))
  const promise = new Promise(r => timeout = setTimeout(() => r(x), ms))
  promise.cancel = () => clearTimeout(timeout)

  return promise
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
const errorTone = 'sounds/simonError.mp3'
let timer
let padTimer

const buttonsPads = [GREEN, RED, BLUE, YELLOW]
const PRESS = 'press'
const DELAY = 500
const DELAY2 = 3000

// View
const gameOnBtn = document.querySelector('#GameOnBtn')
const gameOffBtn = document.querySelector('#GameOffBtn')
const scoreView = document.querySelector('#Score')
const startBtn = document.querySelector('#StartBtn')
const strictBtn = document.querySelector('#StrictBtn')

// Controller
let resetState = (strict = false) => {
  SAVED.last = STATES.last
  STATES.turn = TURNS.computer
  STATES.last = []
  STATES.lost = false
  STATES.strict = strict
}

let cancelTimers = () => {
  if (timer) clearTimeout(timer)
  if (padTimer) padTimer.cancel()
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
  for (let move of STATES.last) {
    if (!STATES.on || !STATES.started) break
    await playMove(move)
  }
}

let running = () => STATES.on && STATES.started

const playGame = async () => {
  if (running()) {
    if (STATES.lost) {
      console.log('Lost last round')
    } else {
      addMove()
    }
    STATES.turn = TURNS.computer
    STATES.recalled = []
    await playMoves()

    STATES.turn = TURNS.human
    timer = setTimeout(async () => {
      console.log('timer finished')
      if (!STATES.pressed) {
        STATES.lost = true
        console.log('timed out!')
        await playGame()
      }
    }, DELAY2)
  }
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

async function checkInput(pad) {
  STATES.recalled.push(pad.key)
  STATES.lost = false

  for (const [i, v] of STATES.recalled.entries()) {
    if (STATES.last[i] !== v) {
      console.log('wrong!')
      STATES.lost = true
      break
    }
  }
  // todo: create tone for incorrect entry
  let tone = STATES.lost ? errorTone : pad.tone
  playTone(tone)

  // set up timeout here
  padTimer = sleep(3000)
  return padTimer
}

// Events
buttonsPads.forEach(pad => {
  pad.button.onmousedown = () => {
    if (STATES.turn === TURNS.computer) return
    cancelTimers()
    pad.button.classList.add(PRESS)
    STATES.pressed = true

    checkInput(pad).then(async () => {
      await playGame()
    })
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

strictBtn.onclick = () => {
  if (!strictBtn.classList.contains('active')) {
    strictBtn.classList.add('active')
  } else {
    strictBtn.classList.remove('active')
  }
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