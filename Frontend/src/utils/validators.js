export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
  return re.test(phone)
}

export const validateZipCode = (zip) => {
  const re = /^\d{5}(-\d{4})?$/
  return re.test(zip)
}

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
  return re.test(password)
}

export const validateCreditCard = (cardNumber) => {
  const re = /^\d{16}$/
  return re.test(cardNumber.replace(/\s/g, ''))
}