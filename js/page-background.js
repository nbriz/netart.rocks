class PageBackground extends window.HTMLElement {
  connectedCallback () {
    this.innerHTML = `
      <style>
        .page-background--main {
          width: 100vw;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: -100;
          /* background: var(--white); */
          background: var(--blue);
          display: flex;
          align-items: center;
          justify-content: center;
          /* opacity: 0.6; */
        }
        .page-background--bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 120%;
          height: 120%;
          /* filter: blur(250px); */
          background-image: conic-gradient(from 0deg,
            var(--red) 0%,
            var(--green) 50%,
            var(--blue) 100%);
          background-size: 200% 100%;
          animation: bg-shift 40s infinite;
        }

        @keyframes bg-shift {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 0% }
          100% { background-position: 0% 50% }
        }

        .page-background--fr {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          border: 0vw solid var(--white);
          outline: 0 solid var(--white);
          outline-offset: -6vw;
          transition: border 1s, outline 0.25s;
        }
      </style>

      <div class="page-background--main">
        <div class="page-background--bg"></div>
        <div class="page-background--fr"></div>
      </div>
    `

    this.deg = 0
    this.delta = 1
    setInterval(() => {
      const bg = this.querySelector('.page-background--bg')
      bg.style.backgroundImage = `conic-gradient(from ${this.deg}deg, var(--red) 0%, var(--green) 50%, var(--blue) 100%)`
      this.deg += this.delta
    }, 1000 / 12)

    setTimeout(() => {
      const fr = this.querySelector('.page-background--fr')
      fr.style.outline = '0.5vw solid var(--white)'
    }, 1500)

    setTimeout(() => {
      const fr = this.querySelector('.page-background--fr')
      fr.style.border = '4vw solid var(--white)'
    }, 2500)
  }
}
window.customElements.define('page-background', PageBackground)
