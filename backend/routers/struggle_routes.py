from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import ScripturePassage
import anthropic
import random
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(prefix="/struggle", tags=["struggle"])

CRISIS_CATEGORIES = {"Despair"}

CRISIS_NOTE = (
    "\n\n---\n"
    "If you are in crisis or experiencing thoughts of self-harm, "
    "please reach out to the 988 Suicide and Crisis Lifeline by calling or texting 988. "
    "You may also speak with a priest or trusted person in your life."
)


@router.post("/search")
async def search_struggle(
    payload: dict,
    db: Session = Depends(get_db)
):
    category = payload.get("category", "").strip()
    if not category:
        raise HTTPException(status_code=400, detail="Category is required")

    passages = db.query(ScripturePassage).filter(
        ScripturePassage.category == category
    ).all()

    if not passages:
        raise HTTPException(status_code=404, detail=f"No passages found for category: {category}")

    selected = random.sample(passages, min(3, len(passages)))

    passages_text = ""
    for i, p in enumerate(selected, 1):
        passages_text += f"{i}. {p.reference}\n\"{p.text}\"\n\n"

    prompt = f"""You are a compassionate Catholic spiritual director responding to someone who is struggling with {category.lower()}.

They have come to you seeking comfort and guidance from scripture. Here are {len(selected)} relevant passages from the Douay-Rheims Bible:

{passages_text}

Please respond with:
1. A brief, warm introduction (2-3 sentences) acknowledging their struggle with compassion
2. Present each scripture passage with its reference, followed by 1-2 sentences of spiritual reflection on how it speaks to their situation
3. Name one Catholic saint who faced a similar struggle and one sentence about how they overcame it
4. Close with a short traditional Catholic prayer (2-4 lines) appropriate for this struggle

Keep your tone warm, pastoral, and grounded in Catholic tradition. Do not be clinical or preachy. Speak as a spiritual father would to someone in need."""

    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        response_text = message.content[0].text

        if category in CRISIS_CATEGORIES:
            response_text += CRISIS_NOTE

        return {
            "category": category,
            "passages": [
                {"reference": p.reference, "text": p.text}
                for p in selected
            ],
            "response": response_text
        }

    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Could not generate response: {str(e)}")