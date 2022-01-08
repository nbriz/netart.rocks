/*
    createFrequencyCanvas()
    -----------
    by Nick Briz <nbriz@brangerbriz.com> for brangerbriz.com
    GNU GPLv3 - https://www.gnu.org/licenses/gpl-3.0.txt
    2018

    -----------
       info
    -----------

    this is a simple helper function for creating a canvas that draws a
    frequency bar graph from a WebAudio AnalyserNode.

    -----------
       usage
    -----------

    createFrequencyCanvas({
        element:'#container', // required, container element selector
        analyser: fftNode,    // required, AnalyserNode
        speed: 1000/60,       // optional, interval speed
        scale: 1000/60,       // optional, scaled up bar size
        background: '#000',   // optional, background color
        color: '#fff'         // optional, bar line color...
                              // ...if this is the string 'red','green','blue',
                              // 'yellow', 'cyan', or 'magenta' then the colors
                              // will fade out as that frequency fades
    })

*/

function createFrequencyCanvas(o){
    if(typeof o == "undefined"){
        throw new Error('createFrequencyCanvas: requires an options object. '+
        '[view source code for more info]')
    } else if(typeof o.element !== "string"){
        throw new Error('createFrequencyCanvas: requires an options object with an '+
        '"element" property with a querySelector string value. '+
        '[view source code for more info]')
    } else if( !(o.analyser instanceof AnalyserNode) ){
        throw new Error('createFrequencyCanvas: requires an options object with an '+
        '"analyser" property with an AnalyserNode as it\'s value. '+
        '[view source code for more info]')
    }

    let fft = o.analyser
    let ele = o.element
    let scale = o.scale || 1
    let fps = o.speed || 1000/12
    let bg = o.background || "#23241f"
    let clr = o.color || "yellow"

    // create canvas...
    const canvas = document.createElement('canvas')
    canvas.width = document.querySelector(ele).offsetWidth
    document.querySelector(ele).appendChild(canvas)

    const canvasCtx = canvas.getContext("2d")
    canvasCtx.fillStyle = bg
    canvasCtx.strokeStyle = clr

    let bufferLength = fft.frequencyBinCount
    let dataArray = new Uint8Array(bufferLength)

    const fade_clrs = ['red','green','blue','yellow','cyan','magenta']

    function fadeColor(d){
        // color, but the higher the data value the more saturated
        let c
        switch(clr){
            case 'red': c=`rgb(${d},50,50)`; break;
            case 'green': c=`rgb(50,${d},50)`; break;
            case 'blue': c=`rgb(50,50,${d})`; break;
            case 'yellow': c=`rgb(${d},${d},50)`; break;
            case 'cyan': c=`rgb(50,${d},${d})`; break;
            case 'magenta': c=`rgb(${d},50,${d})`; break;
        }
        return c
    }

    function animate(){
        canvasCtx.fillStyle = bg
        canvasCtx.fillRect(0,0,canvas.width,canvas.height)
        // get data...
        fft.getByteFrequencyData(dataArray)
        // draw data...
        let x = 0
        let barH, barW = (canvas.width/bufferLength) * scale

        for(let i = 0; i < bufferLength; i++) {
            //     normalize data     scale to 75% of canvas height
            barH = dataArray[i]/255 * canvas.height*0.75

            if( fade_clrs.indexOf(clr) >= 0 )
                canvasCtx.fillStyle = fadeColor(dataArray[i])
            else canvasCtx.fillStyle = clr

            canvasCtx.fillRect(x, canvas.height-barH, barW,barH )

            x += barW + 1
        }
    }

    let interval = setInterval( animate, fps )

    return { canvas, interval }
}
