/*
  everything happens inside an [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) so you need that first and foremost
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
