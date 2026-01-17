import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

export default defineEventHandler(() => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const menuPath = join(__dirname, '../../app/data/menu.json')
  const menuData = JSON.parse(readFileSync(menuPath, 'utf-8'))
  return menuData
})
