from google import genai
import os
import json

def get_ai_reference_score(citing_article, cited_article, reference):
    """
    Score a reference citation from 0-10 using Gemini AI
    Returns just the score (integer)
    """
    
    # Initialize client
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("GEMINI_API_KEY not found")
            return None
            
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Failed to initialize Gemini client: {e}")
        return None
    
    prompt = f"""You are a professor in {cited_article.subject} and 
    an expert academic reviewer evaluating citation quality.

CITING ARTICLE:
Title: {citing_article.title}
Subject: {citing_article.subject}
Content excerpt: {citing_article.content[:500]}...

CITED WORK:
Title: {cited_article.title}
Authors: {cited_article.author_names}
Subject: {cited_article.subject}

CITATION CONTEXT:
{reference.citation_content if reference.citation_content else "No context provided"}

REFERENCE CONTENT:
{reference.content}

Rate this citation on a scale of 0-10:
- 0-3: Poor (irrelevant, inaccurate, or misrepresented)
- 4-6: Fair (somewhat relevant but could be better)
- 7-8: Good (relevant and accurate)
- 9-10: Excellent (highly relevant, accurate, and necessary)

Respond ONLY with a JSON object:
{{
  "score": <number 0-10>,
  "reasoning": "<brief 1-2 sentence explanation>"
}}"""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt
        )
        
        # Parse JSON response
        result_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
            result_text = result_text.strip()
        
        result = json.loads(result_text)
        score = result.get("score")
        
        print(f"AI Score: {score}/10 - {result.get('reasoning', '')}")
        
        return score
        
    except Exception as e:
        print(f"AI scoring failed: {e}")
        print(f"Response text: {response.text if 'response' in locals() else 'No response'}")
        return None