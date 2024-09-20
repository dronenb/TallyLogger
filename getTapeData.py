import sys
import csv

# CSV storing tally source / tape name / clip color name info that can be updated daily
file_name = "./TallyTapeName.csv"

# colors stored as RGB for simplicity and multiplied when used for AAF 
# these color names are in the google sheet dropcown https://docs.google.com/spreadsheets/d/19bTWGm3IQSVTuSmjjq_Sb0HAf60WVpnEWwxvxRDyl74/edit#gid=0
# so don't change unless changed there
colorsRGB = {
	'violet': [120,28,129],
	'indigo': [64,67,153],
	'blue': [72,139,194],
	'green': [107,178,140],
	'olive': [159,190,87],
	'yellow': [210,179,63],
	'orange': [231,126,49],
	'red': [217,33,32],
	'light_pink': [255, 182, 193],
	'khaki': [240, 230, 140],
	'dark_khaki': [189, 183, 107],
	'plum': [221, 160, 221],
	'medium_purple': [147, 112, 219],
	'purple': [128, 0, 128],
	'medium_slate_blue': [123, 104, 238],
	'pale_green': [152, 251, 152],
	'yellow_green': [154, 205, 50],
	'teal': [0, 128, 128],
	'aquamarine': [127, 255, 212],
	'steel_blue': [70, 130, 180],
	'tan': [210, 180, 140],
	'brown': [165, 42, 42],
	'silver': [192, 192, 192],
	'black': [0, 0, 0]
    }

	# TODO use Tape as a class
	# TODO - add extension so that audio config can come with the tape? (e.g. Front Left etc)
    # Should maybe be a tape per day?? How does EVS / Avid deal with midnight??

class Tape():
	def __init__(self, tally_source, tape_name, clip_color_name):
		""" Create a Tape object. Keyword arguments: tally_source -- the source name for the Tape tape_name -- the tape name for that source clip_color_name -- the color that clip should be in Avid"""
		self.tally_source = tally_source # Should be unique? (i.e. we are in trouble if there are duplicate sources)
		self.tape_name = tape_name 
		self.color_name = clip_color_name
		self.clip_colorRGB = colorsRGB.get(clip_color_name)
	def __iter__(self):
		yield {
			"tally_source": self.tally_source,
			"tape_name": self.tape_name,
			"color_name": self.color_name,
            "clip_colorRGB": self.clip_colorRGB
		}

	def __str__(self):
		return json.dumps(self, ensure_ascii=False, cls=CustomEncoder)

	def __repr__(self):
		return self.__str__()

def getTapeData():
    try:
        file = open (file_name, "r")
        file.close()
    except FileNotFoundError:
        sys.exit(f"Could not read {file_name}")

    with open(file_name, newline='')as csvfile:
        reader = csv.DictReader(csvfile)
        dictTapeNameInfo = {}
        for row in reader:
            tally_source = row.get('Source')
            tape_name = row.get('TapeName')
            clip_color_name = row.get('ColorName')
            tape = Tape(tally_source, tape_name, clip_color_name)
            # dictTapeNameInfo.update({tally_source: [tape_name, clip_colorRGB]})
            # need to refactor so this is an array, list, set, collection? of tape objects
            dictTapeNameInfo.update({tape.tally_source: [tape.tape_name, tape.clip_colorRGB]})
            print({tape.tally_source: [tape.tape_name, tape.clip_colorRGB]})

        csvfile.close()
        return dictTapeNameInfo # should really be a bunch of Tape objects
getTapeData()    