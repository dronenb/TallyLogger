## utility code to read aaf file
# not used currently

import aaf2

file_name = "/Users/trevoraylward/Downloads/Sample for OTIO/Examples/VIDEO - Group Clips/AMC - as AAF/AvidSeq-withTestGroupClip x3 layers.aaf"

with aaf2.open(file_name, "r") as f:

    # get the main composition
    main_compostion = next(f.content.toplevel())

    # print the name of the composition
    print(f'Comp: {main_compostion.name}')
    print(f'CompMob: {main_compostion.keys()}')

    # AAFObjects have properties that can be
    # accessed just like a dictionary
    # print(main_compostion['CreationTime'].value)

    # video, audio and other track types are
    # stored in slots on a mob object.
    for slot in main_compostion.slots:
        print(f'\tSlot: {slot}')
        segment = slot.segment
        print(f'\t\tSegment: {segment.name}')
        # print(f'\t{segment.keys()}')
        try:
            for slot in segment.slots:
                
                print(f'\t\t\tSlots:{slot.keys()}\n')
                # segment2 = slot.segment
                # print(f'\tSegment: {segment2}')
                # print(f'\t{segment2.keys()}')
        except:
            print('\t\tSlots: NO SLOTS here\n')
