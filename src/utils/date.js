import dayjs from 'dayjs'

export function formatDisplayDate(isoDate) {
  if (!isoDate) return '—'
  return dayjs(isoDate).format('DD.MM.YYYY')
}

export function convertToISO(displayDate) {
  if (!displayDate) return ''
  const parsed = parseDateFromDisplay(displayDate)
  if (!parsed) return ''
  const { day, month, year } = parsed
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function isValidDate(day, month, year) {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function parseDateFromDisplay(str) {
  if (!str) return null
  const parts = str.split('.')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const year = parseInt(parts[2], 10)
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null
  if (!isValidDate(day, month, year)) return null
  return { day, month, year }
}

export function calculateAge(birthDateStr) {
  if (!birthDateStr) return '—'
  const birth = dayjs(birthDateStr)
  const now = dayjs()
  return now.diff(birth, 'year')
}

export function computeTravelTime(departureDate, departureTime, arrivalDate, arrivalTime) {
  if (!departureDate || !departureTime || !arrivalDate || !arrivalTime) return '—'
  const dep = dayjs(`${departureDate}T${departureTime}`)
  const arr = dayjs(`${arrivalDate}T${arrivalTime}`)
  if (!dep.isValid() || !arr.isValid()) return '—'
  const diffMinutes = arr.diff(dep, 'minute')
  if (diffMinutes < 0) return '—'
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  return `${hours} ч. ${minutes} мин.`
}

export function validateDateRange(displayDate, minDate = '1950-01-01', maxDate = '2026-12-31') {
  if (!displayDate) return true
  const parsed = parseDateFromDisplay(displayDate)
  if (!parsed) return 'Некорректная дата (формат ДД.ММ.ГГГГ)'
  const { day, month, year } = parsed
  const dateObj = new Date(year, month - 1, day)
  const min = dayjs(minDate).toDate()
  const max = dayjs(maxDate).toDate()
  if (dateObj < min || dateObj > max) {
    return `Дата должна быть между ${dayjs(minDate).format('DD.MM.YYYY')} и ${dayjs(maxDate).format('DD.MM.YYYY')}`
  }
  return true
}

export function applyDateMask(event) {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length > 8) value = value.slice(0, 8)
  let formatted = ''
  for (let i = 0; i < value.length; i++) {
    if (i === 2 || i === 4) formatted += '.'
    formatted += value[i]
  }
  return formatted
}
