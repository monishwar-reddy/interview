export const QUESTION_BANK = {
    "SWE": [
        {
            "id": "swe_1",
            "question": "Tell me about a time when you had to debug a critical production issue under time pressure.",
            "tags": ["problem-solving", "pressure", "technical"]
        },
        {
            "id": "swe_2",
            "question": "Describe a situation where you had to refactor legacy code. What was your approach?",
            "tags": ["technical", "initiative", "quality"]
        },
        {
            "id": "swe_3",
            "question": "Tell me about a time when you disagreed with a technical decision made by your team.",
            "tags": ["collaboration", "communication", "conflict"]
        },
        {
            "id": "swe_4",
            "question": "Share an example of when you had to learn a new technology or framework quickly to meet a deadline.",
            "tags": ["learning", "pressure", "adaptability"]
        },
        {
            "id": "swe_5",
            "question": "Describe a project where you had to balance technical excellence with business constraints.",
            "tags": ["decision-making", "technical", "business"]
        },
        {
            "id": "swe_6",
            "question": "Tell me about a time when you received critical feedback on your code. How did you respond?",
            "tags": ["growth", "communication", "adaptability"]
        },
        {
            "id": "swe_7",
            "question": "Describe a situation where you identified and prevented a potential security vulnerability.",
            "tags": ["initiative", "technical", "quality"]
        },
        {
            "id": "swe_8",
            "question": "Tell me about your biggest technical failure and what you learned from it.",
            "tags": ["failure", "learning", "growth"]
        },
        {
            "id": "swe_9",
            "question": "Share an example of when you mentored or helped a junior developer solve a complex problem.",
            "tags": ["leadership", "communication", "collaboration"]
        },
        {
            "id": "swe_10",
            "question": "Describe a time when you had to make a trade-off between code quality and delivery speed.",
            "tags": ["decision-making", "pressure", "quality"]
        },
        {
            "id": "swe_11",
            "question": "Tell me about a time when you improved the performance of a system or application significantly.",
            "tags": ["technical", "initiative", "impact"]
        },
        {
            "id": "swe_12",
            "question": "Describe a situation where you had to advocate for a technical approach that others initially resisted.",
            "tags": ["leadership", "communication", "technical"]
        }
    ],
    "Data Analyst": [
        {
            "id": "da_1",
            "question": "Tell me about a time when your data analysis led to a significant business decision.",
            "tags": ["impact", "business", "technical"]
        },
        {
            "id": "da_2",
            "question": "Describe a situation where you found errors or inconsistencies in data. How did you handle it?",
            "tags": ["problem-solving", "quality", "initiative"]
        },
        {
            "id": "da_3",
            "question": "Tell me about a time when you had to explain complex data insights to non-technical stakeholders.",
            "tags": ["communication", "collaboration", "business"]
        },
        {
            "id": "da_4",
            "question": "Share an example of when you had to work with incomplete or messy data.",
            "tags": ["adaptability", "problem-solving", "technical"]
        },
        {
            "id": "da_5",
            "question": "Describe a project where you had to learn a new analytical tool or technique quickly.",
            "tags": ["learning", "adaptability", "technical"]
        },
        {
            "id": "da_6",
            "question": "Tell me about a time when your initial analysis turned out to be wrong. What did you do?",
            "tags": ["failure", "learning", "integrity"]
        },
        {
            "id": "da_7",
            "question": "Describe a situation where you had to prioritize multiple data requests from different stakeholders.",
            "tags": ["decision-making", "pressure", "collaboration"]
        },
        {
            "id": "da_8",
            "question": "Tell me about a time when you identified a trend or pattern that others had missed.",
            "tags": ["initiative", "impact", "technical"]
        },
        {
            "id": "da_9",
            "question": "Share an example of when you had to challenge a business assumption based on your data analysis.",
            "tags": ["communication", "confidence", "impact"]
        },
        {
            "id": "da_10",
            "question": "Describe a time when you automated a reporting process. What was the impact?",
            "tags": ["initiative", "technical", "efficiency"]
        },
        {
            "id": "da_11",
            "question": "Tell me about a situation where you had to balance analytical depth with tight deadlines.",
            "tags": ["pressure", "decision-making", "quality"]
        },
        {
            "id": "da_12",
            "question": "Describe a time when you collaborated with other teams to solve a data-related problem.",
            "tags": ["collaboration", "communication", "problem-solving"]
        }
    ],
    "Product": [
        {
            "id": "pm_1",
            "question": "Tell me about a time when you had to say no to a feature request from an important stakeholder.",
            "tags": ["decision-making", "communication", "conflict"]
        },
        {
            "id": "pm_2",
            "question": "Describe a product you launched that didn't meet expectations. What did you learn?",
            "tags": ["failure", "learning", "adaptability"]
        },
        {
            "id": "pm_3",
            "question": "Tell me about a time when you had to prioritize features with limited resources.",
            "tags": ["decision-making", "pressure", "strategy"]
        },
        {
            "id": "pm_4",
            "question": "Share an example of when you used data to influence a product decision.",
            "tags": ["impact", "technical", "communication"]
        },
        {
            "id": "pm_5",
            "question": "Describe a situation where you had to balance user needs with business goals.",
            "tags": ["decision-making", "business", "empathy"]
        },
        {
            "id": "pm_6",
            "question": "Tell me about a time when you had to get buy-in from engineering for a challenging project.",
            "tags": ["collaboration", "communication", "leadership"]
        },
        {
            "id": "pm_7",
            "question": "Describe a time when you identified a market opportunity that others had overlooked.",
            "tags": ["initiative", "impact", "strategy"]
        },
        {
            "id": "pm_8",
            "question": "Tell me about a situation where you had to make a product decision with incomplete information.",
            "tags": ["decision-making", "pressure", "risk"]
        },
        {
            "id": "pm_9",
            "question": "Share an example of when you had to pivot your product strategy based on user feedback.",
            "tags": ["adaptability", "learning", "empathy"]
        },
        {
            "id": "pm_10",
            "question": "Describe a time when you had to manage conflicting priorities from different stakeholders.",
            "tags": ["collaboration", "conflict", "communication"]
        },
        {
            "id": "pm_11",
            "question": "Tell me about a product feature you championed that became highly successful.",
            "tags": ["initiative", "impact", "leadership"]
        },
        {
            "id": "pm_12",
            "question": "Describe a situation where you had to work with a difficult team member to deliver a product.",
            "tags": ["collaboration", "conflict", "adaptability"]
        }
    ]
};

export function pickSessionQuestions(role, n = 5) {
    if (!QUESTION_BANK[role]) {
        throw new Error(`Unknown role: ${role}`);
    }

    // Copy array to avoid mutation
    const questions = [...QUESTION_BANK[role]];

    // Simple shuffle
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return questions.slice(0, n);
}

export function getAllRoles() {
    return Object.keys(QUESTION_BANK);
}
