from collections import defaultdict
import re


STAR_KEYS = ["Situation", "Task", "Action", "Result", "Reflection"]
ACTION_VERBS = [
    "implemented", "built", "led", "analyzed", "designed", "created", "resolved",
    "tested", "fixed", "automated", "owned", "drove", "coordinated", "delivered"
]
NUMBER_RE = re.compile(r"\b\d+(\.\d+)?%?\b")


class SessionMemory:
    def __init__(self, role, questions):
        self.role = role
        self.questions = questions
        self.question_index = 0
        self.qa_history = []
        self.weakness_counts = defaultdict(int)
        self.last_entry = None

    def add_response(self, question_id, question, answer, scores, suggestions):
        entry = {
            "question_id": question_id,
            "question": question,
            "answer": answer,
            "scores": scores,
            "suggestions": suggestions
        }
        self.qa_history.append(entry)
        self.last_entry = entry

        self._update_weaknesses(answer, scores)
        self.question_index += 1

    def _update_weaknesses(self, answer, scores):
        answer_lower = answer.lower()

        result_score = scores.get("star_breakdown", {}).get("Result", {}).get("score", 0)
        has_metrics = NUMBER_RE.search(answer) is not None
        if result_score <= 2 or not has_metrics:
            self.weakness_counts["Missing metrics in Result"] += 1

        action_hits = sum(1 for verb in ACTION_VERBS if verb in answer_lower)
        if action_hits < 2:
            self.weakness_counts["Weak Action detail"] += 1

        word_count = len(re.findall(r"[a-z']+", answer_lower))
        if word_count < 80:
            self.weakness_counts["Too brief"] += 1

    def get_top_weaknesses(self, n=3):
        if not self.weakness_counts:
            return []
        sorted_items = sorted(self.weakness_counts.items(), key=lambda item: item[1], reverse=True)
        return sorted_items[:n]

    def get_personalized_nudge(self):
        top = self.get_top_weaknesses(n=1)
        if not top:
            return "Keep your STAR structure clear and add specific outcomes."
        weakness = top[0][0]
        if weakness == "Missing metrics in Result":
            return "Before you answer, plan 1-2 measurable outcomes (%, time saved, impact)."
        if weakness == "Weak Action detail":
            return "List 2-3 concrete actions you personally took before you answer."
        if weakness == "Too brief":
            return "Add more detail on context, actions, and results to reach 80+ words."
        return "Focus on clearer STAR coverage and specific details."