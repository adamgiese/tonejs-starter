import teoria from 'teoria'
import isValidNote from './isValidNote'

const replaceNote = (from, to) => {
  if (!isValidNote(from)) { return to }

  const oldNote = teoria.note(from)
  const newNote = teoria.note(to)

  return `${newNote.name()}${oldNote.octave()}`
}

export default replaceNote
