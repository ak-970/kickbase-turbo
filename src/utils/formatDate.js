const formatDate = (date, format) => {
  const dateObject = new Date(date)
  const d = dateObject.getDate().toString()
  const m = (dateObject.getMonth() + 1).toString()
  const y = dateObject.getFullYear().toString()
  const h = dateObject.getHours().toString()
  const min = dateObject.getMinutes().toString()

  switch(format) {
  case 'D.M.YY':
    return `${d}.${m}.${y.slice(-2)}`
  case 'DD.MM.YY':
    return `${`0${d}`.slice(-2)}.${`0${m}`.slice(-2)}.${y.slice(-2)}`
  case 'D.M.YY hh:mm':
    return `${d}.${m}.${y.slice(-2)} ${`00${h}`.slice(-2)}:${`00${min}`.slice(-2)}`
  default:
    return `${`0${d}`.slice(-2)}.${`0${m}`.slice(-2)}.${y}`
  }
}

export default formatDate