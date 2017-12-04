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

  stop() {
    this.sound.pause()
  }
}

// Model
const GREEN = {key: 0, button: document.querySelector('#GreenBtn'), tone: 'sounds/simonSound0.mp3'}
const RED = {key: 1, button: document.querySelector('#RedBtn'), tone: 'sounds/simonSound1.mp3'}
const BLUE = {key: 2, button: document.querySelector('#BlueBtn'), tone: 'sounds/simonSound2.mp3'}
const YELLOW = {key: 3, button: document.querySelector('#YellowBtn'), tone: 'sounds/simonSound3.mp3'}

const buttonsPads = [GREEN, RED, BLUE, YELLOW]
const PRESS = 'press'
const DELAY = 500
const DELAY2 = 3000
let padSound
let LISTENING = false
let GAME_OVER = true
let GAME_ON = false
let STRICT_MODE = false
let RESTART = false
let timer

let notes = []
let recalled = []

// View
const gameOnBtn = document.querySelector('#GameOnBtn')
const gameOffBtn = document.querySelector('#GameOffBtn')
const scoreView = document.querySelector('#Score')
const startBtn = document.querySelector('#StartBtn')

// Controller
function getScore() {
  if (!GAME_ON) return ''
  return GAME_OVER ? 0 : notes.length
}

const addNote = () => {
  let newNote = randomNote()
  notes.push(newNote)
}

async function playNotes() {
  LISTENING = false
  let play = async () => {
    for (let note of notes) {
      if (GAME_OVER || RESTART) {
        console.log('BREAK')
        break;
      } else {
        console.log(`playing: ${note}`)
        let button = buttonsPads[note].button
        padSound = new Sound(buttonsPads[note].tone)
        button.classList.add(PRESS)
        padSound.play()
        await sleep(DELAY)
        button.classList.remove(PRESS)
        // padSound.stop()
        await sleep(DELAY)
      }
    }
  }
  if (!(GAME_OVER || RESTART)) await play()
}

const newTurn = async (retry = false) => {
  scoreView.textContent = retry ? getScore() - 1 : getScore()
  if (!retry) addNote()
  console.log(notes)
  recalled = []
  await playNotes()

  RESTART = false
  LISTENING = true
  timer = sleep(DELAY2)
  await timer
  if (GAME_OVER) return
  if (recalled.length === 0) {
    console.log('times up!')
    endGame()
  }
}

async function endGame() {
  LISTENING = false
  padSound = null
  timer = null
  scoreView.textContent = !GAME_ON ? '' : `${getScore() - 1}`

  if (STRICT_MODE || !GAME_ON) {
    GAME_OVER = true
    notes = []
    console.log('GAME OVER')
  } else {
    console.log('Try again')
    timer = sleep(2000)
    await timer
    await newTurn(true)
  }
}

function showScore() {
  scoreView.textContent = '0'
}

// Events
buttonsPads.forEach(pad => {
  pad.button.onmousedown = () => {
    if (LISTENING) {
      pad.button.classList.add(PRESS)
      padSound = new Sound(pad.tone)
      padSound.play()
    }
  }
  pad.button.onmouseup = async () => {
    if (LISTENING) {
      pad.button.classList.remove(PRESS)
      // padSound.stop()
      recalled.push(pad.key)
      if (timer) timer.cancel()
      if (!arrayIsEqual(notes, recalled)) {
        endGame()
        return
      }
      timer = sleep(DELAY2)
      await timer
      if (notes.length !== recalled.length) {
        endGame()
        return
      }
      console.log('turn over')
      await newTurn()
    }
  }
})

gameOffBtn.onclick = () => {
  console.log('off switch')
  GAME_ON = false
  endGame()
  gameOnBtn.classList.remove('active')
  gameOffBtn.classList.add('active')
}

gameOnBtn.onclick = () => {
  console.log('on switch')
  GAME_ON = true
  showScore()
  gameOffBtn.classList.remove('active')
  gameOnBtn.classList.add('active')
}

startBtn.onclick = () => {
  if (GAME_ON) {
    LISTENING = false
    padSound = null
    timer = null
    GAME_OVER = false
    RESTART = true
    notes = []
    showScore()
    newTurn()
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