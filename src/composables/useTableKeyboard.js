import { nextTick } from 'vue'

export function useTableKeyboard({ selectedItem, onSelect, onDelete, tableSelector }) {
  const getRows = () => [
    ...document.querySelectorAll(`${tableSelector} tbody tr[tabindex]`)
  ]

  const onRowKeydown = (event, item) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        const rows = getRows()
        const index = rows.findIndex(r => r === event.currentTarget)
        rows[index + 1]?.focus()
        break
      }
      case 'ArrowUp': {
        event.preventDefault()
        const rows = getRows()
        const index = rows.findIndex(r => r === event.currentTarget)
        if (index > 0) {
          rows[index - 1]?.focus()
        }
        break
      }
      case 'Enter': {
        if (event.currentTarget === event.target) {
          event.preventDefault()
          onSelect(item)
        }
        break
      }
      case 'Escape': {
        if (event.currentTarget === event.target) {
          selectedItem.value = null
        }
        break
      }
      case 'Delete': {
        if (event.currentTarget === event.target) {
          event.preventDefault()
          selectedItem.value = { ...item }
          nextTick(() => onDelete())
        }
        break
      }
    }
  }

  const focusFirstRow = () => {
    nextTick(() => {
      getRows()[0]?.focus()
    })
  }

  return { onRowKeydown, focusFirstRow }
}
