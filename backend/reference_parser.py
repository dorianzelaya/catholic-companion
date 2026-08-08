import re


def parse_reference(reference: str) -> dict:
    """
    Parses a USCCB reading reference string into structured data.

    Examples:
        "Matthew 6:24-34"              -> single range
        "Psalm 89:4-5, 29-30"          -> multiple ranges
        "2 Kings 17:5-8, 13-15a"       -> range with letter suffix
        "2 Chronicles 24:17-25"        -> book with number prefix
        "Psalm 85:9 and 10, 11-12"     -> "and" as verse separator
        "Matthew 10:34-11:1"           -> cross-chapter range (hyphen)
        "Habakkuk 1:12—2:4"            -> cross-chapter range (em dash)

    The USCCB source is inconsistent about which dash character marks a
    cross-chapter range — hyphen (-), en dash (–), and em dash (—) have
    all been observed. All three are treated as equivalent throughout.

    Returns:
        {
            "book": "Matthew",
            "chapter": 6,
            "verse_ranges": [(24, 34)],
            "cross_chapter_end": None  # or (chapter, verse) if range crosses chapters
        }

    Raises ValueError if the reference cannot be parsed.
    """
    reference = reference.strip()

    # Normalize every dash variant to a plain hyphen up front, so nothing
    # downstream needs to know these characters exist. This is the fix:
    # previously only "-" was recognized, so an em/en dash reference fell
    # through to the plain-verse parser and crashed on int().
    reference = reference.replace('—', '-').replace('–', '-')

    # Split book name from chapter:verse portion
    match = re.match(r'^(.+?)\s+(\d+):(.+)$', reference)
    if not match:
        raise ValueError(f"Could not parse reference: '{reference}'")

    book = match.group(1).strip()
    chapter = int(match.group(2))
    verses_str = match.group(3).strip()

    # Detect cross-chapter range like "34-11:1" or "12-2:4"
    cross_chapter_match = re.match(r'^(\d+)-(\d+):(\d+)$', verses_str)
    if cross_chapter_match:
        start_verse = int(cross_chapter_match.group(1))
        end_chapter = int(cross_chapter_match.group(2))
        end_verse = int(cross_chapter_match.group(3))
        return {
            "book": book,
            "chapter": chapter,
            "verse_ranges": [(start_verse, start_verse)],
            "cross_chapter_end": (end_chapter, end_verse)
        }

    # Normalize "and" as a comma separator before splitting
    verses_str = re.sub(r'\s+and\s+', ', ', verses_str)

    # Parse the verse portion — handles ranges, lists, letter suffixes
    verse_ranges = []
    segments = [s.strip() for s in verses_str.split(',')]
    for segment in segments:
        segment = segment.strip()
        if not segment:
            continue

        # Strip letter suffixes like "15a", "3Ab", "7bc" -> just the number
        segment = re.sub(r'([0-9]+)[a-zA-Z]+', r'\1', segment)

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
        "verse_ranges": verse_ranges,
        "cross_chapter_end": None
    }


def strip_markup(text: str) -> str:
    """
    Removes Douay-Rheims API markup tags from verse text.
    """
    text = re.sub(r'<cr>.*?</cr>', '', text)
    text = re.sub(r'<na>.*?</na>', '', text)
    text = re.sub(r'<sc>(.*?)</sc>', r'\1', text)
    text = re.sub(r'<i>(.*?)</i>', r'\1', text)
    text = re.sub(r'<alt>(.*?)</alt>', r'\1', text)
    text = re.sub(r' +', ' ', text)

    # Replace archaic ligatures
    text = text.replace('Ægypt', 'Egypt')
    text = text.replace('Æ', 'Ae')
    text = text.replace('æ', 'ae')
    text = text.replace('Œ', 'Oe')
    text = text.replace('œ', 'oe')

    return text.strip()