/* global Netitor */
class NNBG {
  constructor (vars) {
    this.ele = document.createElement('div')
    this.ele.id = '__netitor-instance-editor-element'
    this.ele.style.display = 'none'
    document.body.appendChild(this.ele)

    // this.rndr = document.createElement('div')
    // this.rndr.id = '__netitor-instance-render-element'
    // this.rndr.style.position = 'fixed'
    // this.rndr.style.zIndex = -1000
    // this.rndr.style.top = 0
    // this.rndr.style.left = 0
    // this.rndr.style.width = window.innerWidth + 'px'
    // this.rndr.style.height = window.innerHeight + 'px'
    // document.body.appendChild(this.rndr)

    this.ne = new Netitor({
      ele: '#__netitor-instance-editor-element'
      // render: '#__netitor-instance-render-element'
    })

    if (vars) {
      this.de = document.documentElement
      this.vars = {}
      vars.forEach(v => {
        this.vars[v] = window.getComputedStyle(this.de).getPropertyValue('--' + v)
      })
    }
  }

  _createIframe () {
    if (this.iframe) this.iframe.parentElement.removeChild(this.iframe)
    this.iframe = document.createElement('iframe')
    this.iframe.style.width = '100%'
    this.iframe.style.height = '100%'
    this.iframe.style.border = '0'
    this.iframe.style.position = 'fixed'
    this.iframe.style.zIndex = -1000
    this.iframe.style.top = 0
    this.iframe.style.left = 0
    document.body.appendChild(this.iframe)
  }

  load (code, plaintxt) {
    // if (plaintxt) this.ne.code = code
    // else this.ne.code = this.ne._decode(code)
    this._createIframe()
    const c = plaintxt ? code : this.ne._decode(code)
    const content = this.iframe.contentDocument || this.iframe.contentWindow.document
    content.open()
    content.write(c)
    content.close()
  }

  clear () {
    // this.ne.code = ''
    if (this.iframe) {
      this.iframe.parentElement.removeChild(this.iframe)
      this.iframe = null
    }
  }

  addHoverElement (ele, code, c) {
    document
      .querySelector(ele)
      .addEventListener('mouseover', () => {
        this.load(code)
        if (this.de && c) {
          for (const v in c) { this.de.style.setProperty('--' + v, c[v]) }
        }
      })
    document
      .querySelector(ele)
      .addEventListener('mouseout', () => {
        this.clear()
        if (this.de && c) {
          for (const v in c) { this.de.style.setProperty('--' + v, this.vars[v]) }
        }
      })
  }
}

window.NNBG = NNBG
