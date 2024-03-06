import asyncio
from tslumd import UmdReceiver
from utils.converters import secondsSinceMidnight, msSinceMidnight
import datetime
from getTapeData import getTapeData
from keyboard import add_hotkey, wait, call_later
import sys

# NB - ABANDONED as it was not as good as tally-timer
# TODO readTally can just run indefinitely and log the switcher
# ALTHOUGH tally-timer may be better as it accepts keypresses
# and could populate an HTML page?


# these should be called seperately as required?
# from writeTallyAAF import writeTallyAAF
# from writeTallyAVB import writeTallyAVB
# from writeTallyOTIO import writeTallyOTIO

# To pass to writeTallyAAF.py or writeTallyAVB.py or writeTallyOTIO.py
EDIT_RATE = 50
TAPE_NAME_PATH = "/Users/trevoraylward/Documents/GitHub/_TallyToAAF/LUT/TallyTapeName.csv"
AAF_PATH = "/Users/trevoraylward/Documents/GitHub/_TallyToAAF/aaf/"
AVB_PATH = "/Users/trevoraylward/Documents/Avid Projects/NBC Paris 24/results/"
OTIO_PATH = "/Users/trevoraylward/Documents/GitHub/_TallyToAAF/otio/"

TIME_TO_RUN_FOR = 1*60*60; # Time until app quits in seconds

events = {'start' : 0, 'end' : 0, 'clips' : []} # This is where events are stored to pass to AAF, start and end are redundant
events['start'] = msSinceMidnight()
tallyObj = {}

# def timedOutput():
# 	#this is for AAF/AVB/OTIO write at current point and reset
# 	# last switch is end of sequence (i.e. that event is NOT included)
# 	lastElement = events['clips'].pop()
# 	events['end'] = lastElement['TIME']
   
# 	writeTallyAAF(events, getTapeData(), AAF_PATH, EDIT_RATE)
# 	writeTallyAVB(events, getTapeData(), AVB_PATH
#, EDIT_RATE)
# 	writeTallyOTIO(events, getTapeData(), OTIO_PATH, EDIT_RATE)
# 	# if (reset){
# 	# 	// Reset tallylog
# 	# 	tallyLog.start = tallyLog.end;
# 	# 	tallyLog.end = 0;
# 	# 	tallyLog['clips']=[];
# 	# 	tallyLog['clips'].push(lastElement);
# 	# }
# 	# // Reset the timer after running the task
# 	# resetTimer();    

def tally_updated(tally, props_changed, **kwargs):
   for name in props_changed:
        value = getattr(tally, name)
        time = msSinceMidnight()
        tallyObj['TIME'] = time
        tallyObj['TEXT'] = value
        print(tallyObj)
        events['clips'].append(tallyObj)
        # print(events)

# Change these as necessary
receiver = UmdReceiver(hostaddr = "127.0.0.1", hostport = 65200)
receiver.bind(
   on_tally_updated=tally_updated,
   )

async def run():
   async with receiver:
      await asyncio.sleep(TIME_TO_RUN_FOR) # Length of time to run for

loop = asyncio.get_event_loop() 
loop.run_until_complete(run())
# timedOutput()
