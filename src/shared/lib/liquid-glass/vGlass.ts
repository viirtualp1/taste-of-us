import type { Directive } from 'vue'

/**
 * Liquid Glass (iOS 26) for the web.
 *
 * Real refraction needs an SVG displacement filter inside `backdrop-filter`,
 * which only Chromium renders (Telegram Desktop / Android). Elsewhere — WebKit,
 * Firefox, reduced transparency — the directive does nothing and the `.glass`
 * CSS fallback (frost + specular rim) stays in place.
 */
export interface GlassOptions {
  /** Width of the refracting rim, px. */
  bezel?: number
  /** Max displacement at the very edge, px. */
  refraction?: number
  /** Whole-surface magnification toward the centre (0–1), for lens "droplets". */
  magnify?: number
  /** Frost under the refraction, px. Liquid Glass is mostly clear. */
  blur?: number
  saturate?: number
  /** Chromatic dispersion at the rim (0 = off). */
  dispersion?: number
}

const DEFAULTS: Required<GlassOptions> = {
  bezel: 16,
  refraction: 22,
  magnify: 0,
  blur: 1.5,
  saturate: 1.8,
  dispersion: 0.12,
}

let supported: boolean | null = null

export function isLiquidGlassSupported(): boolean {
  if (supported !== null) return supported
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  const chromium = /Chrome\/\d+/.test(ua) && !/iPhone|iPad|iPod/.test(ua)
  const reduced = window.matchMedia?.('(prefers-reduced-transparency: reduce)').matches
  supported = chromium && !reduced && CSS.supports('backdrop-filter', 'blur(1px)')
  return supported
}

const SVG_NS = 'http://www.w3.org/2000/svg'
let defs: SVGDefsElement | null = null

function getDefs(): SVGDefsElement {
  if (defs?.isConnected) return defs
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('aria-hidden', 'true')
  svg.style.cssText =
    'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
  defs = document.createElementNS(SVG_NS, 'defs')
  svg.appendChild(defs)
  document.body.appendChild(svg)
  return defs
}

const mapCache = new Map<string, string>()

/**
 * Displacement map for a rounded rectangle: R/G hold the x/y offset (128 = none).
 * Inside the rim, pixels sample inward along the edge normal with a smoothstep
 * falloff — the bright, bent edge of a convex glass slab.
 */
