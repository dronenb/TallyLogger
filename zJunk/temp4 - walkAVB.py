from __future__ import (
    unicode_literals,
    absolute_import,
    print_function,
    division,
    )

import sys, os, avb
from pprint import pprint

# FILE_PATH = "/Users/trevoraylward/Documents/Avid Projects/NBC Paris 24/+ Other bits/NEW.avb"
FILE_PATH = "/Users/trevoraylward/Documents/Avid Projects/NBC Paris 24/+ Other bits/1 Source Clip NBC modified.avb"

OUT_PATH = "/Users/trevoraylward/Documents/Avid Projects/NBC Paris 24/+ Other bits/16 modified.txt"

query_list = ['mob_type', 'name', 'type', 'usage', 'media_kind', 'mob_id', 'dependant_mobs', 'slots', 'tracks']
mob_holders=['mobs']

def printMobs(f):
    print('\n'*2)
    print('-'*70)
    print("MOBS LISTING")
    print('\n'*2)
    print('-'*70)
    for mob in f.content.mobs:
        for item in query_list:
            if hasattr(mob,item):
                print(f'Mob {item}: {getattr(mob, item)}')                
                if item == 'tracks':
                    for track in mob.tracks:
                        # Selectors
                        if isinstance(track.component, avb.trackgroups.Selector):
                            print("-------- Selector! --------")
                            print(repr(mob))
                            selector = track.component
                            print(mob.name)
                            for selector_track in selector.tracks:
                                print("selector_track content: {}".format(selector_track))
                if item == 'attributes':
                    for attribute in mob.attributes:
                        print(f'Attribute {mob}: {getattr(mob, attribute)}')                
            else:
                print(f'Mob {item}: {hasattr(mob, item)}')
        print('-'*70)



def pretty_value(value):
    if isinstance(value, bytearray):
        return "bytearray(%d)" % len(value)
        # return ''.join(format(x, '02x') for x in value)
    return value

def avb_dump(obj, space=""):

    propertie_keys = []
    property_data = None
    if isinstance(obj, avb.core.AVBObject):
        print(space, str(obj))
        space += "  "
        property_data = obj.property_data
        for pdef in obj.propertydefs:
            key = pdef.name
            if key not in obj.property_data:
                continue
            propertie_keys.append(key)

    elif isinstance(obj, dict):
        propertie_keys = sorted(obj)
        property_data = obj
    else:
        print(space, obj)
        return

    for key in propertie_keys:
        value = property_data[key]
        if isinstance(value, (avb.core.AVBObject, dict)):
            print("%s%s:" % (space, key))
            avb_dump(value, space + " ")
            # print(value)

        
        elif isinstance(value, list):
            print("%s%s:" % (space, key))
            for item in value:
                avb_dump(item, space + " ")
        else:
            if value is not None:
                print("%s%s:" % (space, key), pretty_value(value))


def dumpVars(f):
    print('-'*70)
    print('File object vars:')
    print('-'*70)

    pprint(vars(f), indent=4)
    print('-'*70)
    print('File content dir:')
    print('-'*70)

    pprint(dir(f.content), indent=4)
    print('-'*70)
    print('-'*70)

def dumpMobs(f):

    print('-'*70)
    print('f.content.mobs -- AVB DUMP')
    print('-'*70)

    for mob in f.content.mobs:
        print(mob)
        print(avb_dump(mob))
        print('-'*70)

    print('-'*70)
    print('f.content.mobs -- printMOBS')
    print('-'*70)

    printMobs(f)

    print('-'*70)

with avb.open(FILE_PATH) as f:

    # dumpMobs(f)
    # dumpVars(f)

    # for mob in f.content.mobs:
    #     print(f.content.mob)

    # print(help(f.content))

    with open(OUT_PATH, 'w') as g:
        orig_stdout = sys.stdout
        sys.stdout = g
        g.write(str(dumpMobs(f)))
        g.close
        sys.stdout = orig_stdout

