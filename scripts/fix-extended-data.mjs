import fs from 'fs'
import path from 'path'

const filePath = 'src/data/servicesExtendedData.ts'
const fileContent = fs.readFileSync(filePath, 'utf8')

const lines = fileContent.split('\n')
const fixedLines = []

let inObject = false
let currentBlockKeys = new Set()

for (let i = 0; i < lines.length; i++) {
  let line = lines[i]
  const trimmed = line.trim()

  // Detect block start: e.g. "  'usllc149onetime': {" or "  'some-id': {"
  if (!inObject && (trimmed.endsWith('{') || trimmed.endsWith(':{')) && i > 30) {
    inObject = true
    currentBlockKeys = new Set()
    fixedLines.push(line)
    continue
  }

  // Detect block end: e.g. "  }," or "  }"
  if (inObject && (trimmed === '},' || trimmed === '}')) {
    inObject = false
    fixedLines.push(line)
    continue
  }

  if (inObject) {
    // Check if line contains a key definition: e.g. "key: value"
    // Regex matches "key: value" or "key?: value"
    const match = trimmed.match(/^([a-zA-Z0-9_]+)\s*\??\s*:/)
    if (match) {
      const key = match[1]

      // Handle invalid businessStage values
      if (key === 'businessStage') {
        if (trimmed.includes("'Banking'") || trimmed.includes('"Banking"')) {
          line = line.replace("'Banking'", "'Operations'").replace('"Banking"', "'Operations'")
        } else if (trimmed.includes("'Branding'") || trimmed.includes('"Branding"')) {
          line = line.replace("'Branding'", "'Operations'").replace('"Branding"', "'Operations'")
        } else if (trimmed.includes("'Websites'") || trimmed.includes('"Websites"')) {
          line = line.replace("'Websites'", "'Operations'").replace('"Websites"', "'Operations'")
        }
      }

      if (currentBlockKeys.has(key)) {
        // Duplicate key! Skip this line
        console.log(`Removing duplicate key "${key}" at line ${i + 1}: ${trimmed}`)
        continue
      }

      currentBlockKeys.add(key)
    }
  }

  fixedLines.push(line)
}

fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf8')
console.log('Successfully fixed servicesExtendedData.ts!')
