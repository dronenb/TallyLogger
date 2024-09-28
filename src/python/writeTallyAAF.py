import sys
import aaf2
import json
import os
import logging
from utils.converters import frames_to_TC, msToFrames, msToHMS, convert_8_16bit

## NOW has master mobs = sequence length created and used 
## TODO - increase number of arguments from index.js so nothing needs to be changed in here
## TODO - think about audio

comments = True
frames = 0
tc = ""

# Check if there is data on stdin
if not sys.stdin.isatty():
    # print("WriteTallyAAF: Using data from stdin")
    input_str = sys.stdin.read()
    data = json.loads(input_str)
    # NB data is events {start, end, clips[{TIME, TEXT}]}
    # NB tapeInfo is {TEXT: [TapeName, colorRGB], etc}
    events = data['data'] # Tally events
    dictMasterMobInfo = data['tapeInfo'] # Tape Name, Colour etc
    result_dir = json.loads(sys.argv[1]) 
    edit_rate = json.loads(sys.argv[2])

    sequence_name = 'TallyLog ' + msToHMS(events["start"]) + ' - ' +msToHMS(events["end"])
    file_name = result_dir + sequence_name + '.aaf'


else:
    print("WriteTallyAAF: No data provided on stdin. Using sample data")
    # FOR TESTING - sample data
    events = {'start': 51213498, 'end': 51288501, 'clips': [{'TIME': 51213902, 'TEXT': 'C-05'}, {'TIME': 51214656, 'TEXT': 'C-06'}, {'TIME': 51215424, 'TEXT': 'C-07'}, {'TIME': 51216199, 'TEXT': 'C-08'}, {'TIME': 51216947, 'TEXT': 'C-09'}, {'TIME': 51217714, 'TEXT': 'C-10'}, {'TIME': 51218483, 'TEXT': 'C-01'}, {'TIME': 51219240, 'TEXT': 'C-02'}, {'TIME': 51219999, 'TEXT': 'i-25'}, {'TIME': 51220771, 'TEXT': 'i-30'}, {'TIME': 51221531, 'TEXT': 'C-05'}, {'TIME': 51222298, 'TEXT': 'C-06'}, {'TIME': 51223054, 'TEXT': 'C-07'}, {'TIME': 51223822, 'TEXT': 'C-08'}, {'TIME': 51224570, 'TEXT': 'C-09'}, {'TIME': 51225334, 'TEXT': 'C-10'}, {'TIME': 51226096, 'TEXT': 'C-01'}, {'TIME': 51226853, 'TEXT': 'C-02'}, {'TIME': 51227623, 'TEXT': 'i-25'}, {'TIME': 51229137, 'TEXT': 'C-05'}, {'TIME': 51229902, 'TEXT': 'C-06'}, {'TIME': 51230655, 'TEXT': 'C-07'}, {'TIME': 51231424, 'TEXT': 'C-08'}, {'TIME': 51232180, 'TEXT': 'C-09'}, {'TIME': 51232931, 'TEXT': 'C-10'}, {'TIME': 51233705, 'TEXT': 'C-01'}, {'TIME': 51234455, 'TEXT': 'C-02'}, {'TIME': 51235213, 'TEXT': 'i-25'}, {'TIME': 51235973, 'TEXT': 'i-30'}, {'TIME': 51236728, 'TEXT': 'C-05'}, {'TIME': 51237495, 'TEXT': 'C-06'}, {'TIME': 51238257, 'TEXT': 'C-07'}, {'TIME': 51239011, 'TEXT': 'C-08'}, {'TIME': 51239781, 'TEXT': 'C-09'}, {'TIME': 51240545, 'TEXT': 'C-10'}, {'TIME': 51241312, 'TEXT': 'C-01'}, {'TIME': 51242073, 'TEXT': 'C-02'}, {'TIME': 51242832, 'TEXT': 'i-25'}, {'TIME': 51243605, 'TEXT': 'i-30'}, {'TIME': 51244376, 'TEXT': 'C-05'}, {'TIME': 51245127, 'TEXT': 'C-06'}, {'TIME': 51245895, 'TEXT': 'C-07'}, {'TIME': 51246661, 'TEXT': 'C-08'}, {'TIME': 51247417, 'TEXT': 'C-09'}, {'TIME': 51248177, 'TEXT': 'C-10'}, {'TIME': 51248937, 'TEXT': 'C-01'}, {'TIME': 51249692, 'TEXT': 'C-02'}, {'TIME': 51250453, 'TEXT': 'i-25'}, {'TIME': 51251219, 'TEXT': 'i-30'}, {'TIME': 51251981, 'TEXT': 'C-05'}, {'TIME': 51252741, 'TEXT': 'C-06'}, {'TIME': 51253510, 'TEXT': 'C-07'}, {'TIME': 51254265, 'TEXT': 'C-08'}, {'TIME': 51255018, 'TEXT': 'C-09'}, {'TIME': 51255791, 'TEXT': 'C-10'}, {'TIME': 51256549, 'TEXT': 'C-01'}, {'TIME': 51257308, 'TEXT': 'C-02'}, {'TIME': 51258063, 'TEXT': 'i-25'}, {'TIME': 51258827, 'TEXT': 'i-30'}, {'TIME': 51259588, 'TEXT': 'C-05'}, {'TIME': 51260353, 'TEXT': 'C-06'}, {'TIME': 51261109, 'TEXT': 'C-07'}, {'TIME': 51261884, 'TEXT': 'C-08'}, {'TIME': 51262630, 'TEXT': 'C-09'}, {'TIME': 51263395, 'TEXT': 'C-10'}, {'TIME': 51264146, 'TEXT': 'C-01'}, {'TIME': 51264912, 'TEXT': 'C-02'}, {'TIME': 51265656, 'TEXT': 'i-25'}, {'TIME': 51266417, 'TEXT': 'i-30'}, {'TIME': 51267186, 'TEXT': 'C-05'}, {'TIME': 51267944, 'TEXT': 'C-06'}, {'TIME': 51268710, 'TEXT': 'C-07'}, {'TIME': 51269468, 'TEXT': 'C-08'}, {'TIME': 51270226, 'TEXT': 'C-09'}, {'TIME': 51270984, 'TEXT': 'C-10'}, {'TIME': 51271742, 'TEXT': 'C-01'}, {'TIME': 51272509, 'TEXT': 'C-02'}, {'TIME': 51273265, 'TEXT': 'i-25'}, {'TIME': 51274031, 'TEXT': 'i-30'}, {'TIME': 51274784, 'TEXT': 'C-05'}, {'TIME': 51275544, 'TEXT': 'C-06'}, {'TIME': 51276316, 'TEXT': 'C-07'}, {'TIME': 51277068, 'TEXT': 'C-08'}, {'TIME': 51277825, 'TEXT': 'C-09'}, {'TIME': 51278582, 'TEXT': 'C-10'}, {'TIME': 51279350, 'TEXT': 'C-01'}, {'TIME': 51280105, 'TEXT': 'C-02'}, {'TIME': 51280876, 'TEXT': 'i-25'}, {'TIME': 51281633, 'TEXT': 'i-30'}, {'TIME': 51282406, 'TEXT': 'C-05'}, {'TIME': 51283164, 'TEXT': 'C-06'}, {'TIME': 51283925, 'TEXT': 'C-07'}, {'TIME': 51284687, 'TEXT': 'C-08'}, {'TIME': 51285447, 'TEXT': 'C-09'}, {'TIME': 51286212, 'TEXT': 'C-10'}, {'TIME': 51286973, 'TEXT': 'C-01'}, {'TIME': 51287739, 'TEXT': 'C-02'}]}
    dictMasterMobInfo = {'C-01': ['TapeName_C-01', [0, 128, 128], 'Iris'], 'C-02': ['TapeName_C-02', [0, 128, 128], 'Iris'], 'C-05': ['TapeName_C-05', [0, 128, 128], 'Iris'], 'C-06': ['TapeName_C-06', [0, 128, 128], 'Iris'], 'C-07': ['TapeName_C-07', [152, 251, 152], 'Iris'], 'C-08': ['TapeName_C-08', [152, 251, 152], 'Magenta'], 'C-09': ['TapeName_C-09', [152, 251, 152], 'Magenta'], 'C-10': ['TapeName_C-10', [152, 251, 152], 'Magenta'], 'i-25': ['TapeName_i-25', [231, 126, 49],'Rose'], 'i-30': ['TapeName_i-30', [255, 182, 193],'Rose'], 'PGM': ['~pdbMHtn', [147, 112, 219],'Green']}    
    result_dir = "../_TallyLogExports/aaf/"
    edit_rate = 50
    sequence_name = 'TestTallyLog ' + msToHMS(events["start"]) + ' - ' +msToHMS(events["end"])
    file_name = result_dir + sequence_name + '.aaf'

