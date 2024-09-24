import sys
import opentimelineio as otio
import json
import os
import logging
from datetime import datetime
from utils.converters import frames_to_TC, msToFrames, msToHMS

## NOW has master mobs = sequence length created and used 
## TODO - increase number of arguments from index.js so nothing needs to be changed in here
## TODO - think about audio

comments = True
frames = 0
tc = ""

# Check if there is data on stdin
if not sys.stdin.isatty():
    # print("WriteTallyOTIO: Using data from stdin")

    input_str = sys.stdin.read()
    data = json.loads(input_str)
    # NB data is events {start, end, clips[{TIME, TEXT}]}
    # NB tapeInfo is {TEXT: [TapeName, colorRGB], etc}
    events = data['data']
    dictMasterMobInfo = data['tapeInfo']
    result_dir = json.loads(sys.argv[1]) 
    edit_rate = json.loads(sys.argv[2])

    sequence_name = 'TallyLog ' + msToHMS(events["start"]) + ' - ' +msToHMS(events["end"])
    file_name = result_dir + sequence_name + '.otio'
else:
    print("WriteTallyOTIO: No data provided on stdin. Using sample data")
    # FOR TESTING - sample data
    events = {'start': 51213498, 'end': 51288501, 'clips': [{'TIME': 51213902, 'TEXT': 'C-05'}, {'TIME': 51214656, 'TEXT': 'C-06'}, {'TIME': 51215424, 'TEXT': 'C-07'}, {'TIME': 51216199, 'TEXT': 'C-08'}, {'TIME': 51216947, 'TEXT': 'C-09'}, {'TIME': 51217714, 'TEXT': 'C-10'}, {'TIME': 51218483, 'TEXT': 'C-01'}, {'TIME': 51219240, 'TEXT': 'C-02'}, {'TIME': 51219999, 'TEXT': 'i-25'}, {'TIME': 51220771, 'TEXT': 'i-30'}, {'TIME': 51221531, 'TEXT': 'C-05'}, {'TIME': 51222298, 'TEXT': 'C-06'}, {'TIME': 51223054, 'TEXT': 'C-07'}, {'TIME': 51223822, 'TEXT': 'C-08'}, {'TIME': 51224570, 'TEXT': 'C-09'}, {'TIME': 51225334, 'TEXT': 'C-10'}, {'TIME': 51226096, 'TEXT': 'C-01'}, {'TIME': 51226853, 'TEXT': 'C-02'}, {'TIME': 51227623, 'TEXT': 'i-25'}, {'TIME': 51229137, 'TEXT': 'C-05'}, {'TIME': 51229902, 'TEXT': 'C-06'}, {'TIME': 51230655, 'TEXT': 'C-07'}, {'TIME': 51231424, 'TEXT': 'C-08'}, {'TIME': 51232180, 'TEXT': 'C-09'}, {'TIME': 51232931, 'TEXT': 'C-10'}, {'TIME': 51233705, 'TEXT': 'C-01'}, {'TIME': 51234455, 'TEXT': 'C-02'}, {'TIME': 51235213, 'TEXT': 'i-25'}, {'TIME': 51235973, 'TEXT': 'i-30'}, {'TIME': 51236728, 'TEXT': 'C-05'}, {'TIME': 51237495, 'TEXT': 'C-06'}, {'TIME': 51238257, 'TEXT': 'C-07'}, {'TIME': 51239011, 'TEXT': 'C-08'}, {'TIME': 51239781, 'TEXT': 'C-09'}, {'TIME': 51240545, 'TEXT': 'C-10'}, {'TIME': 51241312, 'TEXT': 'C-01'}, {'TIME': 51242073, 'TEXT': 'C-02'}, {'TIME': 51242832, 'TEXT': 'i-25'}, {'TIME': 51243605, 'TEXT': 'i-30'}, {'TIME': 51244376, 'TEXT': 'C-05'}, {'TIME': 51245127, 'TEXT': 'C-06'}, {'TIME': 51245895, 'TEXT': 'C-07'}, {'TIME': 51246661, 'TEXT': 'C-08'}, {'TIME': 51247417, 'TEXT': 'C-09'}, {'TIME': 51248177, 'TEXT': 'C-10'}, {'TIME': 51248937, 'TEXT': 'C-01'}, {'TIME': 51249692, 'TEXT': 'C-02'}, {'TIME': 51250453, 'TEXT': 'i-25'}, {'TIME': 51251219, 'TEXT': 'i-30'}, {'TIME': 51251981, 'TEXT': 'C-05'}, {'TIME': 51252741, 'TEXT': 'C-06'}, {'TIME': 51253510, 'TEXT': 'C-07'}, {'TIME': 51254265, 'TEXT': 'C-08'}, {'TIME': 51255018, 'TEXT': 'C-09'}, {'TIME': 51255791, 'TEXT': 'C-10'}, {'TIME': 51256549, 'TEXT': 'C-01'}, {'TIME': 51257308, 'TEXT': 'C-02'}, {'TIME': 51258063, 'TEXT': 'i-25'}, {'TIME': 51258827, 'TEXT': 'i-30'}, {'TIME': 51259588, 'TEXT': 'C-05'}, {'TIME': 51260353, 'TEXT': 'C-06'}, {'TIME': 51261109, 'TEXT': 'C-07'}, {'TIME': 51261884, 'TEXT': 'C-08'}, {'TIME': 51262630, 'TEXT': 'C-09'}, {'TIME': 51263395, 'TEXT': 'C-10'}, {'TIME': 51264146, 'TEXT': 'C-01'}, {'TIME': 51264912, 'TEXT': 'C-02'}, {'TIME': 51265656, 'TEXT': 'i-25'}, {'TIME': 51266417, 'TEXT': 'i-30'}, {'TIME': 51267186, 'TEXT': 'C-05'}, {'TIME': 51267944, 'TEXT': 'C-06'}, {'TIME': 51268710, 'TEXT': 'C-07'}, {'TIME': 51269468, 'TEXT': 'C-08'}, {'TIME': 51270226, 'TEXT': 'C-09'}, {'TIME': 51270984, 'TEXT': 'C-10'}, {'TIME': 51271742, 'TEXT': 'C-01'}, {'TIME': 51272509, 'TEXT': 'C-02'}, {'TIME': 51273265, 'TEXT': 'i-25'}, {'TIME': 51274031, 'TEXT': 'i-30'}, {'TIME': 51274784, 'TEXT': 'C-05'}, {'TIME': 51275544, 'TEXT': 'C-06'}, {'TIME': 51276316, 'TEXT': 'C-07'}, {'TIME': 51277068, 'TEXT': 'C-08'}, {'TIME': 51277825, 'TEXT': 'C-09'}, {'TIME': 51278582, 'TEXT': 'C-10'}, {'TIME': 51279350, 'TEXT': 'C-01'}, {'TIME': 51280105, 'TEXT': 'C-02'}, {'TIME': 51280876, 'TEXT': 'i-25'}, {'TIME': 51281633, 'TEXT': 'i-30'}, {'TIME': 51282406, 'TEXT': 'C-05'}, {'TIME': 51283164, 'TEXT': 'C-06'}, {'TIME': 51283925, 'TEXT': 'C-07'}, {'TIME': 51284687, 'TEXT': 'C-08'}, {'TIME': 51285447, 'TEXT': 'C-09'}, {'TIME': 51286212, 'TEXT': 'C-10'}, {'TIME': 51286973, 'TEXT': 'C-01'}, {'TIME': 51287739, 'TEXT': 'C-02'}]}
    dictMasterMobInfo = {'C-01': ['TapeName_C-01', [0, 128, 128], 'Iris'], 'C-02': ['TapeName_C-02', [0, 128, 128], 'Iris'], 'C-05': ['TapeName_C-05', [0, 128, 128], 'Iris'], 'C-06': ['TapeName_C-06', [0, 128, 128], 'Iris'], 'C-07': ['TapeName_C-07', [152, 251, 152], 'Iris'], 'C-08': ['TapeName_C-08', [152, 251, 152], 'Magenta'], 'C-09': ['TapeName_C-09', [152, 251, 152], 'Magenta'], 'C-10': ['TapeName_C-10', [152, 251, 152], 'Magenta'], 'i-25': ['TapeName_i-25', [231, 126, 49],'Rose'], 'i-30': ['TapeName_i-30', [255, 182, 193],'Rose'], 'PGM': ['~pdbMHtn', [147, 112, 219],'Green']}    
    result_dir = "../_TallyLogExports/otio/"
    edit_rate = 50
    sequence_name = 'TestTallyLog ' + msToHMS(events["start"]) + ' - ' +msToHMS(events["end"])
    file_name = result_dir + sequence_name + '.otio'

