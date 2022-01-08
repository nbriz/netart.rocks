/*
    createWaveCanvas()
    -----------
    by Nick Briz <nbriz@brangerbriz.com> for brangerbriz.com
    GNU GPLv3 - https://www.gnu.org/licenses/gpl-3.0.txt
    2018

    -----------
       info
    -----------

    this is a simple helper function for creating a canvas that draws a waveform
    from a WebAudio AnalyserNode. think of it like a quick Oscilloscope

    -----------
       usage
    -----------

    createWaveCanvas({
        element:'#container', // required, container element selector
        analyser: fftNode,    // required, AnalyserNode
        speed: 1000/60,       // optional, interval speed
        fill: '#000',         // optional, background color
        stroke: '#fff'        // optional, wave line color
    })

*/

function createWaveCanvas(o){
    if(typeof o == "undefined"){
        throw new Error('createWaveCanvas: requires an options object. '+
        '[view source code for more info]')
    } else if(typeof o.element !== "string"){
        throw new Error('createWaveCanvas: requires an options object with an '+
        '"element" property with a querySelector string value. '+
        '[view source code for more info]')
    } else if( !(o.analyser instanceof AnalyserNode) ){
        throw new Error('createWaveCanvas: requires an options object with an '+
        '"analyser" property with an AnalyserNode as it\'s value. '+
        '[view source code for more info]')
    }

    let fft = o.analyser
    let ele = o.element
    let fps = o.speed || 1000/12
    let bg = o.fill || "#23241f"
    let clr = o.stroke || "#f92672"

    // create canvas...
    const canvas = document.createElement('canvas')
    canvas.width = document.querySelector(ele).offsetWidth
    document.querySelector(ele).appendChild(canvas)

    const canvasCtx = canvas.getContext("2d")
    canvasCtx.fillStyle = bg
    canvasCtx.strokeStyle = clr

    let bufferLength = fft.frequencyBinCount
    let dataArray = new Uint8Array(bufferLength)

    function animate(){
        canvasCtx.fillRect(0,0,canvas.width,canvas.height)
        // get data...
        fft.getByteTimeDomainData(dataArray)
        // draw data...
        canvasCtx.beginPath()
        let column = canvas.width/bufferLength
        let x = 0
        for (let i = 0; i < bufferLength; i++) {
          let y = (dataArray[i]/128) * (canvas.height/2)
          if (i===0) canvasCtx.moveTo(x, y)
          else canvasCtx.lineTo(x, y)
          x += column
        }
        canvasCtx.lineTo(canvas.width, canvas.height/2)
        canvasCtx.stroke()
    }

    let interval = setInterval( animate, fps )

    return { canvas, interval }
}
