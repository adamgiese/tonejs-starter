import * as Tone from 'tone'

/* Setup the Synth */
const arpeggioSynth = new Tone.Synth({
  "oscillator": {
    "phase": 0,
    "type": "sine"
  }
})


/* Write the Music */

new Tone.Loop((time) => {
  arpeggioSynth.triggerAttackRelease("D4", "16n");
}, "4n").start(0);


/* Add the Effects & "Wiring" */
synth.toDestination()

/* Connect the Controls */

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
