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
const dMixolydian = teoria.note('d').scale('mixolydian').simple()
const eAeolian = teoria.note('e').scale('aeolian').simple()
const fsLocrian = teoria.note('f#').scale('locrian').simple()
const gIonian = teoria.note('g').scale('ionian').simple()
const aDorian = teoria.note('a').scale('dorian').simple()
const bPhrygian = teoria.note('b').scale('phrygian').simple()

const arpeggios = (synth, Tone) => {
  const {
    Transport,
    Time,
    Loop,
  } = Tone

  let runningTime = 0

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



  /* Loop Constants */
  const LOOP_ITERATIONS = 4
  const LOOP_ITERATIONS_QUICK = 2
  const LOOP_NOTE_DURATION = '16n'

  /* Loop Helper Functions */
  const getLoopDuration = notes => notes.length * Time(LOOP_NOTE_DURATION).toSeconds()
  const getLoop = notes => time => {
    arpeggiateNotes(LOOP_NOTE_DURATION, time)(notes).forEach(x => {
      synth.triggerAttackRelease(...x)
    })
  }

  const createLoop = (notes, time, iterations) => {
    // creates loop & returns length of loop
    const loop = getLoop(notes)
    const loopDuration = getLoopDuration(notes)

    new Loop(loop, loopDuration)
      .start(time)
      .set({iterations})

    return (iterations * loopDuration)
  }

  let primary; {
    const tonic = 'C3|E3|G3|B3|D4|E4|G4|F#4|D4|B3|G3|D3'.split('|')
    const submediant = tonic.map(transposeFromScales(cLydian,aDorian)('down'))
    const subdominant = tonic.map(transposeFromScales(cLydian,fsLocrian)('down'))
    const subtonic = tonic.map(transposeFromScales(cLydian,bPhrygian)('down'))
    const mediant = tonic.map(transposeFromScales(cLydian,eAeolian)('up'))

    primary = { tonic, submediant, subdominant, subtonic, mediant }
  }

  let secondary; {
    const tonic = 'C5|B4|G4|F#4|D4|C4|B3|G3|F#3|G3|E3|D3'.split('|')
    const supertonic = tonic.map(transposeFromScales(cLydian, dMixolydian)('up'))
    const subdominant = tonic.map(transposeFromScales(cLydian,fsLocrian)('up'))
    const dominant = tonic.map(transposeFromScales(cLydian,gIonian)('down'))
    const subtonic = tonic.map(transposeFromScales(cLydian,bPhrygian)('down'))

    secondary = {
      tonic,
      supertonic,
      subdominant,
      dominant,
      subtonic,
    }
  }

  /* music helper functions */

  const reverse = x => [...x].reverse()

  /* MUSIC UP IN HERE */

  runningTime += createLoop(primary.tonic, runningTime, LOOP_ITERATIONS)
  runningTime += createLoop(primary.submediant, runningTime, LOOP_ITERATIONS)
  runningTime += createLoop(primary.tonic, runningTime, LOOP_ITERATIONS)
  runningTime += createLoop(primary.subdominant, runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(primary.subtonic, runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(primary.tonic, runningTime, LOOP_ITERATIONS)
  runningTime += createLoop(primary.submediant, runningTime, LOOP_ITERATIONS)
  runningTime += createLoop(primary.tonic, runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(primary.mediant, runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(primary.submediant, runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(primary.subtonic, runningTime, LOOP_ITERATIONS_QUICK)

  runningTime += createLoop(secondary.tonic, runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(secondary.supertonic, runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(secondary.subdominant, runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(secondary.subtonic, runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(reverse(secondary.tonic), runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(reverse(secondary.subtonic), runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(reverse(secondary.dominant), runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(reverse(secondary.supertonic), runningTime, LOOP_ITERATIONS_QUICK)
  runningTime += createLoop(secondary.tonic, runningTime, LOOP_ITERATIONS_QUICK)
}

const pings = (synth, Tone) => {
  new Tone.Part((time, {note, velocity}) => {
    synth.triggerAttackRelease(note, "2n", time, velocity)
  }, [
    // pings
    [{
      time: '2:1:3',
      note: 'C6',
      velocity: 1,
    }],
    [{
      time: '3:1:2',
      note: 'G6',
      velocity: 1,
    }],
    [{
      time: '4:1:8',
      note: 'F#6',
      velocity: 1,
    }],
    [{
      time: '6:1:8',
      note: 'D6',
      velocity: .5,
    }],
  ]).start(0)
}

const score = (synths, Tone) => {
  const [arpeggioSynth, pingSynth] = synths
  arpeggios(arpeggioSynth, Tone)
  pings(pingSynth, Tone)
}

export default score
