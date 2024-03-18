
let data

function openWaybackMachine (url, dateString) {
  const date = new Date(dateString)
  const timestamp = date.toISOString().replace(/[^0-9]/g, '').slice(0, 14)
  const waybackUrl = `https://web.archive.org/web/${timestamp}/${url}`
  window.open(waybackUrl, '_blank')
}

function update (txt) {
  const res = document.querySelector('#search-results')
  res.innerHTML = '...loading...'
  if (txt) {
    res.innerHTML = data.filter(s => s.includes(txt))
      .map(s => {
        const arr = s.split('\t')
        let html = '<div class="grid-row">'
        html += arr.map(a => `<div>${a}</div>`).join('')
        html += '</div>'
        return html
      }).join('')

    const rows = document.querySelectorAll('.grid-row')
    rows.forEach(row => {
      row.addEventListener('click', (e) => {
        rows.forEach(r => r.classList.remove('selected'))
        row.classList.add('selected')
      })
    })
  } else {
    res.innerHTML = data.join('<br>')
  }
}

async function setup () {
  data = []
  for (let i = 1; i <= 4; i++) {
    const res = await window.fetch(`aol-data-${i}.txt`)
    const text = await res.text()
    const lines = text.split('\n')
    lines.shift() // Remove the first line if needed for each file
    for (const line of lines) {
      data.push(line)
    }
  }
  document.querySelector('#search-results').innerHTML = 'ready'
}

document.querySelector('#filter').addEventListener('click', () => {
  const selected = document.querySelector('.selected')
  if (!selected) {
    window.alert('click a search result to select it first')
  } else {
    const user = selected.children[0].textContent
    update(`${user}\t`)
  }
})

document.querySelector('#open').addEventListener('click', () => {
  const selected = document.querySelector('.selected')
  if (!selected) {
    window.alert('click a search result to select it first')
  } else {
    const url = selected.children[4].textContent
    const time = selected.children[2].textContent
    if (url === '') {
      window.alert('the user did not click on any links that time')
    } else {
      openWaybackMachine(url, time)
    }
  }
})

window.addEventListener('load', setup)
document.querySelector('#search').addEventListener('click', () => {
  const val = document.querySelector('#input').value
  update(val)
})
