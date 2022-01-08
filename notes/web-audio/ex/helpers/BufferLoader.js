/*
    BufferLoader
    -----------
    by Nick Briz <nbriz@brangerbriz.com> for brangerbriz.com
    GNU GPLv3 - https://www.gnu.org/licenses/gpl-3.0.txt
    2018

    -----------
       info
    -----------

    This is a helper class that loads multiple audio buffers into a dictionary.
    It can load buffers from audio files or base64 encoded strings. It also has
    methods for loading audio files and base64 strings. The constructor requires
    you first pass it an AudioContext. That's enough if you are simply creating
    an instance of the BufferLoader in order to use it's loadeFil() or it's
    loadBase64() methods, but if you'd like to load buffers immediately, you
    can pass an array of paths or base64 strings as a second argument. A
    callback can be passed as it's third argument. This callback will fire once
    all the buffers in the second argument are loaded. These buffers can be
    accessed again later from the .buffers dictionary


    -----------
       usage
    -----------
    let src = new AudioBufferSourceNode( audioContext )
        src.connect( audioContext.destination )
    let bl  = new BufferLoader(audioContext,[
        'audio/file1.mp3',
        'audio/file2.wav',
        base64String,
        'audio/file3.ogg'
    ],(b)=>{
        src.buffer = b[0] // this would be 'audio/file1.mp3'
        src.start()
    })

    // later we can create another src and use the previously loaded buffers
    src = new AudioBufferSourceNode( audioContext )
    src.buffer = bl.buffers[1]
    src.connect( audioContext.destination )
    src.start()

    // we can also use it's methods independently
    bl.loadBase64(base64String,(buffer)=>{
        src.buffer = buffer
        src.start()
    })

    bl.loadFile('audio/file3.ogg',(buffer)=>{
        src.buffer = buffer
        src.start()
    })

*/
class BufferLoader {
    constructor( audioContext, list, callback ){
        if( !(audioContext instanceof AudioContext) ){
            throw new Error('BufferLoader: constructor requires you pass'+
            ' an AudioContext as it\'s first argument')
        }

        if( list && !(list instanceof Array) ){
            throw new Error('BufferLoader: constructor requires you pass as'+
            '  it\'s second argument either nothing at all, or an array of'+
            '  paths to sound files and/or variables containing base64 strings')
        }

        this.ctx = audioContext
        this.buffers = {}

        if( list ){
            const runCallback = this.after(list.length, () => {
                if(callback) callback(this.buffers)
            })

            for (let i = 0; i < list.length; i++) {
                let s = list[i]
                if(typeof s !== 'string'){
                    let m = `BufferLoader: item ${i} in array is not a string`
                    throw new Error(m)
                    break
                }
                if( s.indexOf('.') > 0 ){
                    this.loadFile( s,(buffer)=>{
                        this.buffers[i] = buffer
                        runCallback()
                    })
                } else {
                    this.loadBase64( s,(buffer)=>{
                        this.buffers[i] = buffer
                        runCallback()
                    })
                }
            }
        }
    }

    after(times,func){
        return function() {
            if (--times < 1) {
                return func.apply(this, arguments)
            }
        }
    }

    loadBase64( base64, callback ){
        // http://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer
        let binaryString = window.atob(base64)
        let len = binaryString.length
        let bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        this.ctx.decodeAudioData(bytes.buffer, (buffer)=>{
            if(callback) callback(buffer)
        })
    }

    loadFile( path, callback ){
        fetch( path )
            .then(res => res.arrayBuffer() )
            .then(data => {
                this.ctx.decodeAudioData(data, (buffer)=>{
                    if(callback) callback(buffer)
                })
            })
            .catch(err => { console.error(err) })
    }
}
