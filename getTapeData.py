import sys
import csv

file_name = "/Users/trevoraylward/Documents/GitHub/TallyLogger/TallyTapeName.csv"

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
	'black': [0, 0, 0]}
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
            key = row.get('Source')
            tape_name = row.get('TapeName')
            clip_color_key = row.get('ColorName')
            clip_color = colorsRGB.get(clip_color_key)
            dictTapeNameInfo.update({key: [tape_name, clip_color]})

        csvfile.close()
        return dictTapeNameInfo

getTapeData()    