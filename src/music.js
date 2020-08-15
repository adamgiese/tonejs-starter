import * as Tone from 'tone'
import score from './score.js'

/* General Settings */
Tone.Transport.timeSignature = 3

/* Setup the "Recorder" */
const audio = document.querySelector('audio')
const destination = Tone.context.createMediaStreamDestination()
const recorder = new MediaRecorder(destination.stream)
const connectToDestinations = x => {
  x.toDestination()      // speakers
  x.connect(destination) // recording
}

Tone.Transport.schedule(time => {
  recorder.start()
}, 0)

Tone.Transport.schedule(time => {
  recorder.stop()
}, 13) // TODO make this not manual

const mediaData = []
recorder.ondataavailable = e => mediaData.push(e.data)
recorder.onstop = e => {
  let blob = new Blob(mediaData, { type: 'audio/ogg; codecs=opus' });
  audio.src = URL.createObjectURL(blob)
}

/* Effects */

const Reverb = new Tone.Reverb(3)
connectToDestinations(Reverb)

const PingPong = new Tone.PingPongDelay('8n', .3)
connectToDestinations(PingPong)

const SoftGain = new Tone.Gain(.1)
connectToDestinations(SoftGain)

/* Setup the Synths */
const arpeggioSynth = new Tone.Synth({
  "oscillator": {
    "phase": 0,
    "type": "sine"
  }
}).connect(Reverb)
connectToDestinations(arpeggioSynth)

const pingSynth = new Tone.Synth().connect(PingPong).connect(SoftGain)
pingSynth.oscillator.type = 'sine'
pingSynth.volume.value = -20
connectToDestinations(pingSynth)

/* Connect the MUSIC */
score([arpeggioSynth, pingSynth], Tone)

const controls = {
  play: () => {
    console.log('play')
    Tone.context.resume()
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
