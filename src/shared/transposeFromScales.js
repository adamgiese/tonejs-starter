import teoria from 'teoria'
import isValidNote from './isValidNote'

const transposeFromScales = (oldScale, newScale) => direction => (_note) => {
  if (!isValidNote(_note)) { return _note } // return if not a valid note
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

export default transposeFromScales
