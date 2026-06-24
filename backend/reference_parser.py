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
        "verse_ranges": verse_ranges
    }


def strip_markup(text: str) -> str:
    """
    Removes Douay-Rheims API markup tags from verse text.

    Tags seen in real API responses:
        <cr>[1]</cr>  — cross-reference marker
        <na>[1]</na>  — annotation/note marker
        <sc>TEXT</sc> — small caps formatting
        <i>TEXT</i>   — italic formatting

    We keep the text content inside tags like <sc> and <i>,
    but remove the annotation markers <cr> and <na> entirely
    since their content is just reference numbers, not scripture.
    """
    # Remove annotation markers and their content entirely
    text = re.sub(r'<cr>.*?</cr>', '', text)
    text = re.sub(r'<na>.*?</na>', '', text)

    # Remove formatting tags but keep their text content
    text = re.sub(r'<sc>(.*?)</sc>', r'\1', text)
    text = re.sub(r'<i>(.*?)</i>', r'\1', text)

    # Clean up any double spaces left behind
    text = re.sub(r' +', ' ', text)

    return text.strip()