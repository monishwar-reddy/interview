import random

QUESTION_BANK = {
    "SWE": [
        {
            "id": "swe-01",
            "question": "Tell me about a time you improved system performance under a tight deadline.",
            "tags": ["failure", "ambiguity"]
        },
        {
            "id": "swe-02",
            "question": "Describe a situation where you debugged a production issue with limited information.",
            "tags": ["failure", "ambiguity"]
        },
        {
            "id": "swe-03",
            "question": "Share a time you disagreed with a technical design and how you handled it.",
            "tags": ["conflict", "teamwork"]
        },
        {
            "id": "swe-04",
            "question": "Tell me about a time you learned a new technology quickly to deliver a feature.",
            "tags": ["ambiguity", "leadership"]
        },
        {
            "id": "swe-05",
            "question": "Describe a project where you balanced code quality with speed.",
            "tags": ["ambiguity", "leadership"]
        },
        {
            "id": "swe-06",
            "question": "Tell me about a time you mentored a teammate or helped them unblock.",
            "tags": ["teamwork", "leadership"]
        },
        {
            "id": "swe-07",
            "question": "Describe a situation where you made a mistake in code and what you did next.",
            "tags": ["failure", "leadership"]
        },
        {
            "id": "swe-08",
            "question": "Share a time you reduced technical debt while still delivering features.",
            "tags": ["leadership", "ambiguity"]
        },
        {
            "id": "swe-09",
            "question": "Tell me about a time you coordinated a cross-team technical change.",
            "tags": ["teamwork", "leadership"]
        },
        {
            "id": "swe-10",
            "question": "Describe a time you handled an on-call incident and communicated status.",
            "tags": ["teamwork", "ambiguity"]
        }
    ],
    "Data Analyst": [
        {
            "id": "da-01",
            "question": "Tell me about a time you turned messy data into a clear recommendation.",
            "tags": ["ambiguity", "leadership"]
        },
        {
            "id": "da-02",
            "question": "Describe a situation where stakeholders disagreed with your analysis.",
            "tags": ["conflict", "teamwork"]
        },
        {
            "id": "da-03",
            "question": "Share a time you automated a reporting process to save time.",
            "tags": ["leadership", "ambiguity"]
        },
        {
            "id": "da-04",
            "question": "Tell me about a time you found an unexpected insight in the data.",
            "tags": ["ambiguity", "leadership"]
        },
        {
            "id": "da-05",
            "question": "Describe a project where you had to define success metrics.",
            "tags": ["ambiguity", "leadership"]
        },
        {
            "id": "da-06",
            "question": "Share a time you balanced speed and accuracy in analysis.",
            "tags": ["ambiguity", "teamwork"]
        },
        {
            "id": "da-07",
            "question": "Tell me about a time you explained complex results to a non-technical audience.",
            "tags": ["teamwork", "leadership"]
        },
        {
            "id": "da-08",
            "question": "Describe a time you had to challenge assumptions with data.",
            "tags": ["conflict", "leadership"]
        },
        {
            "id": "da-09",
            "question": "Tell me about a project where data quality issues caused delays and how you handled it.",
            "tags": ["failure", "ambiguity"]
        },
        {
            "id": "da-10",
            "question": "Share a time you partnered with engineering to improve data pipelines.",
            "tags": ["teamwork", "leadership"]
        }
    ],
    "Product": [
        {
            "id": "pm-01",
            "question": "Tell me about a time you prioritized features with limited resources.",
            "tags": ["ambiguity", "leadership"]
        },
        {
            "id": "pm-02",
            "question": "Describe a situation where you aligned multiple teams around a product goal.",
            "tags": ["teamwork", "leadership"]
        },
        {
            "id": "pm-03",
            "question": "Share a time you handled conflicting stakeholder feedback.",
            "tags": ["conflict", "teamwork"]
        },
        {
            "id": "pm-04",
            "question": "Tell me about a product decision you made with incomplete data.",
            "tags": ["ambiguity", "leadership"]
        },
        {
            "id": "pm-05",
            "question": "Describe a time you improved a product metric through iteration.",
            "tags": ["leadership", "ambiguity"]
        },
        {
            "id": "pm-06",
            "question": "Share a time you learned from a product launch that did not go as planned.",
            "tags": ["failure", "leadership"]
        },
        {
            "id": "pm-07",
            "question": "Tell me about a time you clarified an ambiguous requirement.",
            "tags": ["ambiguity", "teamwork"]
        },
        {
            "id": "pm-08",
            "question": "Describe a time you negotiated scope with engineering or design.",
            "tags": ["conflict", "teamwork"]
        },
        {
            "id": "pm-09",
            "question": "Share a time you used customer research to pivot a roadmap.",
            "tags": ["leadership", "ambiguity"]
        },
        {
            "id": "pm-10",
            "question": "Tell me about a time you owned a difficult trade-off decision.",
            "tags": ["conflict", "leadership"]
        }
    ],
    "General": [
        {
            "id": "gen-01",
            "question": "Tell me about a time you took initiative without being asked.",
            "tags": ["leadership", "ambiguity"]
        },
        {
            "id": "gen-02",
            "question": "Describe a situation where you had to resolve a conflict on your team.",
            "tags": ["conflict", "teamwork"]
        },
        {
            "id": "gen-03",
            "question": "Share a time you failed at something and what you learned from it.",
            "tags": ["failure", "leadership"]
        },
        {
            "id": "gen-04",
            "question": "Tell me about a time you collaborated across teams to hit a goal.",
            "tags": ["teamwork", "leadership"]
        },
        {
            "id": "gen-05",
            "question": "Describe a time you had to deliver results with unclear requirements.",
            "tags": ["ambiguity", "leadership"]
        },
        {
            "id": "gen-06",
            "question": "Share a time you had to persuade others to adopt your idea.",
            "tags": ["conflict", "leadership"]
        },
        {
            "id": "gen-07",
            "question": "Tell me about a time you balanced multiple priorities and deadlines.",
            "tags": ["ambiguity", "teamwork"]
        },
        {
            "id": "gen-08",
            "question": "Describe a time you improved a process or workflow for the team.",
            "tags": ["leadership", "teamwork"]
        },
        {
            "id": "gen-09",
            "question": "Share a time you received tough feedback and how you acted on it.",
            "tags": ["conflict", "leadership"]
        },
        {
            "id": "gen-10",
            "question": "Tell me about a time you made a decision with incomplete information.",
            "tags": ["ambiguity", "leadership"]
        }
    ]
}


def get_roles():
    return sorted(QUESTION_BANK.keys())


def get_questions(role, n=5, seed=None):
    questions = QUESTION_BANK.get(role, [])
    if not questions:
        return []
    rng = random.Random(seed)
    if len(questions) <= n:
        return list(questions)
    return rng.sample(questions, n)
