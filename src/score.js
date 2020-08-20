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

const scale = (root, scaleName) => teoria.note(root).scale(scaleName).simple()
const cLydian = teoria.note('c').scale('lydian').simple()
const dMixolydian = teoria.note('d').scale('mixolydian').simple()
const eAeolian = teoria.note('e').scale('aeolian').simple()
const fsLocrian = teoria.note('f#').scale('locrian').simple()
const gIonian = teoria.note('g').scale('ionian').simple()
const aDorian = teoria.note('a').scale('dorian').simple()
const bPhrygian = teoria.note('b').scale('phrygian').simple()

const score = (synths, Tone) => {
  const [arpeggioSynth, pingSynth] = synths
  const {
    Transport,
    Time,
    Loop,
  } = Tone

  let runningTime = Time('0:0:0').toSeconds()

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


  const ping = (note, time = '0:0:0', velocity = .7) => {
    console.log(note, time, velocity)
    Tone.Transport.schedule((time) => {
      console.log(time)
      pingSynth.triggerAttackRelease(note, "1n", time, velocity)
    }, Tone.Time(time));
  }
  Tone.Transport.schedule(function(time){
	//do something with the time
}, "16:0:0");

  /* Loop Constants */
  const LOOP_ITERATIONS = 2
  const LOOP_ITERATIONS_QUICK = 1
  const LOOP_NOTE_DURATION = '16n'

  /* Loop Helper Functions */
  const getLoopDuration = notes => notes.length * Time(LOOP_NOTE_DURATION).toSeconds()
  const getLoop = notes => time => {
    arpeggiateNotes(LOOP_NOTE_DURATION, time)(notes).forEach(x => {
      arpeggioSynth.triggerAttackRelease(...x, .1)
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
    const key = scale('c', 'major')
    const transpose = (direction, to) => transposeFromScales(key, to)(direction)

    const I = 'C3|C4|G4|E4|D4|C4'.split('|').flatMap(x => [x,x])
    const IV = I.map(transpose('up', scale('f', 'lydian')))
    const V = I.map(transpose('up', scale('g', 'mixolydian')))
    const VIb = I.map(transpose('down', scale('ab', 'ionian')))
    const VIIb = I.map(transpose('down', scale('bb', 'ionian')))

    primary = {
      I,
      IV,
      V,
      VIb,
      VIIb,
    }
  }

  /* MUSIC UP IN HERE */

  [
    'I', 'I',
    'IV', 'IV',
    'I', 'I',
    'V', 'IV',
    'I', 'I',
    'VIb', 'VIIb',
    'I', 'I',
  ].forEach(chord => {
    runningTime += createLoop(primary[chord], runningTime, 1)
  })

  ping('C5', '0:0:0', 1)
  ping('G4', '4:0:0', 1)
}

export default score
