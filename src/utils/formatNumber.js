const formatNumber = (number, format) => {
  switch(format) {
  // case 'round2':
  //   return number
  default:
    return number.toString().split('').reverse().reduce((a, b) => (
      a.length > 0 && a.replace('.','').length % 3 === 0 ? `${b}.${a}` : `${b}${a}`
    ), '')
  }
}

export default formatNumber