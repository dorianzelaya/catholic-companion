"""
Seeds five new Seek categories under a "Growth" group: Discernment, Wisdom,
Peace, Hope, Knowledge. Matches the existing data shape exactly — one row
per verse in ScripturePassage, one saint and one prayer per category.

Safe to re-run: each insert is guarded by a check for that category already
existing in the table, so running this twice won't create duplicates.

Run from the backend folder with the venv active:
    python seed_seek_growth.py
"""
from database import SessionLocal
import models

GROWTH_CATEGORIES = ["Discernment", "Wisdom", "Peace", "Hope", "Knowledge"]

PASSAGES = {
    "Discernment": [
        {
            "book": "James", "chapter": 1, "verse_start": 5, "verse_end": 5,
            "reference": "James 1:5",
            "text": "But if any of you want wisdom, let him ask of God, who gives to all men abundantly, and upbraids not: and it shall be given him.",
        },
        {
            "book": "Proverbs", "chapter": 3, "verse_start": 5, "verse_end": 6,
            "reference": "Proverbs 3:5-6",
            "text": "Have confidence in the Lord with all thy heart, and lean not upon thy own prudence. In all thy ways think on him, and he will direct thy steps.",
        },
        {
            "book": "Romans", "chapter": 12, "verse_start": 2, "verse_end": 2,
            "reference": "Romans 12:2",
            "text": "And be not conformed to this world; but be reformed in the newness of your mind, that you may prove what is the good, and the acceptable, and the perfect will of God.",
        },
    ],
    "Wisdom": [
        {
            "book": "Proverbs", "chapter": 9, "verse_start": 10, "verse_end": 10,
            "reference": "Proverbs 9:10",
            "text": "The fear of the Lord is the beginning of wisdom: and the knowledge of the holy is prudence.",
        },
        {
            "book": "Wisdom", "chapter": 7, "verse_start": 7, "verse_end": 7,
            "reference": "Wisdom 7:7",
            "text": "Wherefore I wished, and understanding was given me: and I called upon God, and the spirit of wisdom came upon me.",
        },
        {
            "book": "1 Corinthians", "chapter": 1, "verse_start": 25, "verse_end": 25,
            "reference": "1 Corinthians 1:25",
            "text": "For the foolishness of God is wiser than men; and the weakness of God is stronger than men.",
        },
    ],
    "Peace": [
        {
            "book": "John", "chapter": 14, "verse_start": 27, "verse_end": 27,
            "reference": "John 14:27",
            "text": "Peace I leave with you, my peace I give unto you: not as the world gives, do I give unto you. Let not your heart be troubled, nor let it be afraid.",
        },
        {
            "book": "Philippians", "chapter": 4, "verse_start": 6, "verse_end": 7,
            "reference": "Philippians 4:6-7",
            "text": "Be nothing solicitous: but in every thing, by prayer and supplication, with thanksgiving, let your petitions be made known to God. And the peace of God, which surpasses all understanding, keep your hearts and minds in Christ Jesus.",
        },
        {
            "book": "Isaiah", "chapter": 26, "verse_start": 3, "verse_end": 3,
            "reference": "Isaiah 26:3",
            "text": "The old error is passed away: thou wilt keep peace: peace, because we have hoped in thee.",
        },
    ],
    "Hope": [
        {
            "book": "Jeremiah", "chapter": 29, "verse_start": 11, "verse_end": 11,
            "reference": "Jeremiah 29:11",
            "text": "For I know the thoughts that I think towards you, says the Lord, thoughts of peace, and not of affliction, to give you an end and patience.",
        },
        {
            "book": "Romans", "chapter": 15, "verse_start": 13, "verse_end": 13,
            "reference": "Romans 15:13",
            "text": "Now the God of hope fill you with all joy and peace in believing, that you may abound in hope, and in the power of the Holy Ghost.",
        },
        {
            "book": "Lamentations", "chapter": 3, "verse_start": 22, "verse_end": 23,
            "reference": "Lamentations 3:22-23",
            "text": "The mercies of the Lord that we are not consumed: because his commiserations have not failed. They are new every morning, great is thy faithfulness.",
        },
    ],
    "Knowledge": [
        {
            "book": "Proverbs", "chapter": 1, "verse_start": 7, "verse_end": 7,
            "reference": "Proverbs 1:7",
            "text": "The fear of the Lord is the beginning of wisdom. Fools despise wisdom and instruction.",
        },
        {
            "book": "Colossians", "chapter": 2, "verse_start": 2, "verse_end": 3,
            "reference": "Colossians 2:2-3",
            "text": "That their hearts may be comforted, being instructed in charity, and unto all riches of fulness of understanding, unto the knowledge of the mystery of God the Father and of Christ Jesus, in whom are hid all the treasures of wisdom and knowledge.",
        },
        {
            "book": "2 Peter", "chapter": 1, "verse_start": 5, "verse_end": 5,
            "reference": "2 Peter 1:5",
            "text": "And you, employing all care, minister in your faith, virtue: and in virtue, knowledge.",
        },
    ],
}

