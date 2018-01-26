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
const GREEN = {key: 0, button: document.querySelector('#greenPad'), tone: 'sounds/simonSound0.mp3'}
const RED = {key: 1, button: document.querySelector('#redPad'), tone: 'sounds/simonSound1.mp3'}
const BLUE = {key: 2, button: document.querySelector('#bluePad'), tone: 'sounds/simonSound2.mp3'}
const YELLOW = {key: 3, button: document.querySelector('#yellowPad'), tone: 'sounds/simonSound3.mp3'}
const errorTone = 'sounds/simonError.mp3'
const winningTone = 'sounds/simonWin.mp3'
let timer
let winTimer
let timesUp
let padTimer
let currentTone

const buttonsPads = [GREEN, RED, BLUE, YELLOW]
const PRESS = 'press'
let DELAY = 500
let DELAY2 = 2000
let DELAY3 = 3000
let DELAY4 = 5000
const LIMIT = 20

// View
const gameOnBtn = document.querySelector('#onOffButton')
const countView = document.querySelector('#countDisplay')
const startBtn = document.querySelector('#startControl')
const strictBtn = document.querySelector('#strictControl')
const lastBtn = document.querySelector('#lastControl')
const longestBtn = document.querySelector('#longestControl')

// Controller
let resetState = (strict = false) => {
  STATES.turn = TURNS.computer
  STATES.last = []
  STATES.lost = false
  STATES.strict = strict
  DELAY = 500
  DELAY2 = 2000
  DELAY3 = 3000
  DELAY4 = 5000
}

let cancelTimers = () => {
  if (timer) clearTimeout(timer)
  if (winTimer) clearTimeout(winTimer)
  if (padTimer) padTimer.cancel()
}

let reduceDelays = () => {
  DELAY = 250
  DELAY2 = 1500
  DELAY3 = 2000
  DELAY4 = 2500
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

const playMoves = async (moves) => {
  for (let move of moves) {
    if (!STATES.on || !STATES.started) break
    await playMove(move)
  }
}

let running = () => STATES.on && STATES.started

const playGame = async () => {
  if (running()) {
    if (!STATES.lost) {
      SAVED.last = STATES.recalled
      if (STATES.last.length > SAVED.longest.length) SAVED.longest = STATES.recalled

      addMove()
    }
    countView.text = `${STATES.last.length}`.padStart(2, '0')
    if (STATES.last.length === 5) reduceDelays()
    STATES.turn = TURNS.computer
    STATES.recalled = []
    STATES.pressed = false
    await playMoves(STATES.last)

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

  padTimer = sleep(DELAY3)
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
  if (currentTone) currentTone.stop()
}

const alertWinner = async () => {
  STATES.turn = TURNS.computer
  timesUp = false
  currentTone = gameTone(winningTone)
  currentTone.play()
  winTimer = setTimeout(() => {
    stopSound()
  }, DELAY4)
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

// gameOffBtn.onclick = () => {
//   gameOnBtn.classList.remove('active')
//   gameOffBtn.classList.add('active')
//   strictBtn.classList.remove('active')
//   STATES.on = false
//   STATES.started = false
//   countView.textContent = ''
//   stopSound()
//   resetState(false)
//   cancelTimers()
// }

gameOnBtn.onclick = () => {
  const gameIsON = gameOnBtn.classList.contains('active')
  gameOnBtn.classList.toggle('active')

  if (gameIsON) {
    STATES.on = false
    STATES.started = false
    countView.text = ''
    stopSound()
    resetState(false)
    cancelTimers()
  } else {
    STATES.on = true
  }
}

startBtn.onclick = () => {
  startBtn.classList.add('active')
  setTimeout(() => {
    startBtn.classList.remove('active')
  }, 150)
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

lastBtn.onclick = async () => {
  if (!STATES.on || STATES.started) return
  if (SAVED.last.length > 4) reduceDelays()
  STATES.started = true
  lastBtn.querySelectorAll('circle')[1].classList.add('active')
  await playMoves(SAVED.last)
  lastBtn.querySelectorAll('circle')[1].classList.remove('active')
  STATES.started = false
}

longestBtn.onclick = async () => {
  if (!STATES.on || STATES.started) return
  if (SAVED.longest.length > 4) reduceDelays()
  STATES.started = true
  longestBtn.querySelectorAll('circle')[1].classList.add('active')
  await playMoves(SAVED.longest)
  longestBtn.querySelectorAll('circle')[1].classList.remove('active')
  STATES.started = false
}

// Initialize
function init() {
  try {
    // gameOffBtn.classList.add('active')
  } catch (e) {
    console.log(e)
  }
}

init()