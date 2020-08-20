import teoria from 'teoria'
import transposeFromScales from './shared/transposeFromScales.js'
import isValidNote from './shared/isValidNote.js'
const scale = (root, scaleName) => teoria.note(root).scale(scaleName).simple()

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

  /* Loop Constants */
  const LOOP_NOTE_DURATION = '16n'

  /* Loop Helper Functions */
  const getLoopDuration = notes => notes.length * Time(LOOP_NOTE_DURATION).toSeconds()
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

    const I = 'C4|C4|r|B4|r|G4|r|E5|r|B4|r|B4|C5|r|D4|r'.split('|').flatMap(x => [x,x])
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

  const playArpeggio = chord => runningTime += createLoop(primary[chord], runningTime, 1)
  const arp = chords => chords.forEach(playArpeggio)

  ping('C5', runningTime, 1)
  arp([ 'I', 'I', 'IV', 'IV' ])

  ping('G4', runningTime, 1)
  arp([ 'I', 'I', 'V', 'IV', 'I', 'I', 'VIb', 'VIIb', 'I', 'I'])
}

export default score
