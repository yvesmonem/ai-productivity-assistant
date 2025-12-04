import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def generate_report(topic: str) -> dict:
    """Generate a report on a given topic"""
    try:
        prompt = f"""Generate a comprehensive report on the following topic: {topic}

The report should include:
1. A clear, engaging title
2. An introduction that provides context
3. Multiple well-structured sections with detailed content
4. A conclusion that summarizes key points
5. References (if applicable)

Format your response as JSON with these keys:
- title: string
- content: string (full report text)
- sections: object with section titles as keys and content as values
- references: array of strings (optional)
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional report writer. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )

        result_text = response.choices[0].message.content
        
        # Parse JSON response
        import json
        try:
            result = json.loads(result_text)
        except:
            # Fallback
            result = {
                "title": f"Report on {topic}",
                "content": result_text,
                "sections": {},
                "references": []
            }

        return {
            "title": result.get("title", f"Report on {topic}"),
            "content": result.get("content", ""),
            "sections": result.get("sections", {}),
            "references": result.get("references", [])
        }

    except Exception as e:
        raise Exception(f"Failed to generate report: {str(e)}")

