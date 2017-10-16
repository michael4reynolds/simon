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

// Model
const BLUE = {key: 0, button: document.querySelector('.blueBtn')}
const YELLOW = {key: 1, button: document.querySelector('.yellowBtn')}
const GREEN = {key: 2, button: document.querySelector('.greenBtn')}
const RED = {key: 3, button: document.querySelector('.redBtn')}

const buttonsPads = [BLUE, YELLOW, GREEN, RED]
const PRESS = 'press'
const DELAY = 500
let LISTENING = false
let GAMEOVER = false
let timer


let notes = []
let recalled = []
let count = 0
let tally = 0

// View

// Controller
const addNote = () => {
  let newNote = randomNote()
  notes.push(newNote)
}

async function playNotes() {
  LISTENING = false
  console.log(notes)
  let play = async () => {
    for (let note of notes) {
      console.log(note)
      let button = buttonsPads[note].button
      button.classList.add(PRESS)
      await sleep(DELAY)
      button.classList.remove(PRESS)
      await sleep(DELAY)
    }
  }
  await play()
}

function addRecalledNote(pad) {
  recalled.push(pad.key)
  console.log(recalled)
}

function listen() {
  LISTENING = true
}

const startNewGame = async () => {
  addNote()
  await playNotes()
  listen()
}

// Events
buttonsPads.forEach(pad => {
  pad.button.onmousedown = () => {
    if (LISTENING) {
      pad.button.classList.add(PRESS)
    }
  }
  pad.button.onmouseup = async () => {
    if (LISTENING) {
      pad.button.classList.remove(PRESS)
      addRecalledNote(pad)
      if (timer) timer.cancel()
      timer = sleep(3000)
      await timer
      console.log('turn over')
    }
  }
})

// Initialize
function init() {
  try {
    startNewGame()
  } catch (e) {
    console.log(e)
  }
}

init()