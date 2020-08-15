import teoria from 'teoria'

const transposeFromScales = (oldScale, newScale) => direction => (_note) => {
  const note = teoria.note(_note)

  const oldName = `${note.name()}${note.accidental()}`
  const oldOctave = note.octave()

  const newName = newScale[oldScale.indexOf(oldName)].toUpperCase()
  const isOriginalHigher = note.midi() > teoria.note(`${newName}${oldOctave}`).midi()

  const getOctaveOffset = () => {
    const isUp = direction === 'up'
    const isDown = !isUp

    if (isUp && isOriginalHigher) {
      return 1
    }
    if (isUp && !isOriginalHigher) {
      return 0
    }
    if (isDown && isOriginalHigher) {
      return 0
    }
    if (isDown && !isOriginalHigher) {
      return -1
    }
  }
  const octaveOffset = getOctaveOffset()

  const newOctave = oldOctave + octaveOffset

  return `${newName}${newOctave}`
}

const cLydian = teoria.note('c').scale('lydian').simple()
const aDorian = teoria.note('a').scale('dorian').simple()
const fromCLydianToADorian = transposeFromScales(cLydian, aDorian)('down')

const arpeggios = (synth, Tone) => {
  const {
    Transport,
    Time,
    Loop,
  } = Tone

  /* possibly make its own helper function */
  const arpeggiateNotes = (duration, offset = 0) => notes => {
    return notes.map((note, index) => {
      return [
        note,
        duration,
        offset + Time(duration).toSeconds() * index,
        ]
    })
  }

  /* the initial arpeggios that launch off the song */

  const OPENING_LOOP_ITERATION = 4
  const OPENING_LOOP_NOTES = 'C3|E3|G3|B3|D4|E4|G4|F#4|D4|B3|G3|D3'.split('|')
  const OPENING_LOOP_NOTE_DURATION = '16n'

  const openingLoopDuration = OPENING_LOOP_NOTES.length * Time(OPENING_LOOP_NOTE_DURATION).toSeconds()

  const openingLoop = new Loop(time => {
    arpeggiateNotes(OPENING_LOOP_NOTE_DURATION, time)(OPENING_LOOP_NOTES).forEach(x => {
      synth.triggerAttackRelease(...x)
    })
  }, openingLoopDuration).start(0)
  openingLoop.iterations = OPENING_LOOP_ITERATION

  /* followup with a lowered arpeggio */
  const FOLLOWUP_LOOP_ITERATION = OPENING_LOOP_ITERATION
  const FOLLOWUP_LOOP_NOTE_DURATION = '16n'
  const FOLLOWUP_LOOP_NOTES = OPENING_LOOP_NOTES.map(fromCLydianToADorian)
  const followupLoopDuration = FOLLOWUP_LOOP_NOTES.length * Time(FOLLOWUP_LOOP_NOTE_DURATION).toSeconds()

  const followupLoop = new Loop(time => {
    arpeggiateNotes(FOLLOWUP_LOOP_NOTE_DURATION, time)(FOLLOWUP_LOOP_NOTES).forEach(x => {
      synth.triggerAttackRelease(...x)
    })
  }, followupLoopDuration).start(openingLoopDuration * OPENING_LOOP_ITERATION)
  followupLoop.iterations = FOLLOWUP_LOOP_ITERATION
}

export default arpeggios
