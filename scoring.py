import re

STAR_DIMENSIONS = ["Situation", "Task", "Action", "Result", "Reflection"]

KEYWORDS = {
    "Situation": ["when", "at", "during", "in my role", "context"],
    "Task": ["my goal", "i needed to", "responsible for"],
    "Action": [
        "i did", "i implemented", "i led", "i analyzed", "steps", "worked with",
        "collaborated", "translated", "documented", "reviewed", "coordinated",
        "investigated", "designed", "built", "tested", "created", "resolved"
    ],
    "Result": ["improved", "reduced", "increased", "impact", "outcome", "benchmark"],
    "Reflection": ["learned", "next time", "would do differently", "reinforced", "taught me"]
}

FILLER_WORDS = ["um", "uh", "like", "basically", "actually", "just", "maybe", "kind of", "sort of"]
TOOLS = [
    "sql", "python", "excel", "tableau", "power bi", "jira", "figma", "react", "aws",
    "kubernetes", "docker", "spark", "pandas", "looker", "git", "airflow"
]
STAKEHOLDERS = ["stakeholder", "customer", "client", "manager", "team", "partner", "user"]

WORD_RE = re.compile(r"[a-z']+")
SENTENCE_RE = re.compile(r"[^.!?]+[.!?]")
NUMBER_RE = re.compile(r"\b\d+(\.\d+)?%?\b")


def _split_sentences(text):
    sentences = [s.strip() for s in SENTENCE_RE.findall(text)]
    if not sentences and text.strip():
        sentences = [text.strip()]
    return sentences


def _find_keyword_hits(answer, keywords):
    lowered = answer.lower()
    hits = []
    for phrase in keywords:
        index = lowered.find(phrase)
        if index >= 0:
            hits.append((phrase, index))
    return hits


def _find_section_label(answer, dimension):
    label = dimension.lower()
    for line in answer.splitlines():
        if line.strip().lower().startswith(f"{label}:"):
            return line.strip()
    return None


def _extract_evidence(answer, hit_index):
    sentences = _split_sentences(answer)
    if not sentences:
        return "No answer provided."
    cursor = 0
    for sentence in sentences:
        next_cursor = cursor + len(sentence)
        if cursor <= hit_index <= next_cursor:
            return sentence.strip()
        cursor = next_cursor
    snippet_start = max(0, hit_index - 40)
    snippet_end = min(len(answer), hit_index + 60)
    return answer[snippet_start:snippet_end].strip()


def _score_star_dimension(answer, dimension):
    label_line = _find_section_label(answer, dimension)
    hits = _find_keyword_hits(answer, KEYWORDS.get(dimension, []))
    detected = label_line is not None or len(hits) > 0

    score = 0
    evidence = f"No clear {dimension.lower()} cue found."
    if detected:
        score = 3
        if label_line:
            evidence = label_line
        else:
            evidence = _extract_evidence(answer, hits[0][1])
        if len(hits) >= 2:
            score += 1
    if dimension == "Result" and NUMBER_RE.search(answer):
        score += 1

    score = max(0, min(5, score))
    return {
        "detected": detected,
        "evidence": evidence,
        "score": score
    }


def _clarity_score(answer):
    words = WORD_RE.findall(answer.lower())
    word_count = len(words)
    sentences = _split_sentences(answer)
    sentence_count = max(1, len(sentences))
    avg_sentence_len = word_count / sentence_count

    filler_count = sum(words.count(filler) for filler in FILLER_WORDS)
    filler_ratio = filler_count / max(1, word_count)
    short_sentence_ratio = sum(1 for s in sentences if len(WORD_RE.findall(s)) <= 10) / sentence_count

    clarity = 10
    if avg_sentence_len > 30:
        clarity -= 3
    elif avg_sentence_len > 24:
        clarity -= 2
    if avg_sentence_len < 8:
        clarity -= 2
    if filler_ratio > 0.06:
        clarity -= 3
    elif filler_ratio > 0.03:
        clarity -= 2
    if short_sentence_ratio > 0.6:
        clarity -= 2

    return max(0, min(10, clarity))


