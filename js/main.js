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

  stop() {
    this.sound.pause()
    this.sound.currentTime = 0
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
const winningTone = 'sounds/simonWin.mp3'
let timer
let winTimer
let timesUp
let padTimer
let currentTone

const buttonsPads = [GREEN, RED, BLUE, YELLOW]
const PRESS = 'press'
const DELAY = 500
const DELAY2 = 2000
const LIMIT = 20

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
  if (winTimer) clearTimeout(winTimer)
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
    if (!STATES.lost) addMove()
    STATES.turn = TURNS.computer
    STATES.recalled = []
    STATES.pressed = false
    await playMoves()

    STATES.turn = TURNS.human
    timer = setTimeout(async () => {
      if (!STATES.pressed) {
        STATES.lost = true
        if (STATES.strict) {
          resetState(STATES.strict)
        }
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

const gameTone = tone => new Sound(tone)

async function checkInput(pad) {
  STATES.recalled.push(pad.key)
  STATES.lost = false

  for (const [i, v] of STATES.recalled.entries()) {
    if (STATES.last[i] !== v) {
      STATES.lost = true
      break
    }
  }
  let tone = STATES.lost ? errorTone : pad.tone
  currentTone = gameTone(tone)
  currentTone.play()

  padTimer = sleep(3000)
  return padTimer
}

const checkForWin = () => {
  let won = false
  if (STATES.last.length === LIMIT) {
    won = STATES.recalled.length === LIMIT &&
      STATES.last[LIMIT] === STATES.recalled[LIMIT]
  }
  return won
}

const stopSound = function () {
  timesUp = true
  currentTone.stop()
}

const alertWinner = async () => {
  STATES.turn = TURNS.computer
  timesUp = false
  currentTone = gameTone(winningTone)
  currentTone.play()
  winTimer = setTimeout(() => {
    stopSound()
  }, 5000)
  let x = 0
  while (STATES.on && !timesUp) {
    let i = x++ % 4
    buttonsPads[i].button.classList.add(PRESS)
    timer = sleep(100)
    await timer
    buttonsPads[i].button.classList.remove(PRESS)
  }
  console.log('You Won!')
}

// Events
buttonsPads.forEach(pad => {
  pad.button.onmousedown = () => {
    if (STATES.turn === TURNS.computer) return
    cancelTimers()
    pad.button.classList.add(PRESS)
    STATES.pressed = true

    checkInput(pad).then(async () => {
      if (checkForWin()) {
        await alertWinner()
        resetState(STATES.strict)
        return
      } else if (STATES.strict && STATES.lost) {
        resetState(STATES.strict)
      }
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
  strictBtn.classList.remove('active')
  STATES.on = false
  STATES.started = false
  stopSound()
  resetState(false)
  cancelTimers()
}

gameOnBtn.onclick = () => {
  gameOffBtn.classList.remove('active')
  gameOnBtn.classList.add('active')
  STATES.on = true
}

startBtn.onclick = () => {
  stopSound()
  beginGame()
}

strictBtn.onclick = () => {
  if (!STATES.on) return
  if (!STATES.strict) {
    STATES.strict = true
    strictBtn.classList.add('active')
  } else {
    STATES.strict = false
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