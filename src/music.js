import * as Tone from 'tone'
import arpeggio from './score/arpeggio'

/* Effects */

const Reverb = new Tone.Reverb(3)
Reverb.toDestination();

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

/* Setup the "Recorder" */

const audio = document.querySelector('audio')
const destination = Tone.context.createMediaStreamDestination()
const recorder = new MediaRecorder(destination.stream)
arpeggioSynth.connect(destination)
Reverb.connect(destination)
Tone.Transport.schedule(time => {
  recorder.start()
  /* start recording */
}, 0)

Tone.Transport.schedule(time => {
  recorder.stop()
  /* stop recording */
}, 13)

const mediaData = []
recorder.ondataavailable = e => mediaData.push(e.data)
recorder.onstop = e => {
  let blob = new Blob(mediaData, { type: 'audio/ogg; codecs=opus' });
  audio.src = URL.createObjectURL(blob)
}

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
