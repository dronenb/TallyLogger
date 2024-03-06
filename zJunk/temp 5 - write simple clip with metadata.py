import os, sys, subprocess, json, logging
import avb
import avb.utils
from utils.converters import msToHMS, convert_8_16bit
from datetime import datetime
from aaf2.misc import TaggedValueHelper

current_datetime = datetime.now().strftime("%Y-%m-%d %H-%M-%S")

edit_rate = 50
events = {'start': 51213498, 'end': 51288501, 'clips': [{'TIME': 51213902, 'TEXT': 'C-05'}, {'TIME': 51214656, 'TEXT': 'C-06'}, {'TIME': 51215424, 'TEXT': 'C-07'}, {'TIME': 51216199, 'TEXT': 'C-08'}, {'TIME': 51216947, 'TEXT': 'C-09'}, {'TIME': 51217714, 'TEXT': 'C-10'}, {'TIME': 51218483, 'TEXT': 'C-01'}, {'TIME': 51219240, 'TEXT': 'C-02'}, {'TIME': 51219999, 'TEXT': 'i-25'}, {'TIME': 51220771, 'TEXT': 'i-30'}, {'TIME': 51221531, 'TEXT': 'C-05'}, {'TIME': 51222298, 'TEXT': 'C-06'}, {'TIME': 51223054, 'TEXT': 'C-07'}, {'TIME': 51223822, 'TEXT': 'C-08'}, {'TIME': 51224570, 'TEXT': 'C-09'}, {'TIME': 51225334, 'TEXT': 'C-10'}, {'TIME': 51226096, 'TEXT': 'C-01'}, {'TIME': 51226853, 'TEXT': 'C-02'}, {'TIME': 51227623, 'TEXT': 'i-25'}, {'TIME': 51229137, 'TEXT': 'C-05'}, {'TIME': 51229902, 'TEXT': 'C-06'}, {'TIME': 51230655, 'TEXT': 'C-07'}, {'TIME': 51231424, 'TEXT': 'C-08'}, {'TIME': 51232180, 'TEXT': 'C-09'}, {'TIME': 51232931, 'TEXT': 'C-10'}, {'TIME': 51233705, 'TEXT': 'C-01'}, {'TIME': 51234455, 'TEXT': 'C-02'}, {'TIME': 51235213, 'TEXT': 'i-25'}, {'TIME': 51235973, 'TEXT': 'i-30'}, {'TIME': 51236728, 'TEXT': 'C-05'}, {'TIME': 51237495, 'TEXT': 'C-06'}, {'TIME': 51238257, 'TEXT': 'C-07'}, {'TIME': 51239011, 'TEXT': 'C-08'}, {'TIME': 51239781, 'TEXT': 'C-09'}, {'TIME': 51240545, 'TEXT': 'C-10'}, {'TIME': 51241312, 'TEXT': 'C-01'}, {'TIME': 51242073, 'TEXT': 'C-02'}, {'TIME': 51242832, 'TEXT': 'i-25'}, {'TIME': 51243605, 'TEXT': 'i-30'}, {'TIME': 51244376, 'TEXT': 'C-05'}, {'TIME': 51245127, 'TEXT': 'C-06'}, {'TIME': 51245895, 'TEXT': 'C-07'}, {'TIME': 51246661, 'TEXT': 'C-08'}, {'TIME': 51247417, 'TEXT': 'C-09'}, {'TIME': 51248177, 'TEXT': 'C-10'}, {'TIME': 51248937, 'TEXT': 'C-01'}, {'TIME': 51249692, 'TEXT': 'C-02'}, {'TIME': 51250453, 'TEXT': 'i-25'}, {'TIME': 51251219, 'TEXT': 'i-30'}, {'TIME': 51251981, 'TEXT': 'C-05'}, {'TIME': 51252741, 'TEXT': 'C-06'}, {'TIME': 51253510, 'TEXT': 'C-07'}, {'TIME': 51254265, 'TEXT': 'C-08'}, {'TIME': 51255018, 'TEXT': 'C-09'}, {'TIME': 51255791, 'TEXT': 'C-10'}, {'TIME': 51256549, 'TEXT': 'C-01'}, {'TIME': 51257308, 'TEXT': 'C-02'}, {'TIME': 51258063, 'TEXT': 'i-25'}, {'TIME': 51258827, 'TEXT': 'i-30'}, {'TIME': 51259588, 'TEXT': 'C-05'}, {'TIME': 51260353, 'TEXT': 'C-06'}, {'TIME': 51261109, 'TEXT': 'C-07'}, {'TIME': 51261884, 'TEXT': 'C-08'}, {'TIME': 51262630, 'TEXT': 'C-09'}, {'TIME': 51263395, 'TEXT': 'C-10'}, {'TIME': 51264146, 'TEXT': 'C-01'}, {'TIME': 51264912, 'TEXT': 'C-02'}, {'TIME': 51265656, 'TEXT': 'i-25'}, {'TIME': 51266417, 'TEXT': 'i-30'}, {'TIME': 51267186, 'TEXT': 'C-05'}, {'TIME': 51267944, 'TEXT': 'C-06'}, {'TIME': 51268710, 'TEXT': 'C-07'}, {'TIME': 51269468, 'TEXT': 'C-08'}, {'TIME': 51270226, 'TEXT': 'C-09'}, {'TIME': 51270984, 'TEXT': 'C-10'}, {'TIME': 51271742, 'TEXT': 'C-01'}, {'TIME': 51272509, 'TEXT': 'C-02'}, {'TIME': 51273265, 'TEXT': 'i-25'}, {'TIME': 51274031, 'TEXT': 'i-30'}, {'TIME': 51274784, 'TEXT': 'C-05'}, {'TIME': 51275544, 'TEXT': 'C-06'}, {'TIME': 51276316, 'TEXT': 'C-07'}, {'TIME': 51277068, 'TEXT': 'C-08'}, {'TIME': 51277825, 'TEXT': 'C-09'}, {'TIME': 51278582, 'TEXT': 'C-10'}, {'TIME': 51279350, 'TEXT': 'C-01'}, {'TIME': 51280105, 'TEXT': 'C-02'}, {'TIME': 51280876, 'TEXT': 'i-25'}, {'TIME': 51281633, 'TEXT': 'i-30'}, {'TIME': 51282406, 'TEXT': 'C-05'}, {'TIME': 51283164, 'TEXT': 'C-06'}, {'TIME': 51283925, 'TEXT': 'C-07'}, {'TIME': 51284687, 'TEXT': 'C-08'}, {'TIME': 51285447, 'TEXT': 'C-09'}, {'TIME': 51286212, 'TEXT': 'C-10'}, {'TIME': 51286973, 'TEXT': 'C-01'}, {'TIME': 51287739, 'TEXT': 'C-02'}]}
dictMasterMobInfo = {'C-01': ['TapeName_C-01', [0, 128, 128]], 'C-02': ['TapeName_C-02', [0, 128, 128]], 'C-05': ['TapeName_C-05', [0, 128, 128]], 'C-06': ['TapeName_C-06', [0, 128, 128]], 'C-07': ['TapeName_C-07', [152, 251, 152]], 'C-08': ['TapeName_C-08', [152, 251, 152]], 'C-09': ['TapeName_C-09', [152, 251, 152]], 'C-10': ['TapeName_C-10', [152, 251, 152]], 'i-25': ['TapeName_i-25', [231, 126, 49]], 'i-30': ['TapeName_i-30', [255, 182, 193]], 'PGM': ['TapeName_PGM', [147, 112, 219]]}
result_dir = "/Users/trevoraylward/Documents/Avid Projects/NBC Paris 24/results/"
sequence_name = u'TestTallyLog ' + current_datetime
sequence_length = 1*60*edit_rate
sequence_start = 10*60*60*edit_rate
sequence_end = sequence_start+sequence_length
dictMobID = []
result_file = os.path.join(result_dir, sequence_name + '.avb')