function displacementMap(
  w: number,
  h: number,
  r: number,
  bezel: number,
  magnify: number,
): string {
  const key = `${w}x${h}r${r}b${bezel}m${magnify}`
  const cached = mapCache.get(key)
  if (cached) return cached

  const k = Math.min(1, 220 / Math.max(w, h))
  const cw = Math.max(2, Math.round(w * k))
  const ch = Math.max(2, Math.round(h * k))
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(cw, ch)
  const hx = w / 2
  const hy = h / 2

  for (let j = 0; j < ch; j++) {
    for (let i = 0; i < cw; i++) {
      const px = (i + 0.5) / k - hx
      const py = (j + 0.5) / k - hy
      const qx = Math.abs(px) - (hx - r)
      const qy = Math.abs(py) - (hy - r)
      const dist =
        r -
        Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) -
        Math.min(Math.max(qx, qy), 0)

      let nx = 0
      let ny = 0
      if (qx > 0 && qy > 0) {
        const l = Math.hypot(qx, qy) || 1
        nx = (qx / l) * Math.sign(px)
        ny = (qy / l) * Math.sign(py)
      } else if (qx > qy) {
        nx = Math.sign(px)
      } else {
        ny = Math.sign(py)
      }

      let dx = 0
      let dy = 0
      if (dist < bezel) {
        const t = 1 - Math.max(dist, 0) / bezel
        const m = t * t * (3 - 2 * t)
        dx -= nx * m
        dy -= ny * m
      }
      if (magnify) {
        dx -= (px / hx) * magnify
        dy -= (py / hy) * magnify
      }

      const o = (j * cw + i) * 4
      img.data[o] = 128 + 127 * Math.max(-1, Math.min(1, dx))
      img.data[o + 1] = 128 + 127 * Math.max(-1, Math.min(1, dy))
      img.data[o + 2] = 128
      img.data[o + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  const url = canvas.toDataURL()
  if (mapCache.size > 64) mapCache.clear()
  mapCache.set(key, url)
  return url
}

function filterMarkup(map: string, w: number, h: number, o: Required<GlassOptions>) {
  const s = o.refraction * 2
  const image = `<feImage href="${map}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>`
  const displace = (scale: number, result: string) =>
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="${result}"/>`
  if (!o.dispersion) return image + displace(s, 'out')

  // Each colour channel bends a little differently → faint rainbow fringe at the rim.
  const CHANNEL = [
    '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
    '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
    '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
  ] as const
  const only = (c: 0 | 1 | 2, input: string, result: string) =>
    `<feColorMatrix in="${input}" type="matrix" values="${CHANNEL[c]}" result="${result}"/>`
  const d = o.dispersion
  return (
    image +
    displace(s, 'dr') +
    only(0, 'dr', 'r') +
    displace(s * (1 - d), 'dg') +
    only(1, 'dg', 'g') +
    displace(s * (1 - 2 * d), 'db') +
    only(2, 'db', 'b') +
    '<feBlend in="r" in2="g" mode="screen" result="rg"/>' +
    '<feBlend in="rg" in2="b" mode="screen"/>'
  )
}

interface GlassState {
  id: string
  filter: SVGFilterElement
  observer: ResizeObserver
  options: Required<GlassOptions>
  frame: number
  size: string
}

const states = new WeakMap<HTMLElement, GlassState>()
let counter = 0

function render(el: HTMLElement, state: GlassState) {
  const w = Math.round(el.offsetWidth)
  const h = Math.round(el.offsetHeight)
  if (!w || !h) return
  const radius = Math.min(
    parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
    w / 2,
    h / 2,
  )
  const o = state.options
  const size = `${w}x${h}x${radius}`
  if (size !== state.size) {
    state.size = size
    const bezel = Math.min(o.bezel, w / 2, h / 2)
    const map = displacementMap(w, h, radius, bezel, o.magnify)
    if (!map) return
    const f = state.filter
    f.setAttribute('x', '0')
    f.setAttribute('y', '0')
    f.setAttribute('width', String(w))
    f.setAttribute('height', String(h))
    f.innerHTML = filterMarkup(map, w, h, o)
  }
  const value = `blur(${o.blur}px) url(#${state.id}) saturate(${o.saturate})`
  el.style.backdropFilter = value
  el.style.setProperty('-webkit-backdrop-filter', value)
  el.dataset.liquid = ''
}

function schedule(el: HTMLElement) {
  const state = states.get(el)
  if (!state) return
  cancelAnimationFrame(state.frame)
  state.frame = requestAnimationFrame(() => render(el, state))
}

function mount(el: HTMLElement, value: GlassOptions | undefined) {
  if (!isLiquidGlassSupported()) return
  const id = `liquid-glass-${++counter}`
  const filter = document.createElementNS(SVG_NS, 'filter')
  filter.setAttribute('id', id)
  filter.setAttribute('filterUnits', 'userSpaceOnUse')
  filter.setAttribute('primitiveUnits', 'userSpaceOnUse')
  filter.setAttribute('color-interpolation-filters', 'sRGB')
  getDefs().appendChild(filter)

  const state: GlassState = {
    id,
    filter,
    options: { ...DEFAULTS, ...value },
    observer: new ResizeObserver(() => schedule(el)),
    frame: 0,
    size: '',
  }
  states.set(el, state)
  state.observer.observe(el)
  schedule(el)
}

export const vGlass: Directive<HTMLElement, GlassOptions | undefined> = {
  mounted(el, binding) {
    mount(el, binding.value)
  },
  updated(el, binding) {
    const state = states.get(el)
    if (!state) return
    const next = { ...DEFAULTS, ...binding.value }
    if (JSON.stringify(next) !== JSON.stringify(state.options)) {
      state.options = next
      state.size = ''
      schedule(el)
    }
  },
  beforeUnmount(el) {
    const state = states.get(el)
    if (!state) return
    cancelAnimationFrame(state.frame)
    state.observer.disconnect()
    state.filter.remove()
    states.delete(el)
  },
}
