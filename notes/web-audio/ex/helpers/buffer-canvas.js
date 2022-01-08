/*
    createBufferCanvas()
    -----------
    by Nick Briz <nbriz@brangerbriz.com> for brangerbriz.com
    GNU GPLv3 - https://www.gnu.org/licenses/gpl-3.0.txt
    2018

    -----------
       info
    -----------

    this is a helper function for creating a canvas that draws a waveform
    from a WebAudio AudioBuffer, similar to what you might see in a DAW
    when you load an audiofile into a track, the code for his comes from:
    GameAlchemist >> https://stackoverflow.com/a/22103150/1104148

    -----------
       usage
    -----------

    createBufferCanvas({
        element:'#container', // required, container element selector
        buffer: buffer,       // required, AudioBuffer
        scale: 0.75,          // optional, float to scale down waveform size
        bgColor: '#000',      // optional, background color
        innerColor: '#ccc',   // optional, inner waveform color
        outerColor: '#fff'    // optional, outer waveform color
    })

*/
function createBufferCanvas(o) {
    if(typeof o == "undefined"){
        throw new Error('createBufferCanvas: requires an options object. '+
        '[view source code for more info]')
    } else if(typeof o.element !== "string"){
        throw new Error('createBufferCanvas: requires an options object with an '+
        '"element" property with a querySelector string value. '+
        '[view source code for more info]')
    } else if( !(o.buffer instanceof AudioBuffer) ){
        throw new Error('createBufferCanvas: requires an options object with an '+
        '"buffer" property with an AudioBuffer as it\'s value. '+
        '[view source code for more info]')
    }

    let buff = o.buffer
    let ele = o.element
    let scaleDown = o.scale || 1
    let bg_clr  = o.bgColor    || "#23241f"
    let fg_clr1 = o.innerColor || "#f92555"
    let fg_clr2 = o.outerColor || "#9b241f"

    // create canvas...
    const canvas = document.createElement('canvas')
    canvas.width = document.querySelector(ele).offsetWidth
    document.querySelector(ele).appendChild(canvas)
    const canvasCtx = canvas.getContext("2d")


    let leftChannel = buff.getChannelData(0)

    // we 'resample' with cumul, count, variance
    // Offset 0 : PositiveCumul  1: PositiveCount  2: PositiveVariance
    //        3 : NegativeCumul  4: NegativeCount  5: NegativeVariance
    // that makes 6 data per bucket
    let resampled = new Float64Array( canvas.width * 6 )
    let i = 0, j = 0, buckIndex = 0
    let min = 1000, max = -10000
    let thisValue = 0, res = 0
    let sampleCount = leftChannel.length

    // first pass for mean
    for (i=0; i<sampleCount; i++) {
        // in which bucket do we fall ?
        buckIndex = 0 | ( canvas.width * i / sampleCount )
        buckIndex *= 6
        // positive or negative ?
        thisValue = leftChannel[i]
        if (thisValue>0) {
            resampled[buckIndex    ] += thisValue
            resampled[buckIndex + 1] +=1
        } else if (thisValue<0) {
            resampled[buckIndex + 3] += thisValue
            resampled[buckIndex + 4] +=1
        }
        if (thisValue<min) min = thisValue
        if (thisValue>max) max = thisValue
    }

    // compute mean now
    for (i=0, j=0; i<canvas.width; i++, j+=6) {
       if (resampled[j+1] != 0) resampled[j] /= resampled[j+1]
       if (resampled[j+4]!= 0) resampled[j+3] /= resampled[j+4]
    }

    // second pass for mean variation  ( variance is too low)
    for (i=0; i<leftChannel.length; i++) {
        // in which bucket do we fall ?
        buckIndex = 0 | (canvas.width * i / leftChannel.length )
        buckIndex *= 6
        // positive or negative ?
        thisValue = leftChannel[i];
        if (thisValue>0)
            resampled[buckIndex+2] += Math.abs( resampled[buckIndex] - thisValue )
        else if (thisValue<0)
            resampled[buckIndex+5] += Math.abs( resampled[buckIndex + 3] - thisValue )
    }

    // compute mean variation/variance now
    for (i=0, j=0; i<canvas.width; i++, j+=6) {
        if (resampled[j+1]) resampled[j+2] /= resampled[j+1]
        if (resampled[j+4]) resampled[j+5] /= resampled[j+4]
    }

    canvasCtx.save()
    canvasCtx.fillStyle = bg_clr
    canvasCtx.fillRect(0,0,canvas.width,canvas.height )
    canvasCtx.translate(0.5,canvas.height / 2)
    canvasCtx.scale(1, 200)

    for (i=0; i< canvas.width; i++) {
        j=i*6
        // draw from positiveAvg - variance to negativeAvg - variance
        canvasCtx.strokeStyle = fg_clr1
        canvasCtx.beginPath()
        canvasCtx.moveTo( i  , (resampled[j] - resampled[j+2] ))
        canvasCtx.lineTo( i  , (resampled[j +3] + resampled[j+5] ) )
        canvasCtx.stroke()
        // draw from positiveAvg - variance to positiveAvg + variance
        canvasCtx.strokeStyle = fg_clr2
        canvasCtx.beginPath()
        canvasCtx.moveTo( i  , (resampled[j] - resampled[j+2]) * scaleDown )
        canvasCtx.lineTo( i  , (resampled[j] + resampled[j+2]) * scaleDown )
        canvasCtx.stroke()
        // draw from negativeAvg + variance to negativeAvg - variance
        canvasCtx.beginPath()
        canvasCtx.moveTo( i  , (resampled[j+3] + resampled[j+5]) * scaleDown )
        canvasCtx.lineTo( i  , (resampled[j+3] - resampled[j+5]) * scaleDown )
        canvasCtx.stroke()
    }

    canvasCtx.restore()
}
