import json


def _get_answers(session_memory):
    if hasattr(session_memory, "qa_history"):
        return session_memory.qa_history
    return session_memory.get("answers", [])


def _get_role(session_memory):
    if hasattr(session_memory, "role"):
        return session_memory.role
    return session_memory.get("role")


def _compute_summary(session_memory):
    answers = _get_answers(session_memory)
    if not answers:
        return {
            "overall_average": 0,
            "dimension_averages": {},
            "total_questions": 0
        }

    totals = {
        "Situation": 0,
        "Task": 0,
        "Action": 0,
        "Result": 0,
        "Reflection": 0,
        "Clarity": 0,
        "Structure": 0,
        "Completeness": 0,
        "Total": 0
    }

    for entry in answers:
        scoring = entry.get("scores", entry.get("scoring", {}))
        for key, value in scoring["star_breakdown"].items():
            totals[key] += value["score"]
        totals["Clarity"] += scoring["dimension_scores"]["clarity"]
        totals["Structure"] += scoring["dimension_scores"]["structure"]
        totals["Completeness"] += scoring["dimension_scores"]["completeness"]
        totals["Total"] += scoring["total_score"]

    count = len(answers)
    averages = {key: round(value / count, 2) for key, value in totals.items()}
    return {
        "overall_average": averages["Total"],
        "dimension_averages": averages,
        "total_questions": count
    }


def _get_common_weaknesses(session_memory, n=3):
    if hasattr(session_memory, "weakness_counts"):
        weaknesses = session_memory.weakness_counts
    else:
        weaknesses = session_memory.get("weaknesses", {})
    if not weaknesses:
        return []
    sorted_weaknesses = sorted(weaknesses.items(), key=lambda item: item[1], reverse=True)
    return sorted_weaknesses[:n]


def _improvement_plan(weaknesses):
    steps = []
    weakness_names = [item[0] for item in weaknesses]
    if "Missing metrics in Result" in weakness_names:
        steps.append("Draft 2-3 measurable outcomes for each story before answering.")
    if "Weak Action detail" in weakness_names:
        steps.append("Write 3 concrete actions you personally took and mention tools used.")
    if "Too brief" in weakness_names:
        steps.append("Aim for 80-140 words, covering all STAR elements explicitly.")
    if not steps:
        steps.append("Keep STAR order clear and add measurable results when possible.")
        steps.append("Add a brief reflection on what you learned.")
        steps.append("Include stakeholders and tools to increase specificity.")
    while len(steps) < 3:
        steps.append("Practice a new story and focus on clarity and structure.")
    return steps[:3]


def _next_practice_questions(weaknesses):
    prompts = []
    weakness_names = [item[0] for item in weaknesses]
    if "Missing metrics in Result" in weakness_names:
        prompts.append("Practice a story where you can quantify impact with numbers or %.")
    if "Weak Action detail" in weakness_names:
        prompts.append("Practice a story emphasizing step-by-step actions you took.")
    if "Too brief" in weakness_names:
        prompts.append("Practice a longer STAR response with full context and reflection.")
    if not prompts:
        prompts.append("Practice a conflict story with a clear resolution and outcome.")
        prompts.append("Practice a leadership story with measurable impact.")
    return prompts[:3]


def generate_json_report(session_memory):
    summary = _compute_summary(session_memory)
    weaknesses = _get_common_weaknesses(session_memory)
    report = {
        "role": _get_role(session_memory),
        "summary": summary,
        "common_weaknesses": [{"name": name, "count": count} for name, count in weaknesses],
        "improvement_plan": _improvement_plan(weaknesses),
        "next_practice_questions": _next_practice_questions(weaknesses),
        "answers": _get_answers(session_memory)
    }
    return report


def generate_text_report(session_memory):
    summary = _compute_summary(session_memory)
    weaknesses = _get_common_weaknesses(session_memory)
    improvement_plan = _improvement_plan(weaknesses)
    next_questions = _next_practice_questions(weaknesses)

    lines = [
        f"Role: {_get_role(session_memory)}",
        f"Questions answered: {summary['total_questions']}",
        f"Overall average score: {summary['overall_average']}",
        "",
        "Dimension averages:"
    ]

    for key, value in summary["dimension_averages"].items():
        lines.append(f"- {key}: {value}")

    lines.append("")
    lines.append("Common weaknesses:")
    if weaknesses:
        for name, count in weaknesses:
            lines.append(f"- {name} ({count}x)")
    else:
        lines.append("- None detected")

    lines.append("")
    lines.append("Improvement plan (3 steps):")
    for idx, step in enumerate(improvement_plan, start=1):
        lines.append(f"{idx}. {step}")

    lines.append("")
    lines.append("Next practice focus questions:")
    for prompt in next_questions:
        lines.append(f"- {prompt}")

    return "\n".join(lines)


def json_report_bytes(session_memory):
    payload = generate_json_report(session_memory)
    return json.dumps(payload, indent=2).encode("utf-8")


def text_report_bytes(session_memory):
    return generate_text_report(session_memory).encode("utf-8")