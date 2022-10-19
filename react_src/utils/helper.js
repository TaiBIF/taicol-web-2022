export const formatNumber = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
};

export const shortDescription = (description,max) => {
  return description.replace(/(<([^>]+)>)/gi, "").substring(0, max) + (description.length > 100 ? '...' : '')
}

export const capitalize = (s) => {
   return s ? s[0].toUpperCase() + s.slice(1) : ''
}

export const getTotal = (data) => {
  return data.reduce((a, b) => {
    const count = b[1] 
    const total = a + count
    return total
  }, 0)
}
