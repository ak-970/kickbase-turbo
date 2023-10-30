const formatNumber = (number, format) => {
  const prefix = number !== Math.abs(number) ? '-' : ''
  switch(format) {
  // case 'round2':
  //   return number
  default:
    return prefix + Math.abs(number).toString().split('').reverse().reduce((a, b) => (
      a.length > 0 && a.replaceAll('.','').length % 3 === 0 ? `${b}.${a}` : `${b}${a}`
    ), '')
  }
}

export default formatNumber