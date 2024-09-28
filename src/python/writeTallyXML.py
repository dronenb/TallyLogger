# version that can actually import into PP
# adding color_pp to dictMasterMobInfo
# need to figure out best way of dealing with timecodes and offsets of files and source clips. 

import sys
import json
import os
import logging
from utils.converters import frames_to_TC, msToFrames, msToHMS
import xml.etree.ElementTree as ET

VIDEO_WIDTH = "1920"
VIDEO_HEIGHT = "1080"
PIXEL_ASPECT_RATIO = "square"
FIELD_DOMINANCE = "none"
COLOR_DEPTH = "24"

def create_sample_characteristics(parent_element, edit_rate):
    samplecharacteristics = ET.SubElement(parent_element, "samplecharacteristics")
    create_rate_element(samplecharacteristics, edit_rate)
    ET.SubElement(samplecharacteristics, "width").text = VIDEO_WIDTH
    ET.SubElement(samplecharacteristics, "height").text = VIDEO_HEIGHT
    ET.SubElement(samplecharacteristics, "anamorphic").text = "FALSE"
    ET.SubElement(samplecharacteristics, "pixelaspectratio").text = PIXEL_ASPECT_RATIO
    ET.SubElement(samplecharacteristics, "fielddominance").text = FIELD_DOMINANCE
    ET.SubElement(samplecharacteristics, "colordepth").text = COLOR_DEPTH
    return samplecharacteristics

def create_file_element(parent, tape_name, sequence_length_frames, sequence_start_frames, edit_rate):
    file_element = ET.SubElement(parent, 'file', id=f"{tape_name}")
    ET.SubElement(file_element, 'name').text = tape_name
    ET.SubElement(file_element, 'pathurl').text = tape_name
    create_rate_element(file_element, edit_rate)
    ET.SubElement(file_element, 'duration').text = str(sequence_length_frames)
    create_timecode_element(file_element, sequence_start_frames, edit_rate, "NDF", tape_name)
    
    # Add media and video elements
    media = ET.SubElement(file_element, "media")
    video = ET.SubElement(media, "video")
    create_sample_characteristics(video, edit_rate)
    
    return file_element


# Check if there is data on stdin
if not sys.stdin.isatty():
    # print("WriteTallyXML: Using data from stdin")
    input_str = sys.stdin.read()
    data = json.loads(input_str)
    # NB data is events {start, end, clips[{TIME, TEXT}]}
    events = data['data']

    dictMasterMobInfo = data['tapeInfo'] # should be unique tape numbers
    # NB tapeInfo is {TEXT: [TapeName, colorRGB], etc}
    # print(dictMasterMobInfo)
    result_dir = json.loads(sys.argv[1]) 
    # print(result_dir)
    edit_rate = json.loads(sys.argv[2])
    # print(edit_rate)

    sequence_name = 'TallyLog ' + msToHMS(events["start"]) + ' - ' +msToHMS(events["end"])
    file_name = result_dir + sequence_name + '.xml'

