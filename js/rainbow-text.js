/* global Averigua */
class RainbowText {
  static canDoGrad () {
    return Averigua.browserInfo().name === 'Firefox'
  }

  static shimmer (el, t) {
    if (Averigua && RainbowText.canDoGrad()) {
      el.style.color = 'transparent'
      el.style.background = 'linear-gradient(to left, var(--red), var(--red), var(--blue), var(--blue), var(--green), var(--green), var(--red))'
      el.style.backgroundSize = '200%'
      el.style.backgroundClip = 'text'
      el.style.animation = 'rainbow 5s linear infinite'
    } else {
      t = t || 400
      el.style.transition = `color ${t}ms`
      el.style.color = 'red'
      el.__shimmer = setInterval(() => {
        let idx = !isNaN(Number(el.dataset.idx)) ? Number(el.dataset.idx) : 0
        const arr = ['red', 'green', 'blue']
        idx++; if (idx >= arr.length) idx = 0
        const clr = arr[idx]
        el.dataset.idx = idx
        el.style.color = clr
      }, t)
    }
  }

  static reset (el) {
    if (Averigua && RainbowText.canDoGrad()) {
      el.style.color = null
      el.style.background = null
      el.style.backgroundSize = null
      el.style.backgroundClip = null
      el.style.animation = null
    } else {
      el.style.transition = null
      el.style.color = null
      clearInterval(el.__shimmer)
    }
  }

  static hoverShimmer (el, t) {
    el.addEventListener('mouseover', () => RainbowText.shimmer(el))
    el.addEventListener('mouseout', () => RainbowText.reset(el))
  }
}

window.RainbowText = RainbowText
