export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export const formatDate = (date, format = 'MMM DD, YYYY') => {
  const d = new Date(date)
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  return d.toLocaleDateString('en-US', options)
}

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num)
}

export const formatPercentage = (num) => {
  return `${num}%`
}

export const formatPhoneNumber = (phone) => {
  const cleaned = ('' + phone).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return phone
}