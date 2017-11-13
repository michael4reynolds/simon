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
let padSound
let LISTENING = false
let GAME_OVER = true
let GAME_ON = false
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
  return GAME_OVER || !GAME_ON ? 0 : notes.length - 1
}

const addNote = () => {
  let newNote = randomNote()
  notes.push(newNote)
}

async function playNotes() {
  LISTENING = false
  let play = async () => {
    for (let note of notes) {
      if (GAME_OVER) break
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
  await play()
}

const newTurn = async () => {
  scoreView.textContent = getScore() + 1
  addNote()
  console.log(notes)
  recalled = []
  await playNotes()

  LISTENING = true
  timer = sleep(3000)
  await timer
  if (GAME_OVER) return
  if (recalled.length === 0) {
    console.log('times up!')
    endGame()
  }
}

function endGame() {
  scoreView.textContent = getScore()
  GAME_OVER = true
  LISTENING = false

  padSound = null
  timer = null
  notes = []

  console.log('GAME OVER')
}

function showScore() {
  scoreView.textContent = '0'
}

function hideScore() {
  scoreView.textContent = ''
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
      timer = sleep(3000)
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
  hideScore()
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
  if (GAME_ON && GAME_OVER) {
    GAME_OVER = false
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