def _structure_score(answer, star_breakdown):
    lowered = answer.lower()
    positions = []
    for dimension in STAR_DIMENSIONS:
        hits = _find_keyword_hits(answer, KEYWORDS.get(dimension, []))
        if hits:
            positions.append((dimension, hits[0][1]))

    detected_count = sum(1 for dim in STAR_DIMENSIONS if star_breakdown[dim]["detected"])
    score = detected_count * 1.5

    if len(positions) == len(STAR_DIMENSIONS):
        ordered = sorted(positions, key=lambda item: item[1])
        if [item[0] for item in ordered] == STAR_DIMENSIONS:
            score += 2

    if "\n\n" in answer.strip():
        score += 0.5

    return max(0, min(10, int(round(score))))


def _completeness_score(answer, star_breakdown):
    detected_count = sum(1 for dim in STAR_DIMENSIONS if star_breakdown[dim]["detected"])
    coverage_score = (detected_count / len(STAR_DIMENSIONS)) * 6

    lowered = answer.lower()
    specificity = 0
    if NUMBER_RE.search(answer):
        specificity += 2
    if any(tool in lowered for tool in TOOLS):
        specificity += 1
    if any(stakeholder in lowered for stakeholder in STAKEHOLDERS):
        specificity += 1

    return max(0, min(10, int(round(coverage_score + specificity))))


def score_answer(answer):
    star_breakdown = {
        dim: _score_star_dimension(answer, dim) for dim in STAR_DIMENSIONS
    }

    clarity = _clarity_score(answer)
    structure = _structure_score(answer, star_breakdown)
    completeness = _completeness_score(answer, star_breakdown)

    star_total = sum(item["score"] for item in star_breakdown.values())
    star_component = (star_total / 25) * 50
    total_score = int(round(min(100, star_component + (clarity * 2) + (structure * 2) + completeness)))

    improvement_suggestions = []
    for dim, detail in star_breakdown.items():
        if detail["score"] <= 2:
            improvement_suggestions.append(_suggest_for_dimension(dim))

    if clarity <= 4:
        improvement_suggestions.append(
            "Use shorter, clearer sentences and reduce filler words to improve clarity."
        )
    if structure <= 4:
        improvement_suggestions.append(
            "Separate STAR sections with clear transitions or line breaks to improve structure."
        )
    if completeness <= 4:
        improvement_suggestions.append(
            "Add specificity: tools used, stakeholders involved, and measurable impact."
        )

    return {
        "star_breakdown": star_breakdown,
        "dimension_scores": {
            "clarity": clarity,
            "structure": structure,
            "completeness": completeness
        },
        "total_score": total_score,
        "improvement_suggestions": improvement_suggestions
    }


def _suggest_for_dimension(dimension):
    if dimension == "Situation":
        return "Add context: when it happened, the setting, and why it mattered."
    if dimension == "Task":
        return "State your specific goal or responsibility in that situation."
    if dimension == "Action":
        return "Describe the concrete steps you took and how you executed them."
    if dimension == "Result":
        return "Include measurable impact such as %, time saved, or outcomes achieved."
    if dimension == "Reflection":
        return "Share what you learned or what you would do differently next time."
    return "Clarify this part of the story."


if __name__ == "__main__":
    sample_answer = (
        "During a production outage in my role as a backend engineer, my goal was to "
        "restore service quickly without losing data. I needed to coordinate with the on-call team. "
        "I did a log review, implemented a rollback plan, and led a war room with stakeholders. "
        "As a result, we reduced downtime by 40% and stabilized the service within 45 minutes. "
        "Next time I would do differently by adding automated alerts to catch the issue earlier."
    )

    result = score_answer(sample_answer)
    print("STAR breakdown:")
    for key, value in result["star_breakdown"].items():
        print(f"- {key}: detected={value['detected']}, score={value['score']}")
        print(f"  evidence: {value['evidence']}")
    print("Dimension scores:", result["dimension_scores"])
    print("Total score:", result["total_score"])
    print("Suggestions:")
    for suggestion in result["improvement_suggestions"]:
        print(f"- {suggestion}")