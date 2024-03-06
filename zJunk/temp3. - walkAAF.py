import aaf2
import sys
import aaf2.components
import aaf2.common

def dummy_print(*args):
    line = " ".join([str(item) for item in args])

def walk_aaf(root, space="", func=dummy_print):
    indent = "  "

    for p in root.properties():
        if isinstance(p, aaf2.properties.StrongRefProperty):
            func(space, p.name, p.typedef)
            walk_aaf(p.value, space + indent, func)

        if isinstance(p, aaf2.properties.StrongRefVectorProperty):
            func(space, p.name, p.typedef)
            for obj in p.value:
                func(space + indent, obj)
                walk_aaf(obj, space + indent*2, func)
            continue

        if isinstance(p, aaf2.properties.StrongRefSetProperty):
            func(space, p.name, p.typedef)
            for key, obj in p.items():
                func(space + indent, obj)
                walk_aaf(obj, space + indent*2, func)

            continue

        func(space, p.name, p.typedef, p.value)

def frames_to_timecode(frames, fps):
    s, f = divmod(frames, fps)
    m, s = divmod(s, 60)
    h, m = divmod(m, 60)
    d, h = divmod(h, 24)
    return '{0:02d}:{1:02d}:{2:02d}:{3:02d}:{4:02d}'.format(d, h, m, s, f)


def mob_timecode(mob, offset, edit_rate):
    timecode_list = []
    # search the slots for timecode segments
    # NOTE: PhysicalTrackNumber of the slots tells you the type of
    # timecode is its main, AUX etc, see aafeditprotocol spec
    for slot in mob.slots:
        if slot.segment.media_kind == 'Timecode':
            if len(slot.segment.components) == 1:
                timecode = slot.segment.components[0]

                if isinstance(timecode, aaf2.components.Timecode):
                    tc = frames_to_timecode(timecode['Start'].value + offset, edit_rate)
                    timecode_list.append(tc)
            else:
                # If the timecode track has a sequence of Timecode objects,
                # you calculate the timecode by finding the Timecode object
                # that covers the specified offset in the track and add to
                # its starting timecode the difference between the specified
                # offset and the starting position of the Timecode object in the track.
                for index, position, component in slot.segment.positions():
                    if isinstance(component, aaf2.components.Timecode):
                        if position + component.length > offset:
                            diff = offset - position
                            tc = frames_to_timecode(diff + component['Start'].value, edit_rate)
                            timecode_list.append(tc)
                            break

    return timecode_list


def sequence_component_at_time(segment, start):
    if len(segment.components) == 1:
        # handle the easy case (might still be wrong)
        return segment.components[0]
    else:
        # anticipated functionality ;-)
        return segment.component_at_time(start)


def walker(self):
    if not self.slot:
        return

    segment = self.slot.segment

    if isinstance(segment, aaf2.components.SourceClip):
        yield segment
        for item in walker(segment):
            yield item

    elif isinstance(segment, aaf2.components.Sequence):
        try:
            clip = sequence_component_at_time(segment, self.start)
        except AttributeError as e:
            print(e)
        else:
            if isinstance(clip, aaf2.components.SourceClip):
                yield clip
                for item in walker(clip):
                    yield item
            else:
                raise NotImplementedError("Sequence returned {} not "
                                          "implemented".format(
                    type(segment)))

    elif isinstance(segment, aaf2.components.EssenceGroup):
        yield segment

    elif isinstance(segment, aaf2.components.Filler):
        yield segment
    else:
        raise NotImplementedError("Walking {} not implemented".format(
            type(segment)))


def get_timecode(slot):
    edit_rate = int(slot.edit_rate)

    if isinstance(slot.segment, aaf2.components.Sequence):
        clip = slot.segment.components[0]
    else:
        clip = slot.segment

    mobs = [clip.mob]
    start = clip.start
    timecode_list = []

    # walk down the reference chain until you reach the
    # last clip with a NULL reference
    for c in walker(clip):
        print ('walking', c.name, c.start)
        start += c.start
        if c.mob:
            mobs.append(c.mob)

    # the last mob in the chain has the timecode
    timecode_list.extend(mob_timecode(mobs[-1], start, edit_rate))

    return timecode_list


if __name__ == "__main__":
    file_name = "/Users/trevoraylward/Downloads/Sample for OTIO/Examples/VIDEO - Group Clips/AMC - as AAF/AvidSeq-withTestGroupClip x3 layers.aaf"
    #f = aaf2.open(sys.argv[1])
    f = aaf2.open(file_name)

    # for mob in f.content.mastermobs():
    #     print (mob.name)
    #     print ("  ", get_timecode(mob.slot_at(1)))


    print(walk_aaf(f))