import * as Tone from 'tone'
import score from './score.js'

/* General Settings */
Tone.Transport.timeSignature = 4

/* Effects */
const destination = Tone.context.createMediaStreamDestination()
const connectToDestinations = x => {
  x.toDestination()      // speakers
  x.connect(destination) // recording
}

const Reverb = new Tone.Reverb(3)
connectToDestinations(Reverb)

const PingPong = new Tone.PingPongDelay('8n', .3)
connectToDestinations(PingPong)

const SoftGain = new Tone.Gain(.1)
connectToDestinations(SoftGain)

const ChordVibrator = new Tone.Vibrato(1, .2)
connectToDestinations(ChordVibrator)

/* Setup the Synths */
const chordSynth = new Tone.PolySynth(Tone.Synth)
  .connect(ChordVibrator)
  .connect(Reverb)

chordSynth.set({
  oscillator: {
    type: 'sine',
  },
  maxPolyphony: 8,
  volume: -8,
})

connectToDestinations(chordSynth)


const arpeggioSynth = new Tone.Synth().connect(Reverb)
arpeggioSynth.oscillator.type = 'sine'
connectToDestinations(arpeggioSynth)

const pingSynth = new Tone.Synth().connect(PingPong)
pingSynth.oscillator.type = 'sine'
pingSynth.volume.value = -8
connectToDestinations(pingSynth)

/* Connect the MUSIC */

// sets up all the music & returns running time
const time = score({arpeggioSynth, pingSynth, chordSynth}, Tone)

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

/* Setup the "Recorder" */
const audio = document.querySelector('audio')
const recorder = new MediaRecorder(destination.stream)

Tone.Transport.schedule(time => {
  recorder.start()
}, 0)

Tone.Transport.schedule(time => {
  recorder.stop()
}, time + 4) // pad time a bit for reverb

const mediaData = []
recorder.ondataavailable = e => mediaData.push(e.data)
recorder.onstop = e => {
  let blob = new Blob(mediaData, { type: 'audio/wav; codecs=opus' });
  audio.src = URL.createObjectURL(blob)
}

document.querySelectorAll('[data-control]').forEach(controlElement => {
  const action = controlElement.dataset.control
  controlElement.addEventListener('click', controls[action])
})
