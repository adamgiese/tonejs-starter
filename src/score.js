import teoria from 'teoria'
window.teoria = teoria
import transposeFromScales from './shared/transposeFromScales.js'
import isValidNote from './shared/isValidNote.js'
import replaceNote from './shared/replaceNote.js'
const scale = (root, scaleName) => teoria.note(root).scale(scaleName).simple()

const score = (synths, Tone) => {
  const {
    arpeggioSynth,
    pingSynth,
    chordSynth,
  } = synths

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

  const getSeconds = x => Tone.Time(x).toSeconds()

  const ping = (note, time = '0:0:0', velocity = .7) => {
    console.log(note, time, velocity)
    Tone.Transport.schedule((time) => {
      pingSynth.triggerAttackRelease(note, "1n", time, velocity)
    }, Tone.Time(time));
  }

  const playNote = synth => ({note, time, velocity, duration, release = 0}) => {
    Tone.Transport.schedule(t => {
      const noteDuration = getSeconds(duration) - getSeconds(release)
      synth.triggerAttackRelease(note, noteDuration, t, velocity)
    }, Tone.Time(time))

    return getSeconds(duration)
  }

  const playChord = obj => {
    obj.notes.forEach(note => {
      playNote(chordSynth)({
        ...obj,
        note,
      })
    })
    return getSeconds(obj.duration)
  }

  /* Loop Constants */
  const LOOP_NOTE_DURATION = '8n'

  /* Loop Helper Functions */
  const getLoopDuration = notes => notes.length * getSeconds(LOOP_NOTE_DURATION)
  const getLoop = notes => time => {
    arpeggiateNotes(LOOP_NOTE_DURATION, time)(notes).forEach(x => {
      if (isValidNote(x[0])) {
        arpeggioSynth.triggerAttackRelease(...x, .1)
      }
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

    const I = 'C4|C4|r|B4|r|G4|r|E5|r|B4|r|B4|C5|r|D4|r'.split('|')
    const IIb = I.map(transpose('up', scale('db', 'lydian')))
    const IV = I.map(transpose('up', scale('f', 'lydian')))
    const iv = I.map(transpose('up', scale('f', 'minor')))
    const V = I.map(transpose('up', scale('g', 'mixolydian')))
    const VIb = I.map(transpose('down', scale('ab', 'ionian')))
    const VIIb = I.map(transpose('down', scale('bb', 'ionian')))
    const viio = I.map(transpose('down', ['b', 'c', 'd', 'e', 'f', 'g', 'ab']))

    primary = {
      I,
      IIb,
      iv,
      IV,
      V,
      VIb,
      VIIb,
      viio,
    }
  }

  /* MUSIC UP IN HERE */

  const playArpeggio = (chord, time) => createLoop(primary[chord], time, 1)

  /* opening "ethereal" chords */
  playChord({ // a 'drone' root
    notes: ['C3'],
    time: runningTime,
    velocity: .2,
    duration: '23:0:0',
  })
  runningTime += getSeconds('2:0:0') // empty space
  runningTime += playChord({
    notes: ['A3','C4','F4'],
    time: runningTime,
    velocity: .5,
    duration: '2:0:0',
    release: '32n',
  })

  runningTime += playChord({
    notes: ['G3','C4','G4'],
    time: runningTime,
    velocity: .3,
    duration: '2:0:0'
  })
  runningTime += getSeconds('2:0:0')

  runningTime += playChord({
    notes: ['C4', 'D4', 'Ab4'],
    time: runningTime,
    velocity: .5,
    duration: '2:0:0',
    release: '32n',
  })

  runningTime += playChord({
    notes: ['C4', 'E4', 'G4'],
    time: runningTime,
    velocity: .3,
    duration: '2:0:0'
  })
  runningTime += getSeconds('4:0:0')

  runningTime += playChord({
    notes: ['Ab3', 'Db4', 'F4'],
    time: runningTime,
    velocity: .5,
    duration: '4:0:0',
    release: '32n',
  })

  runningTime += playChord({
    notes: ['G3', 'C4', 'E4'],
    time: runningTime,
    velocity: .25,
    duration: '3:0:0'
  })

  runningTime += getSeconds('1:0:0')

  /* introduce arpeggiation */
  playChord({
    notes: ['C3', 'C4', 'G4', 'E5'],
    time: runningTime,
    velocity: .1,
    duration: '4:0:0',
  })
  runningTime += playArpeggio('I', runningTime)
  runningTime += playArpeggio('I', runningTime)

  playChord({
    notes: ['C3', 'C4', 'A4', 'G5'],
    time: runningTime,
    velocity: .1,
    duration: '2:0:0',
  })
  runningTime += playArpeggio('IV', runningTime)
  playChord({
    notes: ['F5'],
    time: runningTime,
    velocity: .1,
    duration: '2:0:0',
  })
  runningTime += playArpeggio('IV', runningTime)

  playChord({
    notes: ['C4', 'G4', 'E5'],
    time: runningTime,
    velocity: .1,
    duration: '4:0:0',
    release: '16n',
  })
  runningTime += playArpeggio('I', runningTime)
  runningTime += playArpeggio('I', runningTime)

  playChord({
    notes: ['Ab4', 'F5'],
    time: runningTime,
    velocity: .1,
    duration: '4:0:0',
    release: '16n',
  })
  runningTime += playArpeggio('iv', runningTime)
  runningTime += playArpeggio('viio', runningTime)
  runningTime += playArpeggio('I', runningTime)

  /* add chime response */

  /* riffing */



  /* misc notes */
  /*
  ping('C5', runningTime, 1)
  arp([ 'I', 'I', 'IV', 'IV' ])

  ping('G4', runningTime, 1)
  arp([ 'I', 'I', 'V', 'IV', 'I', 'I', 'VIb', 'VIIb', 'I', 'I'])
  */
  return runningTime
}

export default score