else:
    print("WriteTallyXML: No data provided on stdin. Using sample data")
    # FOR TESTING - sample data - NB milliseconds
    events = {'start': 51213498, 'end': 51288501, 'clips': [{'TIME': 51213902, 'TEXT': 'C-05'}, {'TIME': 51214656, 'TEXT': 'C-06'}, {'TIME': 51215424, 'TEXT': 'C-07'}, {'TIME': 51216199, 'TEXT': 'C-08'}, {'TIME': 51216947, 'TEXT': 'C-09'}, {'TIME': 51217714, 'TEXT': 'C-10'}, {'TIME': 51218483, 'TEXT': 'C-01'}, {'TIME': 51219240, 'TEXT': 'C-02'}, {'TIME': 51219999, 'TEXT': 'i-25'}, {'TIME': 51220771, 'TEXT': 'i-30'}, {'TIME': 51221531, 'TEXT': 'C-05'}, {'TIME': 51222298, 'TEXT': 'C-06'}, {'TIME': 51223054, 'TEXT': 'C-07'}, {'TIME': 51223822, 'TEXT': 'C-08'}, {'TIME': 51224570, 'TEXT': 'C-09'}, {'TIME': 51225334, 'TEXT': 'C-10'}, {'TIME': 51226096, 'TEXT': 'C-01'}, {'TIME': 51226853, 'TEXT': 'C-02'}, {'TIME': 51227623, 'TEXT': 'i-25'}, {'TIME': 51229137, 'TEXT': 'C-05'}, {'TIME': 51229902, 'TEXT': 'C-06'}, {'TIME': 51230655, 'TEXT': 'C-07'}, {'TIME': 51231424, 'TEXT': 'C-08'}, {'TIME': 51232180, 'TEXT': 'C-09'}, {'TIME': 51232931, 'TEXT': 'C-10'}, {'TIME': 51233705, 'TEXT': 'C-01'}, {'TIME': 51234455, 'TEXT': 'C-02'}, {'TIME': 51235213, 'TEXT': 'i-25'}, {'TIME': 51235973, 'TEXT': 'i-30'}, {'TIME': 51236728, 'TEXT': 'C-05'}, {'TIME': 51237495, 'TEXT': 'C-06'}, {'TIME': 51238257, 'TEXT': 'C-07'}, {'TIME': 51239011, 'TEXT': 'C-08'}, {'TIME': 51239781, 'TEXT': 'C-09'}, {'TIME': 51240545, 'TEXT': 'C-10'}, {'TIME': 51241312, 'TEXT': 'C-01'}, {'TIME': 51242073, 'TEXT': 'C-02'}, {'TIME': 51242832, 'TEXT': 'i-25'}, {'TIME': 51243605, 'TEXT': 'i-30'}, {'TIME': 51244376, 'TEXT': 'C-05'}, {'TIME': 51245127, 'TEXT': 'C-06'}, {'TIME': 51245895, 'TEXT': 'C-07'}, {'TIME': 51246661, 'TEXT': 'C-08'}, {'TIME': 51247417, 'TEXT': 'C-09'}, {'TIME': 51248177, 'TEXT': 'C-10'}, {'TIME': 51248937, 'TEXT': 'C-01'}, {'TIME': 51249692, 'TEXT': 'C-02'}, {'TIME': 51250453, 'TEXT': 'i-25'}, {'TIME': 51251219, 'TEXT': 'i-30'}, {'TIME': 51251981, 'TEXT': 'C-05'}, {'TIME': 51252741, 'TEXT': 'C-06'}, {'TIME': 51253510, 'TEXT': 'C-07'}, {'TIME': 51254265, 'TEXT': 'C-08'}, {'TIME': 51255018, 'TEXT': 'C-09'}, {'TIME': 51255791, 'TEXT': 'C-10'}, {'TIME': 51256549, 'TEXT': 'C-01'}, {'TIME': 51257308, 'TEXT': 'C-02'}, {'TIME': 51258063, 'TEXT': 'i-25'}, {'TIME': 51258827, 'TEXT': 'i-30'}, {'TIME': 51259588, 'TEXT': 'C-05'}, {'TIME': 51260353, 'TEXT': 'C-06'}, {'TIME': 51261109, 'TEXT': 'C-07'}, {'TIME': 51261884, 'TEXT': 'C-08'}, {'TIME': 51262630, 'TEXT': 'C-09'}, {'TIME': 51263395, 'TEXT': 'C-10'}, {'TIME': 51264146, 'TEXT': 'C-01'}, {'TIME': 51264912, 'TEXT': 'C-02'}, {'TIME': 51265656, 'TEXT': 'i-25'}, {'TIME': 51266417, 'TEXT': 'i-30'}, {'TIME': 51267186, 'TEXT': 'C-05'}, {'TIME': 51267944, 'TEXT': 'C-06'}, {'TIME': 51268710, 'TEXT': 'C-07'}, {'TIME': 51269468, 'TEXT': 'C-08'}, {'TIME': 51270226, 'TEXT': 'C-09'}, {'TIME': 51270984, 'TEXT': 'C-10'}, {'TIME': 51271742, 'TEXT': 'C-01'}, {'TIME': 51272509, 'TEXT': 'C-02'}, {'TIME': 51273265, 'TEXT': 'i-25'}, {'TIME': 51274031, 'TEXT': 'i-30'}, {'TIME': 51274784, 'TEXT': 'C-05'}, {'TIME': 51275544, 'TEXT': 'C-06'}, {'TIME': 51276316, 'TEXT': 'C-07'}, {'TIME': 51277068, 'TEXT': 'C-08'}, {'TIME': 51277825, 'TEXT': 'C-09'}, {'TIME': 51278582, 'TEXT': 'C-10'}, {'TIME': 51279350, 'TEXT': 'C-01'}, {'TIME': 51280105, 'TEXT': 'C-02'}, {'TIME': 51280876, 'TEXT': 'i-25'}, {'TIME': 51281633, 'TEXT': 'i-30'}, {'TIME': 51282406, 'TEXT': 'C-05'}, {'TIME': 51283164, 'TEXT': 'C-06'}, {'TIME': 51283925, 'TEXT': 'C-07'}, {'TIME': 51284687, 'TEXT': 'C-08'}, {'TIME': 51285447, 'TEXT': 'C-09'}, {'TIME': 51286212, 'TEXT': 'C-10'}, {'TIME': 51286973, 'TEXT': 'C-01'}, {'TIME': 51287739, 'TEXT': 'C-02'}]}
    dictMasterMobInfo = {'C-01': ['TapeName_C-01', [0, 128, 128], 'Iris'], 'C-02': ['TapeName_C-02', [0, 128, 128], 'Iris'], 'C-05': ['TapeName_C-05', [0, 128, 128], 'Iris'], 'C-06': ['TapeName_C-06', [0, 128, 128], 'Iris'], 'C-07': ['TapeName_C-07', [152, 251, 152], 'Iris'], 'C-08': ['TapeName_C-08', [152, 251, 152], 'Magenta'], 'C-09': ['TapeName_C-09', [152, 251, 152], 'Magenta'], 'C-10': ['TapeName_C-10', [152, 251, 152], 'Magenta'], 'i-25': ['TapeName_i-25', [231, 126, 49],'Rose'], 'i-30': ['TapeName_i-30', [255, 182, 193],'Rose'], 'PGM': ['~pdbMHtn', [147, 112, 219],'Green']}    
    result_dir = "../_TallyLogExports/xml/"
    edit_rate = 50
    sequence_name = 'TestTallyLog ' + msToHMS(events["start"]) + ' - ' +msToHMS(events["end"])
    file_name = result_dir + sequence_name + '.xml'

