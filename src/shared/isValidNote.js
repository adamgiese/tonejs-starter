const isValidNote = x => /[A-G]b{0,2}#{0,2}/i.test(x)

export default isValidNote
