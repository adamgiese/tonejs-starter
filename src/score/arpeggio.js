
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

  const openingLoop = new Loop(time => {
    arpeggiateNotes('16n', time)('C3|E3|G3|B3|D4|E4|G4|F#4|D4|B3|G3|D3'.split('|')).forEach(x => {
      synth.triggerAttackRelease(...x)
    })
  }, '1n').start(0)

  openingLoop.iterations = 3
}

export default arpeggios
