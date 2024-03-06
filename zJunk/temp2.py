
import aaf2, pprint

file_name = "./testSelector.aaf"
edit_rate = 50
sequence_start = 1*60*60*edit_rate
sequence_length = 20*edit_rate
dictMobID = {}

with aaf2.open(file_name, "w")  as f:
    # Composition Mob created first
    comp_mob = f.create.CompositionMob()
    comp_mob.usage = "Usage_TopLevel"
    comp_mob.name = "Comp_Mob_Empty"

    # Create a TimelineMobSlot with a Timecode Segment for the start timecode
    tc_segment = f.create.Timecode(edit_rate)
    tc_segment.start = sequence_start
    tc_slot = comp_mob.create_timeline_slot(edit_rate)
    tc_slot.segment = tc_segment
    comp_mob.name = "Comp_Mob_with_TC"

######## SELECTOR STUFF #########

    # Create Selector Composition Mob outside the Master MOBs loop
    selector_comp_mob = f.create.CompositionMob()
    selector_comp_mob.usage = "Usage_TopLevel"
    selector_comp_mob.name = "CompMob_Selector_Empty"

    # Create a TimelineMobSlot with a Timecode Segment for the start timecode
    tc_segment = f.create.Timecode(edit_rate)
    tc_segment.start = 2* sequence_start
    tc_slot = selector_comp_mob.create_timeline_slot(edit_rate)
    tc_slot.segment = tc_segment

    selector_sequence = f.create.Sequence(media_kind="picture")

    # Attempt at creating selector
    selector = f.create.Selector()
    selector.media_kind = "picture"


    selector_segment = f.create.Timecode(edit_rate)
    selector_segment.start = 3*sequence_start
    # DO I NEED A TIMELINE SLOT???
    selector_timeline_slot = selector_comp_mob.create_timeline_slot(edit_rate)
    selector_timeline_slot.segment = selector_sequence
    selector_timeline_slot.name = "GroupSlot"

    selector_sequence.components.append(selector)

    
    # print(list((selector_sequence.components)))
    f.content.mobs.append(selector_comp_mob)





######## MASTER MOBS #########

    # Make the Master MOBs
    for i in range(1,5):
        tape_name= f"tapeName_{i}"

        # Make the Tape MOB
        tape_mob = f.create.SourceMob()
        
        tape_slot, tape_timecode_slot = tape_mob.create_tape_slots(tape_name, edit_rate, edit_rate)        
        
        # Set start time for clip
        tape_timecode_slot.segment.start = sequence_start
        # Reduce from default 12 hour length
        tape_slot.segment.length = sequence_length

        f.content.mobs.append(tape_mob)
        # Make a FileMob
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

        # Set the first clip as selected and rest as alternates
        first_clip = True
        if first_clip:
            selector['Selected'].value = tape_clip
            selector_comp_mob.name = f"Selector_COMP_mob_with_selected"
        first_clip = False
        # else:
        #     # selector['Alternates'].append(tape_clip)
        #     selector_comp_mob.name = f"Selector_COMP_mob_with_alternate"



        master_mob = f.create.MasterMob()
        master_mob.name = f"MM_name_{i}"
        clip = file_mob.create_source_clip(slot_id=1)
        slot = master_mob.create_picture_slot(edit_rate)
        slot.segment.components.append(clip)

        dictMobID[i] = master_mob

        f.content.mobs.append(master_mob)

    for i in range(1,2):
        sequence = f.create.Sequence(media_kind="picture")
        timeline_slot = comp_mob.create_timeline_slot(edit_rate)
        timeline_slot.segment= sequence
        timeline_slot.name = "SRC"
        comp_mob.name = "Comp_Mob_with_TC_and_v1"


        dictClipID = {}
        clip_position = 200
        for key in dictMobID:

            mm = dictMobID[key]
            # print(mm.mob_id)
            clip_start = 0
            clip_length = 2*edit_rate
            # Create a SourceClip
            clip = mm.create_source_clip(slot_id=1)
            # print(str((clip.mob_id)))
            # This is the start point of the master mob in the source clip?
            clip.start = clip_position
            # This is the length of the source clip - filled with the master mob
            clip.length = clip_length
            dictClipID[key] = clip

            sequence.components.append(clip)
        comp_mob.name = "Comp_Mob_with_TC_and_v1_clips"
    
    clip_position = 50
    
    for key in dictMobID:

        mm = dictMobID[key]
        # print(mm.mob_id)
        clip_start = 0
        clip_length = 2*edit_rate
        # Create a SourceClip
        clip = mm.create_source_clip(slot_id=1)
        # print(str((clip.mob_id)))
        # This is the start point of the master mob in the source clip?
        clip.start = clip_position
        # This is the length of the source clip - filled with the master mob
        clip.length = clip_length
        dictClipID[key] = clip

        selector_sequence.components.append(clip)
    
    print(selector_comp_mob.tracks)

    # Append your main composition mob at the end
    f.content.mobs.append(comp_mob)
