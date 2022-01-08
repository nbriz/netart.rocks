class MouseTrails {
  constructor (color) {
    this.color = color || '#000'
    this.mute = false // whether or not to create trails
    this.max = 50 // max amount of char elements created
    this.delay = 10 // time between creation of char elements
    this.speed = 200 // speed of trail animation
    this.bits = []
    this.chars = '⋆✦✧✩✫✬✭✮✯✰★♪♩♫¨*•.¸,ø¤º°✲ღ'
  }

  _initSpark (e) {
    let x = e.clientX
    let y = e.clientY
    const d = document.createElement('div')
    const r = Math.floor(Math.random() * this.chars.length)
    const s = 12
    d.textContent = this.chars[r]
    d.style.position = 'fixed'
    x += Math.random() * 24 - 12
    y += Math.random() * 24 - 12
    d.style.color = this.color === 'rainbow'
      ? `hsl(${Date.now() * 0.25 % 360}deg, 100%, 50%)` : this.color
    d.style.top = `${y}px`
    d.style.left = `${x}px`
    d.style.fontSize = `${s}px`
    d.style.transform = 'rotate(0deg)'
    // d.style.transition = `all ${this.speed/2}ms`
    this.bits.push(d)
    document.body.appendChild(d)
    this._animSpark(d, 18, 0, x, y, 1)
  }

  _animSpark (d, s, r, x, y, i) {
    const size = s - 1
    const rot = r + 10
    i++
    const pos = { x: Math.sin(i) * 50, y: Math.cos(i) * 60 }

    if (size > 5) {
      d.style.left = `${x + pos.x}px`
      d.style.top = `${y + pos.y}px`
      d.style.fontSize = `${size}px`
      d.style.transform = `rotate(${rot}deg)`
      setTimeout(() => this._animSpark(d, size, rot, x, y, i), this.speed)
    } else {
      const idx = this.bits.indexOf(d)
      const el = this.bits.splice(idx, 1)
      document.body.removeChild(el[0])
    }
  }

  mouseMoved (x, y) {
    if (!this.mute && this.bits.length < this.max) {
      const event = { clientX: x, clientY: y }
      this._initSpark(event)
      this.mute = true
      setTimeout(() => { this.mute = false }, this.delay)
    }
  }
}

if (typeof module !== 'undefined') module.exports = MouseTrails
