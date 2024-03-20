// tallyLogManager.js

let tallyLog = { start: '0', end: '0', clips: [] };

function setStartTime(time) {
    tallyLog.start = time;
}
function getStartTime() {
    return tallyLog.start;
}
function setEndTime(time) {
    tallyLog.end = time;
}
function getEndTime() {
    return tallyLog.end;
}

function addClip(clip) {
    tallyLog.clips.push(clip);
}

function getClips() {
    return tallyLog.clips;
}

function popLastClip(){
    return tallyLog['clips'].pop();
}

function getLastClip(){
    return tallyLog['clips'][tallyLog.length - 1];
}

function clearClips() {
    tallyLog.clips = [];
}

module.exports = {
    addClip,
    getClips,
    clearClips,
    setStartTime,
    setEndTime,
    getStartTime,
    getEndTime,
    popLastClip,
    getLastClip
};