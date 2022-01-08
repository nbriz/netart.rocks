/*
    getPitch()

    -----------
       info
    -----------

    this is a function for calculating the frequency in Hz of a sound sample
    from a WebAudio AnalyserNode. as well as a few other helper functions.
    this is 100% Chris Wilson's work: https://github.com/cwilso/PitchDetect

    -----------
       usage
    -----------

    getPitch( fft, ctx.sampleRate )

*/
function noteFromPitch( freq ) {
    var noteNum = 12 * (Math.log( freq / 440 )/Math.log(2) )
    return Math.round( noteNum ) + 69
}

function frequencyFromNoteNumber( note ) {
    return 440 * Math.pow(2,(note-69)/12)
}

function centsOffFromPitch( freq, note ) {
    return Math.floor(
        1200 * Math.log( freq / frequencyFromNoteNumber( note ))/Math.log(2)
    )
}

function getPitch(fft,sampleRate){

    const bufferLength = fft.frequencyBinCount
    const dataArray = new Float32Array(bufferLength)

    const SIZE = dataArray.length
    const MAX_SAMPLES = Math.floor(SIZE/2)
    const MIN_SAMPLES = 0

    let best_offset = -1
    let best_correlation = 0
    let correlations = new Array(MAX_SAMPLES)
    let foundGoodCorrelation = false
    let rms = 0

    fft.getFloatTimeDomainData( dataArray )

    for (let i=0;i<SIZE;i++) {
        let val = dataArray[i]
        rms += val*val
    }
    rms = Math.sqrt(rms/SIZE);
    if (rms<0.01) // not enough signal
        return -1

    let lastCorrelation=1
    for (let offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
        let correlation = 0

        for (let j=0; j<MAX_SAMPLES; j++) {
            correlation += Math.abs((dataArray[j])-(dataArray[j+offset]))
        }
        correlation = 1 - (correlation/MAX_SAMPLES)
        // store it, for the tweaking we need to do below.
        correlations[offset] = correlation;

        if ((correlation>0.9) && (correlation > lastCorrelation)) {
            foundGoodCorrelation = true
            if (correlation > best_correlation) {
                best_correlation = correlation
                best_offset = offset
            }
        } else if (foundGoodCorrelation) {
        // short-circuit - we found a good correlation, then a bad one, so we'd
        // just be seeing copies from here. Now we need to tweak the offset - by
        // interpolating between the values to the left and right of the
        // best offset, and shifting it a bit.  This is complex, and HACKY in
        // this code (happy to take PRs!) - we need to do a curve fit on
        // correlations[] around best_offset in order to better determine
        // precise (anti-aliased) offset. we know best_offset >=1, since
        // foundGoodCorrelation cannot go to true until the second pass
        // (offset=1), and we can't drop into this clause until the following
        // pass (else if).
            let shift = (correlations[best_offset+1] -
                correlations[best_offset-1])/correlations[best_offset]
            return sampleRate/(best_offset+(8*shift))
        }
        lastCorrelation = correlation
    }
    if (best_correlation > 0.01) {
        return sampleRate/best_offset
    }
    return -1
}
