from __future__ import (
    unicode_literals,
    absolute_import,
    print_function,
    division,
    )
import os, sys, subprocess, json, logging
import avb
# extra module that may be useful in shared environments
# import binlock as binlock
import avb.utils
from utils.converters import frames_to_TC, msToFrames, msToHMS, convert_8_16bit

# Check if there is data on stdin
if not sys.stdin.isatty():
    input_str = sys.stdin.read()
    data = json.loads(input_str)
    # NB data is events {start, end, clips[{TIME, TEXT}]}
    # NB tapeInfo is {TEXT: [TapeName, colorRGB], etc}
    events = data['data']
    dictMasterMobInfo = data['tapeInfo']
    result_dir = json.loads(sys.argv[1]) 
    edit_rate = json.loads(sys.argv[2])
    # print(events)
    # print(dictMasterMobInfo)

    sequence_name = 'TallyLog ' + msToHMS(events["start"]) + ' - ' +msToHMS(events["end"])
    file_name = result_dir + sequence_name + '.avb'

else:
    print("WriteTallyAVB: No data provided on stdin. Using sample data")
    # FOR TESTING - sample data
    edit_rate = 50
    events = {'start': 51213498, 'end': 51288501, 'clips': [{'TIME': 51213902, 'TEXT': 'C-05'}, {'TIME': 51214656, 'TEXT': 'C-06'}, {'TIME': 51215424, 'TEXT': 'C-07'}, {'TIME': 51216199, 'TEXT': 'C-08'}, {'TIME': 51216947, 'TEXT': 'C-09'}, {'TIME': 51217714, 'TEXT': 'C-10'}, {'TIME': 51218483, 'TEXT': 'C-01'}, {'TIME': 51219240, 'TEXT': 'C-02'}, {'TIME': 51219999, 'TEXT': 'i-25'}, {'TIME': 51220771, 'TEXT': 'i-30'}, {'TIME': 51221531, 'TEXT': 'C-05'}, {'TIME': 51222298, 'TEXT': 'C-06'}, {'TIME': 51223054, 'TEXT': 'C-07'}, {'TIME': 51223822, 'TEXT': 'C-08'}, {'TIME': 51224570, 'TEXT': 'C-09'}, {'TIME': 51225334, 'TEXT': 'C-10'}, {'TIME': 51226096, 'TEXT': 'C-01'}, {'TIME': 51226853, 'TEXT': 'C-02'}, {'TIME': 51227623, 'TEXT': 'i-25'}, {'TIME': 51229137, 'TEXT': 'C-05'}, {'TIME': 51229902, 'TEXT': 'C-06'}, {'TIME': 51230655, 'TEXT': 'C-07'}, {'TIME': 51231424, 'TEXT': 'C-08'}, {'TIME': 51232180, 'TEXT': 'C-09'}, {'TIME': 51232931, 'TEXT': 'C-10'}, {'TIME': 51233705, 'TEXT': 'C-01'}, {'TIME': 51234455, 'TEXT': 'C-02'}, {'TIME': 51235213, 'TEXT': 'i-25'}, {'TIME': 51235973, 'TEXT': 'i-30'}, {'TIME': 51236728, 'TEXT': 'C-05'}, {'TIME': 51237495, 'TEXT': 'C-06'}, {'TIME': 51238257, 'TEXT': 'C-07'}, {'TIME': 51239011, 'TEXT': 'C-08'}, {'TIME': 51239781, 'TEXT': 'C-09'}, {'TIME': 51240545, 'TEXT': 'C-10'}, {'TIME': 51241312, 'TEXT': 'C-01'}, {'TIME': 51242073, 'TEXT': 'C-02'}, {'TIME': 51242832, 'TEXT': 'i-25'}, {'TIME': 51243605, 'TEXT': 'i-30'}, {'TIME': 51244376, 'TEXT': 'C-05'}, {'TIME': 51245127, 'TEXT': 'C-06'}, {'TIME': 51245895, 'TEXT': 'C-07'}, {'TIME': 51246661, 'TEXT': 'C-08'}, {'TIME': 51247417, 'TEXT': 'C-09'}, {'TIME': 51248177, 'TEXT': 'C-10'}, {'TIME': 51248937, 'TEXT': 'C-01'}, {'TIME': 51249692, 'TEXT': 'C-02'}, {'TIME': 51250453, 'TEXT': 'i-25'}, {'TIME': 51251219, 'TEXT': 'i-30'}, {'TIME': 51251981, 'TEXT': 'C-05'}, {'TIME': 51252741, 'TEXT': 'C-06'}, {'TIME': 51253510, 'TEXT': 'C-07'}, {'TIME': 51254265, 'TEXT': 'C-08'}, {'TIME': 51255018, 'TEXT': 'C-09'}, {'TIME': 51255791, 'TEXT': 'C-10'}, {'TIME': 51256549, 'TEXT': 'C-01'}, {'TIME': 51257308, 'TEXT': 'C-02'}, {'TIME': 51258063, 'TEXT': 'i-25'}, {'TIME': 51258827, 'TEXT': 'i-30'}, {'TIME': 51259588, 'TEXT': 'C-05'}, {'TIME': 51260353, 'TEXT': 'C-06'}, {'TIME': 51261109, 'TEXT': 'C-07'}, {'TIME': 51261884, 'TEXT': 'C-08'}, {'TIME': 51262630, 'TEXT': 'C-09'}, {'TIME': 51263395, 'TEXT': 'C-10'}, {'TIME': 51264146, 'TEXT': 'C-01'}, {'TIME': 51264912, 'TEXT': 'C-02'}, {'TIME': 51265656, 'TEXT': 'i-25'}, {'TIME': 51266417, 'TEXT': 'i-30'}, {'TIME': 51267186, 'TEXT': 'C-05'}, {'TIME': 51267944, 'TEXT': 'C-06'}, {'TIME': 51268710, 'TEXT': 'C-07'}, {'TIME': 51269468, 'TEXT': 'C-08'}, {'TIME': 51270226, 'TEXT': 'C-09'}, {'TIME': 51270984, 'TEXT': 'C-10'}, {'TIME': 51271742, 'TEXT': 'C-01'}, {'TIME': 51272509, 'TEXT': 'C-02'}, {'TIME': 51273265, 'TEXT': 'i-25'}, {'TIME': 51274031, 'TEXT': 'i-30'}, {'TIME': 51274784, 'TEXT': 'C-05'}, {'TIME': 51275544, 'TEXT': 'C-06'}, {'TIME': 51276316, 'TEXT': 'C-07'}, {'TIME': 51277068, 'TEXT': 'C-08'}, {'TIME': 51277825, 'TEXT': 'C-09'}, {'TIME': 51278582, 'TEXT': 'C-10'}, {'TIME': 51279350, 'TEXT': 'C-01'}, {'TIME': 51280105, 'TEXT': 'C-02'}, {'TIME': 51280876, 'TEXT': 'i-25'}, {'TIME': 51281633, 'TEXT': 'i-30'}, {'TIME': 51282406, 'TEXT': 'C-05'}, {'TIME': 51283164, 'TEXT': 'C-06'}, {'TIME': 51283925, 'TEXT': 'C-07'}, {'TIME': 51284687, 'TEXT': 'C-08'}, {'TIME': 51285447, 'TEXT': 'C-09'}, {'TIME': 51286212, 'TEXT': 'C-10'}, {'TIME': 51286973, 'TEXT': 'C-01'}, {'TIME': 51287739, 'TEXT': 'C-02'}]}
    dictMasterMobInfo = {'C-01': ['TapeName_C-01', [0, 128, 128], 'Iris'], 'C-02': ['TapeName_C-02', [0, 128, 128], 'Iris'], 'C-05': ['TapeName_C-05', [0, 128, 128], 'Iris'], 'C-06': ['TapeName_C-06', [0, 128, 128], 'Iris'], 'C-07': ['TapeName_C-07', [152, 251, 152], 'Iris'], 'C-08': ['TapeName_C-08', [152, 251, 152], 'Magenta'], 'C-09': ['TapeName_C-09', [152, 251, 152], 'Magenta'], 'C-10': ['TapeName_C-10', [152, 251, 152], 'Magenta'], 'i-25': ['TapeName_i-25', [231, 126, 49],'Rose'], 'i-30': ['TapeName_i-30', [255, 182, 193],'Rose'], 'PGM': ['~pdbMHtn', [147, 112, 219],'Green']}    
    result_dir = "../_TallyLogExports/avb/"
    sequence_name = u'TestTallyLog ' + msToHMS(events["start"]) + ' - ' +msToHMS(events["end"])


