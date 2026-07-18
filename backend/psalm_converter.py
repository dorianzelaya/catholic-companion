def convert_psalm_reference(nab_number: int, nab_verse: int = None) -> dict:
    """
    Converts a psalm reference from NAB/Hebrew numbering (used by USCCB readings)
    to Vulgate/Greek numbering (used by the Douay-Rheims API).

    Returns a dict: {"vulgate_number": int, "verse_offset": int}
    verse_offset is added to the NAB verse number to get the Vulgate verse number
    within the target psalm. Use 0 if no shift is needed.

    Sources confirmed against real API data and cross-referenced historical tables:
    - Psalms 1-8: identical in both systems, no shift
    - Psalms 9-10 (Hebrew) -> Psalm 9 (Vulgate): both map to Vulgate 9, no verse shift
    - Psalms 11-113 (Hebrew) -> Psalms 10-112 (Vulgate): subtract 1 from number, no verse shift
    - Psalm 114 (Hebrew) verses 1-8 -> Psalm 113 (Vulgate) verses 1-8
    - Psalm 115 (Hebrew) verses 1-8 -> Psalm 113 (Vulgate) verses 9-26: add 8 to verse number
    - Psalm 116 (Hebrew) verses 1-9 -> Psalm 114 (Vulgate): no shift
    - Psalm 116 (Hebrew) verses 10-19 -> Psalm 115 (Vulgate): subtract 9 from verse number
    - Psalms 117-146 (Hebrew) -> Psalms 116-145 (Vulgate): subtract 1, no verse shift
    - Psalm 147 (Hebrew) verses 1-11 -> Psalm 146 (Vulgate)
    - Psalm 147 (Hebrew) verses 12-20 -> Psalm 147 (Vulgate) verses 1-9: subtract 11
    - Psalms 148-150: identical in both systems, no shift
    """
    if nab_number <= 8:
        return {"vulgate_number": nab_number, "verse_offset": 0}

    elif nab_number == 9:
        return {"vulgate_number": 9, "verse_offset": 0}

    elif nab_number == 10:
        return {"vulgate_number": 9, "verse_offset": 0}

    elif 11 <= nab_number <= 113:
        return {"vulgate_number": nab_number - 1, "verse_offset": 0}

    elif nab_number == 114:
        return {"vulgate_number": 113, "verse_offset": 0}

    elif nab_number == 115:
        return {"vulgate_number": 113, "verse_offset": 8}

    elif nab_number == 116 and nab_verse is not None and nab_verse <= 9:
        return {"vulgate_number": 114, "verse_offset": 0}

    elif nab_number == 116 and nab_verse is not None and nab_verse >= 10:
        return {"vulgate_number": 115, "verse_offset": -9}

    elif nab_number == 116:
        raise ValueError("Psalm 116 requires a verse number to determine the correct split")

    elif 117 <= nab_number <= 146:
        return {"vulgate_number": nab_number - 1, "verse_offset": 0}

    elif nab_number == 147 and nab_verse is not None and nab_verse <= 11:
        return {"vulgate_number": 146, "verse_offset": 0}

    elif nab_number == 147 and nab_verse is not None and nab_verse >= 12:
        return {"vulgate_number": 147, "verse_offset": -11}

    elif nab_number == 147:
        raise ValueError("Psalm 147 requires a verse number to determine the correct split")

    elif 148 <= nab_number <= 150:
        return {"vulgate_number": nab_number, "verse_offset": 0}

    else:
        raise ValueError(f"Psalm number {nab_number} is out of valid range (1-150)")