if not os.path.exists(result_dir):
    os.makedirs(result_dir)

# Logging
logging.basicConfig(filename=os.path.join(result_dir, 'error.log'), level=logging.INFO, format='%(asctime)s,%(msecs)03d %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s')
logger=logging.getLogger(__name__)

logger.info("Started XML")
# logger.info(events)

if 'clips' not in events or not isinstance(events['clips'], list):
    logger.error("Invalid event data: Missing or malformed 'clips' key")
    sys.exit(1)

# Getting sequence start from first event
sequence_start_frames = msToFrames(events["clips"][0]['TIME'], edit_rate)

# The end makes sense as there is not necessarily an 'event' 
sequence_end_frames = msToFrames(events["end"], edit_rate)

sequence_length_frames = sequence_end_frames - sequence_start_frames


def create_rate_element(parent, edit_rate):
    rate = ET.SubElement(parent, "rate")
    ET.SubElement(rate, "timebase").text = str(edit_rate)
    ET.SubElement(rate, "ntsc").text = "FALSE"

def create_timecode_element(parent_element, sequence_start_frames, edit_rate, displayformat="NDF", tape_name=""):
    """
    Creates a timecode XML element and appends it to the parent element.
    
    Args:
        parent_element: The XML element to which the timecode will be added.
        sequence_start_frames: The starting frame of the sequence.
        edit_rate: The frame rate (edit rate) of the sequence.
        tape_name: The name of the reel/tape.

    Returns:
        The timecode element.
    """
    # Create timecode element
    timecode_element = ET.SubElement(parent_element, "timecode")
    
    # Create the rate element and set the edit rate
    timecode_rate = ET.SubElement(timecode_element, "rate")
    ET.SubElement(timecode_rate, "timebase").text = str(edit_rate)
    ET.SubElement(timecode_rate, "ntsc").text = "FALSE"  # NDF not supported currently
    
    # Add the timecode string and frame
    ET.SubElement(timecode_element, "string").text = frames_to_TC(sequence_start_frames, edit_rate)
    ET.SubElement(timecode_element, "frame").text = str(sequence_start_frames)
    
    # Set the display format
    ET.SubElement(timecode_element, "displayformat").text = displayformat 
    
    # Add the reel/tape name
    reel = ET.SubElement(timecode_element, "reel")
    ET.SubElement(reel, "name").text = tape_name

    return timecode_element
 

