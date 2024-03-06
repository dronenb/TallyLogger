import aaf2, os, sys, avb

class random_class():
    def __init__(self):
        pass

    def iterate(self):
        for item in dir(self):
            if not item.startswith('__'):
                print (getattr(self, item))

    # def import_empty_essence(self, path, edit_rate, tape=None, length=None, offline=True):
    #     """
    #     Import video essence from raw DNxHD/DNxHR stream
    #     """

    #     # create sourceMob and essencedata
    #     source_mob = self.root.create.SourceMob("%s.PHYS" % self.name)
    #     self.root.content.mobs.append(source_mob)

    #     # import the essencedata
    #     source_slot = source_mob.import_dnxhd_essence(path, edit_rate, tape, length, offline)

    #     # create slot and clip that references source_mob slot
    #     slot = self.create_timeline_slot(edit_rate=edit_rate)
    #     slot.segment = source_mob.create_source_clip(source_slot.slot_id, media_kind='picture')

    #     # set clip length
    #     slot.segment.length = source_slot.segment.length
    #     return slot

# instance = random_class()

# random_class.iterate(instance)

# AAF variables
aaf_dir = os.path.expanduser("~/Documents/tests/")
aaf_file = "test.aaf"
aaf_file_name = os.path.join(aaf_dir,aaf_file)
# Create directory if it doesn't already exist:
os.makedirs(os.path.dirname(aaf_file_name), exist_ok=True)

# AVB variables
avb_dir = os.path.expanduser("~/Documents/tests/")
avb_file = "test.avb"
avb_file_name = os.path.join(avb_dir,avb_file)
# Create directory if it doesn't already exist:
os.makedirs(os.path.dirname(avb_file_name), exist_ok=True)


# Test of above TODO - tidy up by removing
# f = open(path, "w")
# f.write("Woops! I have deleted the content!")
# f.close()
# sys.exit()

# AAF file is written to through function
with aaf2.open(aaf_file_name, "w") as f:

    mob = f.create.MasterMob("test master mob")

     # add the mob to the file
    f.content.mobs.append(mob)

    # lets also create a tape so we can add timecode (optional)
    tape_mob = f.create.SourceMob()
    f.content.mobs.append(tape_mob)


    timecode_rate = edit_rate = 50
    start_time = timecode_rate * 60 * 60 # 1 hour
    tape_name = "Demo Tape"

    # add tape slots to tape mob
    tape_mob.create_tape_slots(tape_name, edit_rate, timecode_rate, media_kind='picture')

    # create sourceclip that references timecode
    tape_clip = tape_mob.create_source_clip(1, start_time)

    # random_class.iterate(mob)
    # print(mob.allkeys())
    file_path = "/Users/trevoraylward/Library/CloudStorage/GoogleDrive-tpa5364@gmail.com/My Drive/SAMPLE FOOTAGE/MIXED FORMATS/50fps sample.dnxhd"
    mob.import_dnxhd_essence(path = file_path, edit_rate=edit_rate, tape = tape_clip, offline=True)

    # TODO attempt at creating a subclip
    subclip_mob = f.create.CompositionMob()
    f.content.mobs.append(subclip_mob)
    subclip_mob.name = "subclip"

    # Add color to SUBCLIP (only Avid seems to read this)
    attrib_list = subclip_mob['MobAttributeList']
    attrib_list.append(f.create.TaggedValue("_COLOR_R", 63200))
    attrib_list.append(f.create.TaggedValue("_COLOR_G", 16000))
    attrib_list.append(f.create.TaggedValue("_COLOR_B", 60000))

        
    # clip = subclip_mob.create_source_clip(slot_id=1)


    # Create a TimelineMobSlot with a Timecode Segment for the start timecode
    # tc_segment = f.create.Timecode(edit_rate)
    # tc_segment.start = start_time
    # tc_slot = subclip_mob.create_timeline_slot(edit_rate, slot_id=1)
    # tc_slot.segment = tc_segment
    
    mob_print = subclip_mob
    print(dir(mob_print))
    for key in mob_print.allkeys():
        print (mob_print[f'{key}'])
    pass