import { GLOBAL_FPS } from '../../consts/fps'

const REM_SIZE = parseFloat(getComputedStyle(document.documentElement).fontSize)

export const CONTROLLER_SET_SCALE_DEBOUNCE_MS = 1000 / GLOBAL_FPS
export const CONTROLLER_MIN_SCALE_RANGE = 1

export const TOOLTIP_WIDTH = 300
export const TOOLTIP_HEIGHT = 116

export const SCATTER_POINT_RADIUS = 3
export const SCATTER_SCALE_OFFSET = 0.2
export const SCATTER_OFFSET_HEIGHT = 3.5 * REM_SIZE
export const SCATTER_LEGEND_HEIGHT = 2.5 * REM_SIZE

export const SCATTER_LABEL_FONT_SIZE = 12
export const SCATTER_LABEL_OFFSET_Y = -22
export const SCATTER_LABEL_SAFEZONE_Y = 20
export const SCATTER_LABEL_SAFEZONE_X = 15

export const SCATTER_INTERACTION_THROTTLE_MS = 1000 / GLOBAL_FPS
export const SCATTER_INTERACTION_MOBILE_EXPAND = 5