def generate_premiere_xml(events, sequence_name, edit_rate):

    # Initialize an empty list to hold unique tapeNames (masterclipids)
    unique_tape_names = []

    # Create the root element
    root = ET.Element("xmeml")
    root.set("version", "4")

    # Create sequence element 
    sequence = ET.SubElement(root, "sequence", id="sequence-1")

    # Add sequence metadata
    ET.SubElement(sequence, 'duration').text = str(sequence_length_frames)
    # Add name element
    ET.SubElement(sequence, "name").text = sequence_name

    create_rate_element(sequence, edit_rate)

    # Add media element and its children
    media = ET.SubElement(sequence, "media")
    video = ET.SubElement(media, "video")

    format = ET.SubElement(video, "format")
    create_sample_characteristics(format, edit_rate)
    
    create_timecode_element(sequence, sequence_start_frames, edit_rate, "NDF")
    
    # Add track element
    track1 = ET.SubElement(video, "track", attrib={"MZ.TrackName": "V1 - SRC"})
    track2 = ET.SubElement(video, "track", attrib={"MZ.TrackName": "V2 - PGM"})

    current_frame_placement = 0
    end_frame_placement = 0
    # Iterate through the tally events to create clip items
    for idx, event in enumerate(events['clips']):
        if idx < len(events['clips']) - 1:
        # if idx < 2: # used for just 1 clip for testing
            start_time = msToFrames(event['TIME'], edit_rate)
            end_time = msToFrames(events['clips'][idx + 1]['TIME'], edit_rate)
            duration = end_time - start_time

            source = event['TEXT']
            tape_name, color_rgb, color_pp = dictMasterMobInfo[source]

            # Add a <clipitem> for each tally event
            clipitem = ET.SubElement(track1, 'clipitem', id=f"clipitem-{idx+1}")
            # Check if tape_name is already in the list
            if tape_name in unique_tape_names:
                masterClipIdx = unique_tape_names.index(tape_name)+1
                ET.SubElement(clipitem, 'masterclipid').text = f"masterclip-{masterClipIdx}" # Get index of the tape_name
                ET.SubElement(clipitem, 'file', id= f"{tape_name}")

            else:
                # If not, add it to the list and create file object for this clip item
                unique_tape_names.append(tape_name)
                masterClipIdx = unique_tape_names.index(tape_name)+1
                ET.SubElement(clipitem, 'masterclipid').text = f"masterclip-{masterClipIdx}" # Get index of the tape_name
                create_file_element(clipitem, tape_name, sequence_length_frames, sequence_start_frames, edit_rate)
                
            ET.SubElement(clipitem, 'name').text = f"{tape_name}"
            # In / Out are source position in frames from start of clip
            # ET.SubElement(clipitem, 'in').text = str(0)
            # ET.SubElement(clipitem, 'out').text = str(duration)
            clip_start_frames = start_time - sequence_start_frames
            ET.SubElement(clipitem, 'in').text = str(clip_start_frames)
            ET.SubElement(clipitem, 'out').text = str(clip_start_frames + duration)

            # Start / End are timeline position in frames from start of timeline
            ET.SubElement(clipitem, 'start').text = str(current_frame_placement)
            end_frame_placement = current_frame_placement + duration
            ET.SubElement(clipitem, 'end').text = str(end_frame_placement)
            ET.SubElement(clipitem, 'duration').text = str(sequence_length_frames)
            current_frame_placement = end_frame_placement
            ET.SubElement(ET.SubElement(clipitem, 'labels'), 'label2').text = color_pp

    current_frame_placement = 0
    end_frame_placement = 0

    # Iterate through the tally events to create clip items as PGM on V2
    for idx, event in enumerate(events['clips']):
        if idx < len(events['clips']) - 1:
        # if idx < 2: # used for just 1 clip for testing
            start_time = msToFrames(event['TIME'], edit_rate)
            end_time = msToFrames(events['clips'][idx + 1]['TIME'], edit_rate)
            duration = end_time - start_time

            source = event['TEXT']
            tape_name = dictMasterMobInfo['PGM'][0] # Tape name from PGM
            color_rgb = dictMasterMobInfo[source][1] # Color RGB from Source - to check
            color_pp = dictMasterMobInfo[source][2]


            # Add a <clipitem> for each tally event
            clipitem = ET.SubElement(track2, 'clipitem', id=f"clipitem-{idx+1}")
            # Check if tape_name is already in the list
            if tape_name in unique_tape_names:
                masterClipIdx = unique_tape_names.index(tape_name)+1
                ET.SubElement(clipitem, 'masterclipid').text = f"masterclip-{masterClipIdx}" # Get index of the tape_name
                ET.SubElement(clipitem, 'file', id= f"{tape_name}")

            else:
                # If not, add it to the list and create file object for this clip item
                unique_tape_names.append(tape_name)
                masterClipIdx = unique_tape_names.index(tape_name)+1
                ET.SubElement(clipitem, 'masterclipid').text = f"masterclip-{masterClipIdx}" # Get index of the tape_name
                create_file_element(clipitem, tape_name, sequence_length_frames, sequence_start_frames, edit_rate)
                
            ET.SubElement(clipitem, 'name').text = f"PGM- {source}" #TODO check if we want Source here
            # In / Out are source position in frames from start of clip
            # ET.SubElement(clipitem, 'in').text = str(0)
            # ET.SubElement(clipitem, 'out').text = str(duration)
            clip_start_frames = start_time - sequence_start_frames
            ET.SubElement(clipitem, 'in').text = str(clip_start_frames)
            ET.SubElement(clipitem, 'out').text = str(clip_start_frames + duration)

            # Start / End are timeline position in frames from start of timeline
            ET.SubElement(clipitem, 'start').text = str(current_frame_placement)
            current_frame_placement = current_frame_placement + duration
            ET.SubElement(clipitem, 'end').text = str(current_frame_placement)
            ET.SubElement(clipitem, 'duration').text = str(sequence_length_frames)
            ET.SubElement(ET.SubElement(clipitem, 'labels'), 'label2').text = color_pp


    # return xmeml
    # Create an ElementTree object from the root element
    tree = ET.ElementTree(root)
    
    # Indent so it's pretty to print
    ET.indent(tree, space="\t", level=0)

    # Display for debugging            
    # ET.dump(elem=root)

    return tree

