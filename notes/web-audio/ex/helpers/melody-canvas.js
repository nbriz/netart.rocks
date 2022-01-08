/*
    createMelodyCanvas()
    -----------
    by Nick Briz <nbriz@brangerbriz.com> for brangerbriz.com
    GNU GPLv3 - https://www.gnu.org/licenses/gpl-3.0.txt
    2018

    -----------
       info
    -----------

    this is a simple helper function for creating a canvas that draws a
    diagram of a particular musical scale. it's meant to be used along with
    my Note.js helper class, an instance of which is a required parameter

    -----------
       usage
    -----------

    let canvas = createMelodyCanvas({
        element:'#container',        // required, container element selector
        melody: [0,2,4,5,7,9,11,12], // required, array of degrees (ex:major)
        note: noteInstance,          // required, instance of my Note.js class
        background: '#000',          // optional, background color
        color: '#fff'                // optional, note highlight color
    })

    canvas.canvas // gives you access to the canvas directly
    canvas.update() // redraws the canvas

    // the update method can take an options object w/similar parameters to
    // the factory funciton above, except with additoinal degree param

    canvas.update({
        melody: [0,2,3,5,7,8,10,12], // switch to minor melody
        note: newNote, // switch the note to a new Note instance
        degree: 3, // highlight the 3rd degree note in the scale
    })

*/

function createMelodyCanvas(o){
    if(typeof o == "undefined"){
        throw new Error('createMelodyCanvas: requires an options object. '+
        '[view source code for more info]')
    } else if(typeof o.element !== "string"){
        throw new Error('createMelodyCanvas: requires an options object with an '+
        '"element" property with a querySelector string value. '+
        '[view source code for more info]')
    } else if( !(o.melody instanceof Array) ){
        throw new Error('createMelodyCanvas: requires an options object with a '+
        '"melody" property with an Array of steps as it\'s value. '+
        '[view source code for more info]')
    } else if( !(o.note instanceof Note) ){
        throw new Error('createMelodyCanvas: the "note" property should be an '+
        'instance of my Note.js class [view source code for more info]')
    }

    let ele = o.element
    let melody = o.melody
    let note = o.note
    let bg = o.background || "#23241f"
    let clr = o.color || "#f92672"
    let range = Math.max(...melody)
    let notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
    let pos = [] // degree positions && notes {x,y,n}

    // create canvas...
    const canvas = document.createElement('canvas')
    canvas.width = document.querySelector(ele).offsetWidth
    canvas.height = canvas.height * 2
    document.querySelector(ele).appendChild(canvas)

    const canvasCtx = canvas.getContext("2d")
    canvasCtx.fillStyle = bg
    canvasCtx.strokeStyle = clr

    function circle(x,y,r,clr){
        let prevClr = canvasCtx.fillStyle
        canvasCtx.fillStyle = clr || prevClr
        canvasCtx.beginPath()
        canvasCtx.arc(x, y, r, 0, Math.PI * 2)
        canvasCtx.fill()
        canvasCtx.closePath()
        canvasCtx.fillStyle = prevClr
    }

    function line(x1,y1,x2,y2,clr){
        let prevClr = canvasCtx.strokeStyle
        canvasCtx.strokeStyle = clr || prevClr
        canvasCtx.beginPath()
        canvasCtx.moveTo(x1,y1)
        canvasCtx.lineTo(x2,y2)
        canvasCtx.stroke()
        canvasCtx.closePath()
        canvasCtx.strokeStyle = prevClr
    }

    function reOrderNotes(root,notes){
        let last = notes.indexOf(root)
        let a2 = notes.slice(0,last)
        let a1 = notes.slice(last)
        return [...a1,...a2]
    }

    function draw(){
        let c = { w:canvas.width, h:canvas.height }
        let p = 30 // padding
        let a = { w:c.w-p*2, h:c.h-p*2, x:p, y:p} // area
        let rh = a.h/range // row height
        let ns = reOrderNotes(note.note,notes)
        pos = []

        canvasCtx.fillStyle = bg
        canvasCtx.fillRect(0,0,canvas.width,canvas.height)
        canvasCtx.textBaseline = 'top'
        canvasCtx.fillStyle = '#fff'
        // calc y positions
        let yArr = []
        for(let i = range; i >= 0; i--){
            let y = p + rh*i
            yArr.push(y)
        }
        // draw notes
        canvasCtx.textAlign = 'right'
        let x = a.x+p
        let incOctave = 0
        for(let i = 0; i <= range; i++){
            let n = ns[i%(ns.length)]
            if(n=="C" && i!==0) incOctave++
            let oc = note.octave + incOctave
            canvasCtx.fillText(n+oc, x, yArr[i])
        }
        // draw frequencies
        let mxFreqW = 0
        incOctave = 0
        canvasCtx.textAlign = 'left'
        canvasCtx.fillStyle = '#aaa'
        for(let i = 0; i <= range; i++){
            let n = ns[i%(ns.length-1)]
            if(n=="C") incOctave++
            let oc = note.octave + incOctave
            let fq = note.note2freq[n+oc]
            canvasCtx.fillText(` | ${fq}`, x, yArr[i])
            let w = canvasCtx.measureText(` | ${fq}`).width
            if(w > mxFreqW) mxFreqW  = w
        }
        // calc x/y positions
        let col = Math.floor((a.w-mxFreqW-p*2) / (melody.length)) // column width
        let rad = 12
        for(let i = 0; i < melody.length; i++){
            let deg = melody[i]
            let mx = pos[i-1] ? pos[i-1].x + col : a.x+p*2+mxFreqW+rad
            let my = yArr[deg] + rad/2
            let n = ns[deg%ns.length]
            pos.push({x:mx,y:my,n:n})
        }
        // draw circles
        canvasCtx.fillStyle = bg
        let sx = a.x+p*2+mxFreqW+rad
        for(let i = 0; i < pos.length; i++) {
            let cx = pos[i].x
            let cy = pos[i].y
            if(typeof pos[i+1] !== "undefined"){
                let cxx = pos[i+1].x
                let cyy = pos[i+1].y
                line(cx,cy,cxx,cyy,'#fff')
            }
            line(sx,cy,col*(melody.length+1),cy,'#555')
            circle(cx, cy, rad, '#fff')
            canvasCtx.textAlign = 'center'
            canvasCtx.textBaseline = 'middle'
            canvasCtx.fillText(pos[i].n, cx, cy)
        }

    }

    function update(opts){
        opts = opts || {}
        melody = opts.melody || melody
        note = opts.note || note
        bg = opts.background || bg
        clr = opts.color || clr
        range = opts.range || Math.max(...melody)
        draw()
        if(typeof opts.degree!=='undefined'){
            let x = pos[opts.degree].x
            let y = pos[opts.degree].y
            circle(x,y,14,clr)
            canvasCtx.fillStyle = '#fff'
            canvasCtx.textAlign = 'center'
            canvasCtx.textBaseline = 'middle'
            canvasCtx.fillText( pos[opts.degree].n, x, y )
        }
    }

    update()

    return { canvas, update }
}
