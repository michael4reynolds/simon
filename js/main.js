// Utilities
function randomNote() {
  return Math.floor(Math.random() * 4)
}

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms))
}

// Model
const BLUE = {button: document.querySelector('.blueBtn')}
const YELLOW = {button: document.querySelector('.yellowBtn')}
const GREEN = {button: document.querySelector('.greenBtn')}
const RED = {button: document.querySelector('.redBtn')}

const buttonsPads = [BLUE, YELLOW, GREEN, RED]
const PRESS = 'press'
const DELAY = 500
let LISTENING = false
let GAMEOVER = false


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
  console.log('finished waiting')
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
    console.log('clicked')
    if (LISTENING)
      console.log('heard')
      pad.button.classList.add(PRESS)
  }
  pad.button.onmouseup = () => {
    if (LISTENING)
      pad.button.classList.remove(PRESS)
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