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
const BLUE = {key: 0, button: document.querySelector('.blueBtn'), tone: 'sounds/simonSound1.mp3'}
const YELLOW = {key: 1, button: document.querySelector('.yellowBtn'), tone: 'sounds/simonSound2.mp3'}
const GREEN = {key: 2, button: document.querySelector('.greenBtn'), tone: 'sounds/simonSound3.mp3'}
const RED = {key: 3, button: document.querySelector('.redBtn'), tone: 'sounds/simonSound4.mp3'}

const buttonsPads = [BLUE, YELLOW, GREEN, RED]
const PRESS = 'press'
const DELAY = 500
let padSound
let LISTENING = false
let GAME_OVER = false
let timer

let notes = []
let recalled = []
let count = 0

// View

// Controller
const addNote = () => {
  let newNote = randomNote()
  notes.push(newNote)
}

async function playNotes() {
  LISTENING = false
  let play = async () => {
    for (let note of notes) {
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
  addNote()
  console.log(notes)
  recalled = []
  await playNotes()
  LISTENING = true
}

function endGame() {
  count = notes.length - 1
  GAME_OVER = true
  LISTENING = false
  console.log('GAME OVER')
  console.log(`SCORE: ${count}`)
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
      console.log('turn over')
      await newTurn()
    }
  }
})

// Initialize
function init() {
  try {
    newTurn()
  } catch (e) {
    console.log(e)
  }
}

init()