if not os.path.exists(result_dir):
    os.makedirs(result_dir)


# Logging
logging.basicConfig(filename=os.path.join(result_dir, 'error.log'), level=logging.INFO, format='%(asctime)s,%(msecs)03d %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s')
logger=logging.getLogger(__name__)

logger.info("Started AVB\n")
# logger.info(events)
# logger.info(dictMasterMobInfo)
template_bin_file = os.path.join(os.path.dirname(os.path.dirname(result_dir)), '_templates/_template.avb')
# logger.info(template_bin_file)

# g=open(os.path.join(result_dir, 'test_events' + '.txt'), "w")
# g.write(str(events))
# g.close

# g=open(os.path.join(result_dir, "test_dictMasterMobInfo" + ".txt"), "w")
# g.write(str(dictMasterMobInfo))
# g.close


frames = 0
tc = ""

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

def binsmith(file_path, template_path=None):
    command_line_args = [file_path]
    # logger.info(msg=f'binsmith: {file_path} - template: {template_path}' )
    if template_path:
        command_line_args.extend(['-t', template_path])

    try:
        subprocess.run([sys.executable, 'utils/binsmith.py'] + command_line_args, check=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Binsmith Error: {e}")

# Example usage:
# binsmith('my_new_bin.avb', 'path/to/template.avb')
# or
# binsmith('my_new_bin.avb')



def create_mastermob(f, edit_rate, mob_length = sequence_length, tape_mob_name=u"MasterMobTapeMobName", \
                     file_mob_name = u"MasterMobFileMobName", clip_mob_name = u"Mob1 name: Clip1", clip_name = u"clip 1 name", clip_color=[128,128,128]):
    tape_mob =  f.create.Composition(mob_type="SourceMob")
    tape_mob.descriptor = f.create.TapeDescriptor()
    tape_mob.descriptor.mob_kind = 2 # won't work without

    tape_mob.name = tape_mob_name
    tape_mob.length = mob_length
    tape_mob.edit_rate = edit_rate # defaults to 25

    track = f.create.Track()
    track.index = 1
    track.component = f.create.Timecode(edit_rate, media_kind='timecode')
    track.component.length = mob_length
    track.component.fps = edit_rate # otherwise defaults to 25 fps
    tape_mob.tracks.append(track)

    #V1
    track = f.create.Track()
    track.index = 1
    track.component = f.create.SourceClip(edit_rate, media_kind='picture')
    # What is the component?
    track.component.length = sequence_length
    tape_mob.tracks.append(track)

    file_mob = f.create.Composition(mob_type="SourceMob")
    file_mob.descriptor = f.create.CDCIDescriptor()
    file_mob.descriptor.length = sequence_length
    file_mob.descriptor.mob_kind = 1 # won't work without
    file_mob.length = sequence_length
    file_mob.name = file_mob_name
    file_mob.descriptor.edit_rate = edit_rate # defaults to 25
    file_mob.edit_rate = edit_rate # defaults to 25

    #V1
    track = f.create.Track()
    track.index = 1
    track.component = f.create.SourceClip(edit_rate, media_kind='picture')
    track.component.length = sequence_length
    track.component.track_id = 1
    # Sets the start time
    track.component.start_time = sequence_start
    track.component.mob_id = tape_mob.mob_id
    file_mob.tracks.append(track)

    mob = f.create.Composition(mob_type="MasterMob")
    mob.name = clip_mob_name
    mob.edit_rate = edit_rate # otherwise defaults to 25
    # Add master mob colors here
    mob.attributes = f.create.Attributes()
    mob.attributes['_COLOR_R'] = convert_8_16bit(clip_color[0])
    mob.attributes['_COLOR_G'] = convert_8_16bit(clip_color[1])
    mob.attributes['_COLOR_B'] = convert_8_16bit(clip_color[2])

    #V1
    track = f.create.Track()
    track.index = 1
    clip = f.create.SourceClip(edit_rate, media_kind='picture')
    # this length needed to set out (but seems to make duration double - 25/50 fps related?)
    clip.length = sequence_length
    clip.mob_id = file_mob.mob_id
    clip.track_id = 1
    clip.name = clip_name
    track.component = clip
    # this length needed
    mob.length = sequence_length
    mob.tracks.append(track)

    # Add the mobs to file content
    f.content.add_mob(mob)
    f.content.add_mob(file_mob)
    f.content.add_mob(tape_mob)
    return mob

def writeTallyAVB():
    # Set Bin file path and name
    result_file = os.path.join(result_dir, sequence_name + '.avb')
    # Duplicate template path
    if os.path.exists(template_bin_file):
        # logger.info(f'binsmith: {result_file} - {template_bin_file}')
        binsmith(result_file, template_bin_file)
        # logger.info('bin duplicated?')
    else:
        pass
        logger.info(f'{template_bin_file} does not exist')
    with avb.open() as f:

        #first create master mobs for all unique clips
        for key in dictMasterMobInfo.keys():
            tape_name = dictMasterMobInfo[key][0] # Tape name from source
            # tape_name = dictMasterMobInfo['PGM'][0] # Tape name from PGM
            source_name = key 
            if tape_name == "":
                tape_name=u"unknown"

            dictMobID[key] = create_mastermob(f, edit_rate, mob_length = sequence_length, tape_mob_name = tape_name, file_mob_name = tape_name, clip_mob_name = source_name , clip_name = source_name, clip_color = dictMasterMobInfo[key][1])
        # Composition Mob created first
        comp_mob = f.create.Composition(mob_type="CompositionMob")
        comp_mob.name = sequence_name   
        comp_mob.edit_rate = edit_rate # otherwise defaults to 25

        # Add color to sequence (only Avid seems to read this)
        comp_mob.attributes = f.create.Attributes()
        comp_mob.attributes['_COLOR_R'] = 60000
        comp_mob.attributes['_COLOR_G'] = 24000
        comp_mob.attributes['_COLOR_B'] = 12000

        # TIMECODE track ---
        track = f.create.Track()
        track.index = 1
        track.component = f.create.Timecode(edit_rate, media_kind='timecode')

        # Sequence start timecode set here
        track.component.start = sequence_start
        track.component.fps = edit_rate # otherwise defaults to 25
        # set this length???
        track.component.length = sequence_length   
        comp_mob.tracks.append(track)

        # V1 Track ----
        track = f.create.Track()
        track.index = 1
        track.attributes = f.create.Attributes()
        track.attributes['_COMMENT'] = 'SRC'
        sequence = f.create.Sequence(edit_rate, media_kind='picture')

        # Add clips to comp_mob
        clip_position = 0
        for i, event in enumerate(events["clips"]):
            clip_start = event['TIME']
            clip_start = msToFrames(clip_start, edit_rate)
            clip_name = event['TEXT']

            if i < len(events["clips"]) -1:
                clip_end = events["clips"][i+1]['TIME']
                clip_end = msToFrames(clip_end, edit_rate)
            else:
                clip_end = sequence_end
            clip_length = clip_end - clip_start

            mm = (dictMobID[event['TEXT']])

            # Create a SourceClip
            clip = f.create.SourceClip(edit_rate, media_kind='picture')
            clip.track_id = 1
            clip.mob_id = mm.mob_id
            # this doesn't translate correctly
            clip.name = clip_name

            # This is the start point of the master mob in the source clip?
            clip.start_time = clip_position
            # This is the length of the source clip - filled with the master mob
            clip.length = clip_length
            # this is that clip appended to the sequence
            sequence.components.append(clip)
            clip_position += clip_length

        # We do need this filler for some reason.
        sequence.components.append(f.create.Filler(edit_rate, media_kind='picture'))
        track.component = sequence

        comp_mob.tracks.append(track)
        comp_mob.length = sequence.length

        # V2 - TRACK ----
        track = f.create.Track()
        track.index = 2
        track.attributes = f.create.Attributes()
        track.attributes['_COMMENT'] = 'PGM'

        sequence = f.create.Sequence(edit_rate, media_kind='picture')

        clip_position = 0
        for i, event in enumerate(events["clips"]):

            clip_start = event['TIME']
            clip_start = msToFrames(clip_start, edit_rate)
            clip_name = event['TEXT']

            if i < len(events["clips"]) -1:
                clip_end = events["clips"][i+1]['TIME']
                clip_end = msToFrames(clip_end, edit_rate)
            else:
                clip_end = sequence_end
            clip_length = clip_end - clip_start

            mm = (dictMobID['PGM'])

            # Create a SourceClip
            clip = f.create.SourceClip(edit_rate, media_kind='picture')
            clip.track_id = 1
            clip.mob_id = mm.mob_id
            # this doesn't translate correctly
            clip.name = clip_name

            # This is the start point of the master mob in the source clip?
            clip.start_time = clip_position
            # This is the length of the source clip - filled with the master mob
            clip.length = clip_length
            # this is that clip appended to the sequence
            sequence.components.append(clip)
            
            clip_position += clip_length
        
        # We do need this filler for some reason.
        sequence.components.append(f.create.Filler(edit_rate, media_kind='picture'))
        track.component = sequence 
        comp_mob.tracks.append(track)

        comp_mob.length = sequence.length


        # ignoring audio for now - master mob needs audio for PGM

        # # A1
        # track = f.create.Track()
        # track.index = 1
        # sequence = f.create.Sequence(edit_rate, media_kind='sound')
        # clip = f.create.SourceClip(edit_rate, media_kind='sound')
        # mm = (dictMobID['PGM'])
        # logger.info(mm)
        # clip.mob_id = mm.mob_id
        # clip.start_time = 0
        # clip.length = comp_mob.length
        # sequence.components.append(clip)
        # track.component = sequence
        # comp_mob.tracks.append(track)

        # A2
        # track = f.create.Track()
        # track.index = 2
        # sequence = f.create.Sequence(edit_rate, media_kind='sound')
        # fill = f.create.Filler(edit_rate, media_kind='sound')
        # fill.length = comp_mob.length
        # sequence.components.append(fill)
        # track.component = sequence
        # comp_mob.tracks.append(track)

        f.content.add_mob(comp_mob)

        f.write(result_file)

    # binlock.main("LockText", result_file)

# TODO move this so it is a __main__ function
try:
    writeTallyAVB()
    logger.info('AVB success')
except Exception as e:
    logger.error(msg=repr(e))

