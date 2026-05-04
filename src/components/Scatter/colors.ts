import { type ScatterData, SUBJECTS } from '../../hooks/useData'

const ORIGINAL_COLORS: `#${string}`[] = [
  '#fca5a5', // red-300
  '#fcd34d', // amber-300
  '#bef264', // lime-300
  '#6ee7b7', // emerald-300
  '#67e8f9', // cyan-300
  '#93c5fd', // blue-300
  '#c4b5fd', // violet-300
  '#f0abfc', // fuchsia-300
  '#fda4af', // rose-300
  '#fdba74', // orange-300
  '#fde047', // yellow-300
  '#86efac', // green-300
  '#5eead4', // teal-300
  '#7dd3fc', // sky-300
  '#a5b4fc', // indigo-300
  '#d8b4fe', // purple-300
  '#f9a8d4', // pink-300
]

const NUM_DARKEN_COLORS = 50

const EXTENDED_COLORS: `#${string}`[] = [
  ...ORIGINAL_COLORS,
  ...ORIGINAL_COLORS.map((color) => {
    // 生成更深的颜色
    const r = Math.max(0, parseInt(color.slice(1, 3), 16) - NUM_DARKEN_COLORS)
      .toString(16)
      .padStart(2, '0')
    const g = Math.max(0, parseInt(color.slice(3, 5), 16) - NUM_DARKEN_COLORS)
      .toString(16)
      .padStart(2, '0')
    const b = Math.max(0, parseInt(color.slice(5, 7), 16) - NUM_DARKEN_COLORS)
      .toString(16)
      .padStart(2, '0')
    return `#${r}${g}${b}` as `#${string}`
  }),
]

export function generateColorMapping(data: ScatterData): {
  [key: string]: `#${string}`
} {
  const result: { [key: string]: `#${string}` } = {}
  let subjectIndex = 0
  for (const subject of SUBJECTS) {
    result[subject] = EXTENDED_COLORS[subjectIndex % EXTENDED_COLORS.length]
    subjectIndex++
    const subjectData = data.subjects[SUBJECTS.indexOf(subject)]
    const categories = new Set(subjectData.map((item) => item['专业类']))
    let categoryIndex = 0
    for (const category of categories) {
      result[category] = EXTENDED_COLORS[categoryIndex % EXTENDED_COLORS.length]
      categoryIndex++
    }
  }
  return result
}