if not os.path.exists(result_dir):
    os.makedirs(result_dir)

# Logging
logging.basicConfig(filename=os.path.join(result_dir, 'error.log'), level=logging.INFO, format='%(asctime)s,%(msecs)03d %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s')
logger=logging.getLogger(__name__)


logger.info("Started AAF")
# logger.info(events)

# Container for MasterMobs
dictMobID = {}

# Getting sequence start from first event
clip_start = events["clips"][0]['TIME']
clip_start = msToFrames(clip_start, edit_rate)

sequence_start = clip_start


# The end makes sense as there is not necessarily an 'event' 
frames = msToFrames(events["end"], edit_rate)
tc = frames_to_TC (frames, edit_rate, False)
sequence_end = frames

sequence_length = sequence_end - sequence_start

with aaf2.open(file_name, "w")  as f:
    # Composition Mob created first
    comp_mob = f.create.CompositionMob()
    comp_mob.name = sequence_name

    # Add color to SEQUENCE (only Avid seems to read this)
    attrib_list = comp_mob['MobAttributeList']
    attrib_list.append(f.create.TaggedValue("_COLOR_R", 12000))
    attrib_list.append(f.create.TaggedValue("_COLOR_G", 16000))
    attrib_list.append(f.create.TaggedValue("_COLOR_B", 60000))

    # Create a TimelineMobSlot with a Timecode Segment for the start timecode
    tc_segment = f.create.Timecode(edit_rate)
    tc_segment.start = sequence_start
    tc_slot = comp_mob.create_timeline_slot(edit_rate, slot_id=1)
    tc_slot.segment = tc_segment

    for key in dictMasterMobInfo.keys():

        # tape_name = dictMasterMobInfo[key][0] # Tape name from source
        tape_name = dictMasterMobInfo['PGM'][0] # Tape name from PGM

        if tape_name == "":
            tape_name="unknown"

        # Make the Tape MOB
        tape_mob = f.create.SourceMob()
        
        tape_slot, tape_timecode_slot = tape_mob.create_tape_slots(tape_name, edit_rate, edit_rate)        
        
        # set start time for clip
        tape_timecode_slot.segment.start = clip_start
        #Reduces from default 12 hours
        tape_slot.segment.length = sequence_length

        f.content.mobs.append(tape_mob)

        # Make a FileMob - not sure where this goes?
        file_mob = f.create.SourceMob()

        file_description = f.create.CDCIDescriptor()
        file_description['ComponentWidth'].value = 8
        file_description['HorizontalSubsampling'].value = 4
        file_description['ImageAspectRatio'].value = '16/9'
        file_description['StoredWidth'].value = 1920
        file_description['StoredHeight'].value = 1080
        file_description['FrameLayout'].value = 'FullFrame'
        file_description['VideoLineMap'].value = [42, 0]
        file_description['SampleRate'].value = edit_rate
        file_description['Length'].value = sequence_length

        file_mob.descriptor = file_description
        # This length affects length of master mob and in timeline
        tape_clip = tape_mob.create_source_clip(slot_id=1, length=sequence_length)
        slot = file_mob.create_picture_slot(edit_rate)
        slot.segment.components.append(tape_clip)

        f.content.mobs.append(file_mob)

        # Make the Master MOBs

        master_mob = f.create.MasterMob()
        # Add color to the master_mob (shows on MASTERCLIP in Avid only)
        master_mob.name = key
        clip_color = dictMasterMobInfo[key][1]
        if clip_color != "":
            attrib_list = master_mob['MobAttributeList']
            attrib_list.append(f.create.TaggedValue("_COLOR_R", convert_8_16bit(clip_color[0])))
            attrib_list.append(f.create.TaggedValue("_COLOR_G", convert_8_16bit(clip_color[1])))
            attrib_list.append(f.create.TaggedValue("_COLOR_B", convert_8_16bit(clip_color[2]))) 

        clip = file_mob.create_source_clip(slot_id=1)
        slot = master_mob.create_picture_slot(edit_rate)
        slot.segment.components.append(clip)

        # dictMobID[key] = master_mob.mob_id
        dictMobID[key] = master_mob
        f.content.mobs.append(master_mob)

    # Finally append everthing to content
    f.content.mobs.append(comp_mob)


    for i in range(1,3):
        sequence = f.create.Sequence(media_kind="picture")
        timeline_slot = comp_mob.create_timeline_slot(edit_rate)
        timeline_slot.segment= sequence
        
        if (i == 1):
            timeline_slot.name = "SRC"
            clip_position = 0
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

                # Create a SourceClip
                clip = mm.create_source_clip(slot_id=1)
                # This is the start point of the master mob in the source clip?
                clip.start = clip_position
                # This is the length of the source clip - filled with the master mob
                clip.length = clip_length
                # this is that clip appended to the sequence

                sequence.components.append(clip)
               
                clip_position += clip_length
        else:
            timeline_slot.name = "PGM"
            clip_position = 0
            for j, event in enumerate(events["clips"]):

                clip_start = event['TIME']
                clip_start = msToFrames(clip_start, edit_rate)

                if j < len(events["clips"]) -1:
                    clip_end = events["clips"][j+1]['TIME']
                    clip_end = msToFrames(clip_end, edit_rate)
                else:
                    clip_end = sequence_end
                clip_length = clip_end - clip_start

                mm = (dictMobID['PGM'])

                # Create a SourceClip
                clip = mm.create_source_clip(slot_id=1)
                # This is the start point of the master mob in the source clip?
                clip.start = clip_position
                # This is the length of the source clip - filled with the master mob
                clip.length = clip_length
                # this is that clip appended to the sequence
                sequence.components.append(clip)
                # TODO This is the marker section - really just one marker atm
                if comments:
                    marker_sequence = f.create.Sequence("DescriptiveMetadata")
                    marker = f.create.DescriptiveMarker()
                    marker['Position'].value = clip_position + 1 # Not visible at 0?? Plus double markers - not sure why
                    # marker['Length'].value = clip_length 
                    magenta={u'blue': 52428, u'green': 13107, u'red': 52428} # seems to need to be precise
                    marker['CommentMarkerColor'].value=magenta
                    marker['Comment'].value = f"{event['TEXT']}"
                    marker['CommentMarkerUser'].value = "easyLog"

                    marker_sequence.components.append(marker)
                    ems = f.create.EventMobSlot()
                    ems['EditRate'].value = edit_rate
                    ems['SlotID'].value = 1
                    ems.segment = marker_sequence
                    comp_mob.slots.append(ems)
                clip_position += clip_length


logger.info("AAF success")