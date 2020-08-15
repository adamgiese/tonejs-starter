import * as Tone from 'tone'
import arpeggio from './score/arpeggio'

/* Effects */

const Reverb = new Tone.Reverb(3).toDestination();

/* Setup the Synth */
const arpeggioSynth = new Tone.Synth({
  "oscillator": {
    "phase": 0,
    "type": "sine"
  }
}).connect(Reverb)


/* Add the Effects & "Wiring" */

Tone.Transport.timeSignature = 3
arpeggioSynth.toDestination()

/* Connect the MUSIC */
arpeggio(arpeggioSynth, Tone)

const controls = {
  play: () => {
    console.log('play')
    Tone.Transport.start()
  },
  pause: () => {
    console.log('pause')
    Tone.Transport.pause()
  }
}

document.querySelectorAll('[data-control]').forEach(controlElement => {
  const action = controlElement.dataset.control
  controlElement.addEventListener('click', controls[action])
})
