import re


def parse_reference(reference: str) -> dict:
    """
    Parses a USCCB reading reference string into structured data.

    Examples:
        "Matthew 6:24-34"         -> single range
        "Psalm 89:4-5, 29-30"     -> multiple ranges
        "2 Kings 17:5-8, 13-15a"  -> range with letter suffix
        "2 Chronicles 24:17-25"   -> book with number prefix

    Returns:
        {
            "book": "Matthew",
            "chapter": 6,
            "verse_ranges": [(24, 34), (None means single verse: use (v, v))]
        }

    Raises ValueError if the reference cannot be parsed.
    """

    reference = reference.strip()

    # Split book name from chapter:verse portion
    # Handles "Matthew 6:24-34" and "2 Kings 17:5-8"
    match = re.match(r'^(.+?)\s+(\d+):(.+)$', reference)
    if not match:
        raise ValueError(f"Could not parse reference: '{reference}'")

    book = match.group(1).strip()
    chapter = int(match.group(2))
    verses_str = match.group(3).strip()

    # Parse the verse portion — handles ranges, lists, letter suffixes
    verse_ranges = []
    segments = [s.strip() for s in verses_str.split(',')]

    for segment in segments:
        # Strip letter suffixes like "15a" -> "15"
        segment = re.sub(r'([0-9]+)[a-zA-Z]', r'\1', segment)

        if '-' in segment:
            parts = segment.split('-')
            start = int(parts[0].strip())
            end = int(parts[1].strip())
            verse_ranges.append((start, end))
        else:
            v = int(segment.strip())
            verse_ranges.append((v, v))

    return {
        "book": book,
        "chapter": chapter,
        "verse_ranges": verse_ranges
    }