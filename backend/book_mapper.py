# Maps book names as they appear in USCCB/readings API output
# to the confirmed slugs from thedouayrheims.com/api documentation.
# Source: https://thedouayrheims.com/api (fetched and verified directly)

BOOK_NAME_TO_SLUG = {
    # Old Testament
    "Genesis": "genesis",
    "Exodus": "exodus",
    "Leviticus": "leviticus",
    "Numbers": "numbers",
    "Deuteronomy": "deuteronomy",
    "Joshua": "josue",
    "Judges": "judges",
    "Ruth": "ruth",
    "1 Samuel": "1-kings",
    "2 Samuel": "2-kings",
    "1 Kings": "3-kings",
    "2 Kings": "4-kings",
    "1 Chronicles": "1-paralipomenon",
    "2 Chronicles": "2-paralipomenon",
    "Ezra": "1-esdras",
    "Nehemiah": "2-esdras",
    "Tobit": "tobias",
    "Judith": "judith",
    "Esther": "esther",
    "1 Maccabees": "1-machabees",
    "2 Maccabees": "2-machabees",
    "Job": "job",
    "Psalm": "psalms",
    "Psalms": "psalms",
    "Proverbs": "proverbs",
    "Ecclesiastes": "ecclesiastes",
    "Song of Songs": "canticle-of-canticles",
    "Wisdom": "wisdom",
    "Sirach": "ecclesiasticus",
    "Isaiah": "isaie",
    "Jeremiah": "jeremie",
    "Lamentations": "lamentations",
    "Baruch": "baruch",
    "Ezekiel": "ezechiel",
    "Daniel": "daniel",
    "Hosea": "osee",
    "Joel": "joel",
    "Amos": "amos",
    "Obadiah": "abdias",
    "Jonah": "jonas",
    "Micah": "micheas",
    "Nahum": "nahum",
    "Habakkuk": "habacuc",
    "Zephaniah": "sophonias",
    "Haggai": "aggeus",
    "Zechariah": "zacharias",
    "Malachi": "malachie",

    # New Testament
    "Matthew": "matthew",
    "Mark": "mark",
    "Luke": "luke",
    "John": "john",
    "Acts": "acts",
    "Romans": "romans",
    "1 Corinthians": "1-corinthians",
    "2 Corinthians": "2-corinthians",
    "Galatians": "galatians",
    "Ephesians": "ephesians",
    "Philippians": "philippians",
    "Colossians": "colossians",
    "1 Thessalonians": "1-thessalonians",
    "2 Thessalonians": "2-thessalonians",
    "1 Timothy": "1-timothy",
    "2 Timothy": "2-timothy",
    "Titus": "titus",
    "Philemon": "philemon",
    "Hebrews": "hebrews",
    "James": "james",
    "1 Peter": "1-peter",
    "2 Peter": "2-peter",
    "1 John": "1-john",
    "2 John": "2-john",
    "3 John": "3-john",
    "Jude": "jude",
    "Revelation": "apocalypse",
}


def get_slug(book_name: str) -> str:
    """
    Converts a readings-API book name to the matching Douay-Rheims API slug.
    Raises a clear error for any unmapped book rather than guessing.
    """
    slug = BOOK_NAME_TO_SLUG.get(book_name)
    if slug is None:
        raise ValueError(f"No slug mapping found for book: '{book_name}'")
    return slug