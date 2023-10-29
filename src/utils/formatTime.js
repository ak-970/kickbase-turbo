const formatTime = (ms) => {
  const weekFactor = 1000 * 60 * 60 * 24 * 7
  const dayFactor = 1000 * 60 * 60 * 24
  const hourFactor = 1000 * 60 * 60
  const minuteFactor = 1000 * 60
  const secondFactor = 1000

  const weeks = Math.floor(ms / weekFactor)
  const days = Math.floor((ms - weeks * weekFactor) / dayFactor)
  const hours = Math.floor((ms - weeks * weekFactor - days * dayFactor) / hourFactor)
  const minutes = Math.floor((ms - weeks * weekFactor - days * dayFactor - hours * hourFactor) / minuteFactor)
  const seconds = Math.floor((ms - weeks * weekFactor - days * dayFactor - hours * hourFactor - minutes * minuteFactor) / secondFactor)

  const time = [
    { short : 'w', value : weeks },
    { short : 'd', value : days },
    { short : 'h', value : hours },
    { short : 'm', value : minutes },
    { short : 's', value : seconds },
  ]


  return time.map(t => t.value > 0 ? `${t.value}${t.short}` : '').filter(t => t !== '').join(' ')
}

export default formatTime