import math
import datetime


def secondsSinceMidnight():
    now = datetime.datetime.now()
    midnight = datetime.datetime.combine(now.date(), datetime.time())
    seconds = (now - midnight).seconds
    return seconds

def msSinceMidnight():
    now = datetime.datetime.now()
    midnight = datetime.datetime.combine(now.date(), datetime.time())
    seconds = (now - midnight).seconds
    microseconds = (now - midnight).microseconds
    milliseconds = (seconds*1000) + int(microseconds/1000)

    return milliseconds

def _seconds(value, edit_rate):
    if isinstance(value, str):  # value seems to be a timestamp
        _zip_ft = zip((3600, 60, 1, 1/edit_rate), value.split(':'))
        result = sum(f * float(t) for f,t in _zip_ft) 
        return result 
    elif isinstance(value, (int, float)):  # frames
        return value / edit_rate
    else:
        return 0

def _timecode(seconds, edit_rate):
    return '{h:02d}:{m:02d}:{s:02d}:{f:02d}' \
            .format(h=int(seconds/3600),
                    m=int(seconds/60%60),
                    s=int(seconds%60),
                    f=round((seconds-int(seconds))*edit_rate))

def _frames(seconds, edit_rate):
    return seconds * edit_rate

def timecode_to_frames(timecode, edit_rate, start=None):
    return _frames(_seconds(timecode, edit_rate) - _seconds(start, edit_rate), edit_rate)

def msToFrames(ms, edit_rate):
    return round(ms/1000*edit_rate)

def msToHMS(ms):
    seconds=int(ms/1000)%60
    minutes=int(ms/(1000*60))%60
    hours=int(ms/(1000*60*60))%24
    return str(hours).zfill(2) + "_" + str(minutes).zfill(2) + "_" + str(seconds).zfill(2)

def frames_to_TC(total_frames, edit_rate, drop=False):
    if drop and edit_rate not in [29.97, 59.94]:
        raise NotImplementedError("Time code calculation logic only supports drop frame "
                                  "calculations for 29.97 and 59.94 fps.")
    fps_int = int(round(edit_rate))

    if drop:
        FRAMES_IN_ONE_MINUTE = 1800 - 2
        FRAMES_IN_TEN_MINUTES = (FRAMES_IN_ONE_MINUTE * 10) - 2
        ten_minute_chunks = total_frames / FRAMES_IN_TEN_MINUTES
        one_minute_chunks = total_frames % FRAMES_IN_TEN_MINUTES
        ten_minute_part = 18 * ten_minute_chunks
        one_minute_part = 2 * ((one_minute_chunks - 2) / FRAMES_IN_ONE_MINUTE)
        if one_minute_part < 0:
            one_minute_part = 0
        # add extra frames
        total_frames += ten_minute_part + one_minute_part

        # for 60 fps drop frame calculations, we add twice the number of frames
        if fps_int == 60:
            total_frames = total_frames * 2

        # time codes are on the form 12:12:12;12
        smpte_token = ";"

    else:
        # time codes are on the form 12:12:12:12
        smpte_token = ":"

    # now split our frames into time code
    hours = int(total_frames / (3600 * fps_int))
    minutes = int(total_frames / (60 * fps_int) % 60)
    seconds = int(total_frames / fps_int % 60)
    frames = int(total_frames % fps_int)
    return "%02d:%02d:%02d%s%02d" % (hours, minutes, seconds, smpte_token, frames)

def convert_8_16bit(num):
    num /= 255
    num *= 65535
    return (int(num))