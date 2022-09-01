/* global FancyText, RainbowText */
FancyText.animate(document.querySelector('header > h1'), 200, 0.2)

Array.from(document.querySelectorAll('h3'))
  .forEach(h3 => FancyText.animate(h3, 5000, 0.2))

Array.from(document.querySelectorAll('a'))
  .filter(a => a.className !== 'button')
  .forEach(a => RainbowText.hoverShimmer(a))