def map_color_to_label(rgb):
    color_mapping = {
        (152, 251, 152): 'Mint',
        (0, 128, 128): 'Caribbean',
        (120,28,129): 'Violet',
        (64,67,153): 'Cerulean',
        (72,139,194): 'Blue',
        (107,178,140): 'Green',
        (159,190,87): 'Brown',
        (210,179,63): 'Yellow',
        (231,126,49): 'Mango',
        (217,33,32): 'Rose',
        (255, 182, 193): 'Lavender',
        (240, 230, 140): 'Teal',
        (189, 183, 107): 'Teal',
        (221, 160, 221): 'Violet',
        (147, 112, 219): 'Magenta',
        (128, 0, 128): 'Purple',
        (123, 104, 238): 'Iris',
        (152, 251, 152): 'Forest',
        (154, 205, 50): 'Yellow',
        (0, 128, 128): 'Teal',
        (127, 255, 212): 'Caribbean',
        (70, 130, 180): 'Cerulean',
        (210, 180, 140): 'Tan',
        (165, 42, 42): 'Brown',
        (192, 192, 192): 'Iris',
        (0, 0, 0): 'Magenta'
        # Add more mappings
    }
    return color_mapping.get(tuple(rgb), 'Iris')  # Default to 'Iris' if no match

# # Example usage
xml_output = generate_premiere_xml(events, sequence_name, edit_rate)
# print("should be exporting a file")
# Write the tree to an XML file
xml_output.write(file_name, encoding="utf-8", xml_declaration=True)

logger.info("XML success")

