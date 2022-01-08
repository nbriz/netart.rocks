/*
    FilterGUI
    -----------
    by Nick Briz <nbriz@brangerbriz.com> for brangerbriz.com
    GNU GPLv3 - https://www.gnu.org/licenses/gpl-3.0.txt
    2018

    -----------
       info
    -----------

    This is a helper class takes an AudioContext and a BiquadFilterNode as
    arguments and creates date.GUI controls for the BiquadFilterNode as well as
    a canvas Visualization of the filter curve.


    -----------
       usage
    -----------
    const gui = new FilterGUI( audioContext, filter )

*/
class FilterGUI {
    constructor( audioContext, filter ){

        if( !(audioContext instanceof AudioContext) ){
            throw new Error('FilterGUI: constructor requires you pass'+
            ' an AudioContext as it\'s first argument')
        } else if( !(filter instanceof BiquadFilterNode) ){
            throw new Error('FilterGUI: constructor requires you pass as'+
            '  it\'s second argument a BiquadFilterNode')
        } else if( typeof dat !== "object" ){
            throw new Error('FilterGUI: is dependent on dat.GUI')
        }

        this.types = [
            "lowpass", "highpass", "bandpass", "lowshelf",
            "highshelf", "peaking", "notch", "allpass"
        ]

        this.audioContext = audioContext
        this.filter = filter
        this.type = filter.type
        this.frequency =  filter.frequency.value // -24000 to 24000
        this.gain = filter.gain.value // -Infinity to Infinity
        this.Q = filter.Q.value // -Infinity to Infinity

        // create dat.gui
        this.gui = new dat.GUI()
        this._createGUI()

        // create canvas
        this.canvas = document.createElement('canvas')
        this.canvas.style.borderRadius = 0
        this.canvas.width = this.gui.domElement.offsetWidth
        this.gui.domElement.prepend( this.canvas )
        this.ctx = this.canvas.getContext('2d')
        this._updateCanvas()
    }

    _createGUI(){
        this.gui.add( this, 'type', this.types ).onChange((v)=>{
            this.filter.type = v
            this._updateCanvas()
        })
        this.gui.add( this, 'frequency', 20, 5000).onChange((v)=>{
            this.filter.frequency.setValueAtTime( v, this.audioContext.currentTime)
            this._updateCanvas()
        })
        this.gui.add( this, 'gain', -20, 20).onChange((v)=>{
            this.filter.gain.setValueAtTime( v, this.audioContext.currentTime)
            this._updateCanvas()
        })
        this.gui.add( this, 'Q', 0, 20).onChange((v)=>{
            this.filter.Q.setValueAtTime( v, this.audioContext.currentTime)
            this._updateCanvas()
        })
    }

    _updateCanvas(){
        let freqRes = this._calcFrequencyResponse()
        this.ctx.fillStyle = "#1a1a1a"
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
        // maths via: http://webaudioapi.com/samples/frequency-response/
        var dbScale = Math.round(this.canvas.height/4)
        var dbScale2 = Math.round(this.canvas.height/12.5)
        var pixelsPerDb = (0.5 * this.canvas.height) / dbScale
        this.ctx.strokeStyle = '#2fa1d6'
        this.ctx.lineWidth = 3
        this.ctx.beginPath()
        for (var i = 0; i < this.canvas.width; ++i) {
            var mr = freqRes.magResponse[i]
            var dbResponse = dbScale2 * Math.log(mr) / Math.LN10
            var x = i
            var y = (0.5 * this.canvas.height) - pixelsPerDb * dbResponse
            if ( i == 0 ) this.ctx.moveTo( x, y )
            else this.ctx.lineTo( x, y )
        }
        this.ctx.stroke()
    }

    _calcFrequencyResponse(){
        // maths via: http://webaudioapi.com/samples/frequency-response/
        let length = this.canvas.width
        let noctaves = 11
        let frequencyHz = new Float32Array(length)
        let magResponse = new Float32Array(length)
        let phaseResponse = new Float32Array(length)
        let nyquist = 0.5 * this.audioContext.sampleRate
        for (let i = 0; i < length; ++i) {
            let f = i / length;
            // Convert to log frequency scale (octaves).
            f = nyquist * Math.pow(2.0, noctaves * (f - 1.0))
            frequencyHz[i] = f
        }

        this.filter.getFrequencyResponse( frequencyHz, magResponse, phaseResponse );

        return {
            frequency:frequencyHz,
            magResponse:magResponse,
            phaseResponse:phaseResponse
        }
    }
}