if not os.path.exists(result_dir):
    os.makedirs(result_dir)

# Logging
logging.basicConfig(filename=os.path.join(result_dir, 'error.log'), level=logging.INFO, format='%(asctime)s,%(msecs)03d %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s')
logger=logging.getLogger(__name__)


logger.info("Started OTIO")


# Container for MasterMobs
dictMobID = {}
# Containter for OTIO tracks
dictTrackID = {}

# Getting sequence start from first event
clip_start = events["clips"][0]['TIME']
clip_start = msToFrames(clip_start, edit_rate)

sequence_start = clip_start

# The end comes from point of last recorded event in node.js
frames = msToFrames(events["end"], edit_rate)
tc = frames_to_TC (frames, edit_rate, False)
sequence_end = frames

sequence_length = sequence_end - sequence_start


def writeTallyOTIO():

    # build the structure
    tl = otio.schema.Timeline(name=sequence_name)
    st = tl.tracks
    tl.global_start_time = otio.opentime.RationalTime(sequence_start, edit_rate)
    # print(tl.name) # name doesn't make it to Resolve

    for key in dictMasterMobInfo.keys():
        # tape_name = dictMasterMobInfo[key][0] # Tape name from source
        tape_name = dictMasterMobInfo['PGM'][0] # Tape name from PGM

        if tape_name == "":
            tape_name="unknown"
        master_mob = otio.schema.MissingReference(
            name = tape_name,
            # This is for Resolve tape name
            metadata ={ "Resolve_OTIO": {
                                "Reel Number": tape_name
                            }
            },
            # metadata = "", # This is probably where TapeName will go? Also Clip Colour?
            # available range is the content available for editing
            available_range = otio.opentime.TimeRange(
                start_time=otio.opentime.RationalTime(sequence_start, edit_rate),
                duration=otio.opentime.RationalTime(sequence_length, edit_rate)
            )
        )
        # logger.info(msg=master_mob)
        dictMobID[key] = master_mob
    for i in range(1,3): # needs to be one more than tracks required

        # SOURCE on V1 with PGM tape name
        if i == 1 :
            tr1 = otio.schema.Track(name="V1 - SrcClips") # name doesn't make it to Resolve
            st.append(tr1)

            # needed for OTIO -
            clip_position = sequence_start
            # build the clips for one video track
            for j, event in enumerate(events["clips"]):
                clip_start = event['TIME']
                clip_start = msToFrames(clip_start, edit_rate)

                if j < len(events["clips"]) -1:
                    clip_end = events["clips"][j+1]['TIME']
                    clip_end = msToFrames(clip_end, edit_rate)
                else:
                    clip_end = sequence_end
                clip_length = clip_end - clip_start

                mm = (dictMobID[event['TEXT']])
                # tape_name = dictMasterMobInfo['PGM'][0] # Tape name from PGM
                tape_name = dictMasterMobInfo[event['TEXT']][0] # Tape name from SRC
                # attach the reference to the clip
                clip = otio.schema.Clip(
                    name = event['TEXT'],
                    media_reference=mm,
                    # This is for Resolve Reel name (even though called Reel Number)
                    metadata ={ "Resolve_OTIO": {
                                        "Reel Number": tape_name
                                    }
                    },
                    # the source range represents the range of the media that is being
                    # 'cut into' the clip. 
                    source_range=otio.opentime.TimeRange(
                        start_time=otio.opentime.RationalTime(
                            clip_position, edit_rate
                        ),
                        duration=otio.opentime.RationalTime(
                            clip_length, edit_rate
                        )
                    ),
                )
                # put the clip into the track
                tr1.append(clip)
                clip_position += clip_length
        if i == 2 :
            tr2 = otio.schema.Track(name="V2 - PGM Clips") # name doesn't make it to Resolve
            st.append(tr2)

            # needed for OTIO -
            clip_position = sequence_start
            # build the clips for one video track
            for j, event in enumerate(events["clips"]):
                clip_start = event['TIME']
                clip_start = msToFrames(clip_start, edit_rate)

                if j < len(events["clips"]) -1:
                    clip_end = events["clips"][j+1]['TIME']
                    clip_end = msToFrames(clip_end, edit_rate)
                else:
                    clip_end = sequence_end
                clip_length = clip_end - clip_start

                mm = (dictMobID[event['TEXT']])
                tape_name = dictMasterMobInfo['PGM'][0] # Tape name from PGM
                # tape_name = dictMasterMobInfo[event['TEXT']][0] # Tape name from SRC
                # attach the reference to the clip
                clip = otio.schema.Clip(
                    name = event['TEXT'],
                    media_reference=mm,
                    # This is for Resolve Reel name (even though called Reel Number)
                    metadata ={ "Resolve_OTIO": {
                                        "Reel Number": tape_name
                                    }
                    },
                    # the source range represents the range of the media that is being
                    # 'cut into' the clip. 
                    source_range=otio.opentime.TimeRange(
                        start_time=otio.opentime.RationalTime(
                            clip_position, edit_rate
                        ),
                        duration=otio.opentime.RationalTime(
                            clip_length, edit_rate
                        )
                    ),
                )
                # put the clip into the track
                tr2.append(clip)
                clip_position += clip_length

    result_file = os.path.join(result_dir, sequence_name + '.otio')
    # write the file to disk
    otio.adapters.write_to_file(tl, result_file)
writeTallyOTIO()

logger.info("OTIO success")