def create_mastermob(f, edit_rate, mob_length = sequence_length, tape_mob_name=u"MasterMobTapeMobName", \
                     file_mob_name = u"MasterMobFileMobName", clip_mob_name = u"Mob1 name: Clip1", clip_name = u"clip 1 name", clip_color=[128,128,128], num_audio_tracks = 4):
    tape_mob = f.create.Composition(mob_type="SourceMob")
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
    
    # Add V1 to Tape Mob
    track = f.create.Track()
    track.index = 1
    track.component = f.create.SourceClip(edit_rate, media_kind='picture')
    track.component.length = mob_length
    tape_mob.tracks.append(track)

    # Add audio tracks to Tape Mob
    if num_audio_tracks > 0:
        for j in range(1,num_audio_tracks+1):
        
            track = f.create.Track()
            track.index = j
            track.component = f.create.SourceClip(edit_rate, media_kind='sound')
            track.component.length = mob_length
            tape_mob.tracks.append(track)

    file_mob = f.create.Composition(mob_type="SourceMob")
    file_mob.descriptor = f.create.CDCIDescriptor()
    file_mob.descriptor.length = sequence_length
    file_mob.descriptor.mob_kind = 1 # won't work without
    file_mob.length = sequence_length
    file_mob.name = file_mob_name
    file_mob.descriptor.edit_rate = edit_rate # defaults to 25
    file_mob.edit_rate = edit_rate # defaults to 25

    # Add V1 to SourceMob
    track = f.create.Track()
    track.index = 1
    track.component = f.create.SourceClip(edit_rate, media_kind='picture')
    track.component.length = sequence_length
    track.component.track_id = 1

    # Sets the start time
    track.component.start_time = sequence_start
    track.component.mob_id = tape_mob.mob_id
    file_mob.tracks.append(track)

    for i in range (1, num_audio_tracks+1):
        # Audio
        track = f.create.Track()
        track.index = i
        track.component = f.create.SourceClip(edit_rate, media_kind='sound')
        track.component.length = sequence_length
        track.component.track_id = i+1

        # Sets the start time
        # track.component.start_time = sequence_start
        # track.component.mob_id = tape_mob.mob_id
        file_mob.tracks.append(track)

    # Master Mob
    mob = f.create.Composition(mob_type="MasterMob")
    mob.name = clip_mob_name
    mob.edit_rate = edit_rate # otherwise defaults to 25
   
    # Add master mob colors here
    mob.attributes = f.create.Attributes()

    # Add color attributes
    mob.attributes['_COLOR_R'] = convert_8_16bit(clip_color[0])
    mob.attributes['_COLOR_G'] = convert_8_16bit(clip_color[1])
    mob.attributes['_COLOR_B'] = convert_8_16bit(clip_color[2])

    # Add channel group list and audio sound field group list attributes
    mob.attributes['_CHANNEL_GROUP_LIST'] = 'ST:A1A2,ST:A5A6,71:A9A11A10A13A14A15A16A12'

    # mob.attributes['_ASOUND_FIELD_GROUP_LIST'] = f.create.Attributes()
    # mob.attributes['_ASOUND_FIELD_GROUP_LIST'].attributes[f'{('MCA_SGL_SIZE', 3)}'] = f.create.Attributes()
    # mob.attributes['_ASOUND_FIELD_GROUP_LIST'].attributes[f'{('MCA_SGL_SIZE', 3)}'].attributes = f'{[('MCA_SG_FORMAT', 2),('MCA_SG_TRACKS', '1,2'),('MCA_SG_RFC5646_SPOKEN_LANGUAGE', ''), ('MCA_SG_AUDIO_CONTENT_KIND', bytearray(b'\x00\x00\x00')), ('MCA_SG_AUDIO_ELEMENT_KIND', bytearray(b'\x00\x00\x00')),('MCA_SG_TITLE', bytearray(b'\x00\x00\x00')), ('MCA_SG_TITLE_VERSION', bytearray(b'\x00\x00\x00'))]}'
	            


    # Add V1 to Master Mob
    track = f.create.Track()
    track.index = 1
    clip = f.create.SourceClip(edit_rate, media_kind='picture')
    # this length needed to set out (but seems to make duration double - 25/50 fps related?)
    clip.length = sequence_length
    clip.mob_id = file_mob.mob_id
    clip.track_id = 1
    clip.name = clip_name
    track.component = clip
    mob.tracks.append(track)

    # Add audio tracks to Master Mob
    for i in range (1, num_audio_tracks+1):
        track = f.create.Track()
        track.index = i
        clip = f.create.SourceClip(edit_rate, media_kind='sound')
        # this length needed to set out (but seems to make duration double - 25/50 fps related?)
        clip.length = sequence_length
        clip.mob_id = file_mob.mob_id
        clip.track_id = 1
        clip.name = clip_name
        track.component = clip
        mob.tracks.append(track)
    
    # this length needed
    mob.length = sequence_length

 
    f.content.add_mob(mob)
    f.content.add_mob(file_mob)
    f.content.add_mob(tape_mob)
    return mob


with avb.open() as f:

    #first create master mobs for all unique clips
    for key in dictMasterMobInfo.keys():
        tape_name = dictMasterMobInfo[key][0] # Tape name from source
        # tape_name = dictMasterMobInfo['PGM'][0] # Tape name from PGM
        source_name = key 
        if tape_name == "":
            tape_name=u"unknown"
        # Create random master mobs
        mm = create_mastermob(f, edit_rate, mob_length = sequence_length, tape_mob_name = tape_name, file_mob_name = tape_name, clip_mob_name = source_name , clip_name = source_name, clip_color = dictMasterMobInfo[key][1], num_audio_tracks=16)


    f.write(result_file)