SAINTS = {
    "Discernment": {
        "saint_name": "St. Ignatius of Loyola",
        "description": "Founder of the Jesuits who developed the Spiritual Exercises, a structured method for discerning God's will amid competing desires.",
    },
    "Wisdom": {
        "saint_name": "St. Thomas Aquinas",
        "description": "Dominican friar and theologian whose life was devoted to reasoned understanding of God, praying constantly for wisdom before he wrote or taught.",
    },
    "Peace": {
        "saint_name": "St. Francis of Assisi",
        "description": "Founded a life of radical simplicity and reconciliation, becoming a model of interior peace amid poverty and physical suffering.",
    },
    "Hope": {
        "saint_name": "St. Teresa of Calcutta",
        "description": "Continued serving the poorest of the poor for decades even through a long private experience of spiritual darkness, holding to hope in God's presence.",
    },
    "Knowledge": {
        "saint_name": "St. Albert the Great",
        "description": "Dominican bishop and teacher of Aquinas who pursued the natural sciences alongside theology, seeing all true knowledge as a path toward God.",
    },
}

PRAYERS = {
    "Discernment": {
        "prayer_name": "Prayer for Discernment",
        "attribution": "St. Ignatius of Loyola",
        "text": "Lord, teach me to be generous. Teach me to serve you as you deserve, to give and not to count the cost, to fight and not to heed the wounds, to toil and not to seek for rest, to labor and not to ask for reward, save that of knowing that I do your will.",
    },
    "Wisdom": {
        "prayer_name": "Prayer for Wisdom",
        "attribution": "St. Thomas Aquinas",
        "text": "Grant me, O Lord my God, a mind to know you, a heart to seek you, wisdom to find you, conduct pleasing to you, faithful perseverance in waiting for you, and a hope of finally embracing you.",
    },
    "Peace": {
        "prayer_name": "Prayer for Peace",
        "attribution": "St. Francis of Assisi",
        "text": "Lord, make me an instrument of your peace. Where there is hatred, let me sow love; where there is injury, pardon; where there is doubt, faith; where there is despair, hope; where there is darkness, light; where there is sadness, joy.",
    },
    "Hope": {
        "prayer_name": "Prayer of Hope",
        "attribution": "St. Teresa of Calcutta",
        "text": "Dear Jesus, help me to spread your fragrance everywhere I go. Flood my soul with your spirit and life. Penetrate and possess my whole being so utterly that my life may only be a radiance of yours.",
    },
    "Knowledge": {
        "prayer_name": "Prayer Before Study",
        "attribution": "St. Thomas Aquinas",
        "text": "Grant to me, O Lord my God, understanding to know you, diligence to seek you, wisdom to find you, and a faithfulness that may finally embrace you, through Christ our Lord.",
    },
}


def seed():
    db = SessionLocal()
    added_passages = added_saints = added_prayers = 0
    skipped = []

    try:
        for category in GROWTH_CATEGORIES:
            existing = db.query(models.ScripturePassage).filter(
                models.ScripturePassage.category == category
            ).first()
            if existing:
                skipped.append(category)
                continue

            for p in PASSAGES[category]:
                db.add(models.ScripturePassage(category=category, **p))
                added_passages += 1

            s = SAINTS[category]
            db.add(models.StruggleSaint(category=category, **s))
            added_saints += 1

            pr = PRAYERS[category]
            db.add(models.StrugglePrayer(category=category, **pr))
            added_prayers += 1

        db.commit()

    finally:
        db.close()

    print(f"Added: {added_passages} passages, {added_saints} saints, {added_prayers} prayers")
    if skipped:
        print(f"Skipped (already present): {', '.join(skipped)}")


if __name__ == "__main__":
    seed()
