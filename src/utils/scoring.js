/**
 * Local heuristic scoring for STAR+Reflection methodology.
 * No external APIs - all scoring based on keyword matching and structure analysis.
 */

export function scoreAnswer(answer, question) {
    // Safety check
    if (!question) question = "";
    if (!answer) answer = "";

    const answerLower = answer.toLowerCase();
    const answerWords = answer.trim().split(/\s+/);
    const answerLength = answerWords.length;

    // 1. RELEVANCE CHECK (Heuristic)
    // Check if the answer addresses the specific topic of the question.
    const relevanceScore = scoreRelevance(answerLower, question.toLowerCase());

    // STAR component scoring
    const situationScore = scoreSituation(answerLower, answerLength);
    const taskScore = scoreTask(answerLower, answerLength);
    const actionScore = scoreAction(answerLower, answerLength);
    const resultScore = scoreResult(answerLower, answerLength);
    const reflectionScore = scoreReflection(answerLower, answerLength);

    // Quality metrics
    const clarityScore = scoreClarity(answer, answerLength);
    const structureScore = scoreStructure(answer, answerLower);
    const completenessScore = scoreCompleteness(answerLower, answerLength);

    // Calculate STAR total for relevance check
    const starTotal = situationScore + taskScore + actionScore + resultScore + reflectionScore;

    // RELEVANCE CHECK
    // If relevance is 0 (Strong mismatch found), we penalize heavily even if structure is good.
    // If relevance is 1 (Neutral), we give benefit of doubt.
    // If relevance is 2 (Match), we bonus or just allow high scores.

    let adjustedTotal = starTotal;

    if (relevanceScore === 0) {
        // Severe penalty for off-topic answers
        adjustedTotal = 0;
    }

    const qualityTotal = clarityScore + structureScore + completenessScore;

    // Normalize to 0-100
    // Base calculation
    let totalScore = Math.floor((adjustedTotal * 4 + (qualityTotal / 15) * 40));

    // Cap score if irrelevant
    if (relevanceScore === 0) {
        totalScore = Math.min(totalScore, 30); // Max 30/100 for off-topic
    }

    // Body Language Simulation
    const bodyLanguage = getBodyLanguageScore();

    const feedbackObj = {
        situation: "N/A", task: "N/A", action: "N/A", result: "N/A", reflection: "N/A",
        clarity: getClarityFeedback(clarityScore),
        structure: getStructureFeedback(structureScore),
        completeness: getCompletenessFeedback(completenessScore),
        bodyLanguage: bodyLanguage.details
    };

    const normalFeedback = {
        situation: getSituationFeedback(situationScore),
        task: getTaskFeedback(taskScore),
        action: getActionFeedback(actionScore),
        result: getResultFeedback(resultScore),
        reflection: getReflectionFeedback(reflectionScore),
        clarity: getClarityFeedback(clarityScore),
        structure: getStructureFeedback(structureScore),
        completeness: getCompletenessFeedback(completenessScore),
        bodyLanguage: bodyLanguage.details
    };

    // Select feedback based on relevance
    const finalFeedback = (relevanceScore === 0) ? feedbackObj : normalFeedback;

    // Force specific suggestion for irrelevance
    let finalSuggestions = generateSuggestions({
        situation_score: situationScore,
        task_score: taskScore,
        action_score: actionScore,
        result_score: resultScore,
        reflection_score: reflectionScore,
        clarity_score: clarityScore,
        structure_score: structureScore,
        completeness_score: completenessScore,
        total_score: totalScore
    });

    if (relevanceScore === 0) {
        finalFeedback.clarity = "Answer appears unrelated to the question.";
        finalFeedback.structure = "Structure is okay, but topic is wrong.";
        finalFeedback.completeness = "Did not answer the prompt.";
        finalSuggestions = ["⚠️ IRRELEVANT: This answer does not address the specific question asked. Please read the prompt carefully."];
    }

    return {
        scores: {
            situation: relevanceScore === 0 ? 0 : situationScore,
            task: relevanceScore === 0 ? 0 : taskScore,
            action: relevanceScore === 0 ? 0 : actionScore,
            result: relevanceScore === 0 ? 0 : resultScore,
            reflection: relevanceScore === 0 ? 0 : reflectionScore,
            clarity: clarityScore,
            structure: structureScore,
            completeness: completenessScore,
            total: totalScore,
            bodyLanguage: bodyLanguage.score
        },
        feedback: finalFeedback,
        suggestions: finalSuggestions
    };
}

function scoreRelevance(answer, question) {
    const topics = [
        { key: "disagree", words: ["disagree", "conflict", "argument", "coworker", "opinion", "different", "view", "perspective", "resolve", "handle", "manager", "team", "clash", "fight", "tension"] },
        { key: "complex", words: ["complex", "problem", "information", "unknown", "data", "figure out", "solve", "ambiguous", "uncertain", "challenge", "difficult", "issue", "situation", "analyze", "investigate", "technical"] },
        { key: "persuade", words: ["persuade", "convince", "stakeholder", "buy-in", "propose", "pitch", "agreement", "negotiate", "idea", "suggestion", "team", "align", "influence"] },
        { key: "mistake", words: ["mistake", "fail", "error", "wrong", "fix", "apologize", "correct", "missed", "regret", "issue", "bug", "accident", "overlooked", "failure"] },
        { key: "prioritize", words: ["prioritize", "deadline", "urgent", "important", "focus", "juggle", "manage", "time", "schedule", "task", "project", "plan", "roadmap"] }
    ];

    // 1. Identify Question Topic
    let questionTopic = null;
    for (const t of topics) {
        if (t.words.some(w => question.toLowerCase().includes(w))) {
            questionTopic = t;
            break;
        }
    }

    if (!questionTopic) return 1; // Unknown question type, be lenient

    // 2. Check overlap with Question Topic
    const questionMatches = questionTopic.words.filter(w => answer.includes(w)).length;
    if (questionMatches > 0) return 2; // Direct match found

    // 3. Check if it matches a DIFFERENT topic strongly (Cross-Topic Check)
    // This catches "I fixed a bug" (Mistake) when asked about "Persuasion"
    let bestOtherMatch = 0;
    let bestOtherTopic = null;

    for (const t of topics) {
        if (t.key === questionTopic.key) continue;
        const matches = t.words.filter(w => answer.includes(w)).length;
        if (matches > bestOtherMatch) {
            bestOtherMatch = matches;
            bestOtherTopic = t.key;
        }
    }

    // If we have 0 matches for the specific question, BUT strong matches (>1) for a totally different topic, PROBABLY IRRELEVANT.
    // Exception: "issue" is in both complex & mistake. "team" is in disagree & persuade.
    // We need to be careful with shared keywords. I'll rely on the unique ones.
    if (bestOtherMatch >= 2) {
        return 0; // Likely answering the wrong question
    }

    // Default to Neutral (1) if no specific topic detected but also no strong wrong topic
    return 1;
}

function scoreSituation(text, wordCount) {
    const keywords = ["when", "time", "situation", "context", "background", "at", "during", "while", "working on", "project"];
    const hasContext = keywords.some(kw => text.includes(kw));
    const hasSpecifics = /\b(last|previous|ago|in \d{4}|month|year|quarter)\b/.test(text);

    if (hasContext && hasSpecifics && wordCount > 30) return 2;
    if (hasContext || hasSpecifics) return 1;
    return 0;
}

function scoreTask(text, wordCount) {
    const keywords = ["needed to", "had to", "was responsible", "my role", "goal was", "objective", "challenge", "problem", "task", "required"];
    const hasTask = keywords.some(kw => text.includes(kw));
    const hasGoal = ["goal", "objective", "achieve", "deliver", "solve"].some(kw => text.includes(kw));

    if (hasTask && hasGoal && wordCount > 20) return 2;
    if (hasTask || hasGoal) return 1;
    return 0;
}

function scoreAction(text, wordCount) {
    const keywords = [
        "i ", "i decided", "i implemented", "i created", "i developed",
        "i analyzed", "i designed", "i proposed", "i worked", "i collaborated",
        "first", "then", "next", "after that", "finally"
    ];

    let actionCount = 0;
    keywords.forEach(kw => {
        if (text.includes(kw)) actionCount++;
    });

    const hasSequence = ["first", "then", "next", "after", "finally"].some(seq => text.includes(seq));

    if (actionCount >= 3 && wordCount > 40) return 2;
    if (actionCount >= 1 || hasSequence) return 1;
    return 0;
}

function scoreResult(text, wordCount) {
    const keywords = ["result", "outcome", "achieved", "delivered", "completed", "increased", "decreased", "reduced", "improved", "saved"];
    const hasResult = keywords.some(kw => text.includes(kw));
    const hasMetrics = /\b\d+\s*%|\b\d+x\b|\$\d+|\d+\s*(users|customers|hours|days|weeks)/.test(text);

    if (hasResult && hasMetrics) return 2;
    if (hasResult || hasMetrics) return 1;
    return 0;
}

function scoreReflection(text, wordCount) {
    const keywords = ["learned", "realized", "discovered", "understood", "insight", "would", "could have", "should have", "next time", "in future", "taught me", "experience showed", "takeaway"];
    const hasReflection = keywords.some(kw => text.includes(kw));
    const hasGrowth = ["would", "will", "next time", "in future", "going forward"].some(phrase => text.includes(phrase));

    if (hasReflection && hasGrowth) return 2;
    if (hasReflection || hasGrowth) return 1;
    return 0;
}

function scoreClarity(text, wordCount) {
    if (wordCount < 20) return 1;
    const lower = text.toLowerCase();

    // Formatting Bonus: Paragraphs
    const paragraphs = text.split(/\n\s*\n/).length;

    const fillerCount = (lower.match(/ um /g) || []).length + (lower.match(/ uh /g) || []).length + (lower.match(/ like /g) || []).length;

    let score = 5;
    if (fillerCount > 3) score -= 1;
    if (wordCount < 50) score -= 1;

    // Bonus for paragraphs in long answers
    if (wordCount > 100 && paragraphs > 1) {
        // Keep score high
    } else if (wordCount > 150 && paragraphs === 1) {
        score -= 1; // Wall of text penalty
    }

    return Math.max(0, score);
}

function scoreStructure(text, textLower) {
    const startSnippet = textLower.slice(0, 100);
    const endSnippet = textLower.slice(-100);

    const hasBeginning = ["when", "time", "situation", "context"].some(kw => startSnippet.includes(kw));
    const hasMiddle = ["i decided", "i implemented", "i then", "next"].some(kw => textLower.includes(kw));
    const hasEnd = ["result", "achieved", "learned", "outcome"].some(kw => endSnippet.includes(kw));

    // Explicit Labeling Check (Situation:, Task:, etc)
    const hasLabels = /situation:|task:|action:|result:/i.test(text);

    if (hasLabels) return 5; // Perfect structure if they explicitly label it

    const structureElements = (hasBeginning ? 1 : 0) + (hasMiddle ? 1 : 0) + (hasEnd ? 1 : 0);

    const transitions = ["first", "then", "next", "after", "finally", "as a result", "therefore"];
    const transitionCount = transitions.filter(t => textLower.includes(t)).length;

    return Math.min(structureElements + Math.min(transitionCount, 2), 5);
}

function scoreCompleteness(textLower, wordCount) {
    const components = {
        context: ["when", "situation", "background"].some(kw => textLower.includes(kw)),
        challenge: ["problem", "challenge", "needed", "had to"].some(kw => textLower.includes(kw)),
        action: ["i implemented", "i created", "i decided"].some(kw => textLower.includes(kw)),
        outcome: ["result", "achieved", "completed"].some(kw => textLower.includes(kw)),
        learning: ["learned", "realized", "would"].some(kw => textLower.includes(kw))
    };

    const componentCount = Object.values(components).filter(Boolean).length;

    if (wordCount < 40) return Math.min(componentCount, 2);
    return componentCount;
}

// Feedback Generators
function getSituationFeedback(score) {
    if (score >= 2) return "Strong context setting with specific details.";
    if (score === 1) return "Some context provided, but could be more specific.";
    return "Missing clear situation/context. Set the scene with when and where.";
}

function getTaskFeedback(score) {
    if (score >= 2) return "Clear task and objective articulated.";
    if (score === 1) return "Task mentioned but could be more explicit about goals.";
    return "Unclear what you needed to accomplish. State your objective.";
}

function getActionFeedback(score) {
    if (score >= 2) return "Detailed actions with clear ownership using 'I' statements.";
    if (score === 1) return "Some actions mentioned, but need more detail or sequence.";
    return "Missing specific actions. Describe what YOU did step-by-step.";
}

function getResultFeedback(score) {
    if (score >= 2) return "Strong results with quantifiable metrics.";
    if (score === 1) return "Results mentioned but lacking specific metrics.";
    return "No clear results stated. Add outcomes and ideally metrics.";
}

function getReflectionFeedback(score) {
    if (score >= 2) return "Excellent reflection with lessons learned and growth mindset.";
    if (score === 1) return "Some reflection, but could elaborate on learnings.";
    return "Missing reflection. What did you learn? What would you do differently?";
}

function getClarityFeedback(score) {
    if (score >= 4) return "Very clear and concise communication.";
    if (score >= 3) return "Mostly clear, minor improvements possible.";
    return "Could be clearer. Reduce filler words and tighten language.";
}

function getStructureFeedback(score) {
    if (score >= 4) return "Well-structured answer with logical flow.";
    if (score >= 3) return "Decent structure, but transitions could be smoother.";
    return "Improve structure. Use beginning, middle, end with clear transitions.";
}

function getCompletenessFeedback(score) {
    if (score >= 4) return "Comprehensive answer covering all STAR components.";
    if (score >= 3) return "Most components covered, minor gaps.";
    return "Incomplete answer. Ensure you cover Situation, Task, Action, Result, Reflection.";
}

// Body Language Heuristic (Simulated)
function getBodyLanguageScore() {
    // In a real app, this would use TensorFlow.js or MediaPipe for facial analysis.
    // Here we simulate a realistic variance for the demo.
    const eyeContact = Math.floor(Math.random() * 3) + 7; // 7-10
    const tone = Math.floor(Math.random() * 3) + 7; // 7-10
    const pacing = Math.floor(Math.random() * 4) + 6; // 6-9

    const average = Math.floor((eyeContact + tone + pacing) / 3 * 10);

    return {
        score: average,
        details: {
            eyeContact: eyeContact >= 8 ? "Good eye contact maintained." : "Try to look at the camera more consistently.",
            tone: tone >= 8 ? "Confident and clear tone." : "Voice projection could be stronger.",
            pacing: pacing >= 8 ? "Excellent pacing." : "A bit fast, try to slow down slightly."
        }
    };
}


function generateSuggestions(result) {
    const suggestions = [];

    if (result.situation_score < 2) suggestions.push("🎯 Add more context: Start with 'When I was working on...' and include timeframe/setting.");
    if (result.task_score < 2) suggestions.push("🎯 Clarify your goal: Explicitly state what you needed to accomplish and why it mattered.");
    if (result.action_score < 2) suggestions.push("🎯 Detail your actions: Use 'I' statements and describe your specific steps sequentially.");
    if (result.result_score < 2) suggestions.push("🎯 Quantify results: Add metrics like '20% improvement' or 'saved 10 hours per week'.");
    if (result.reflection_score < 2) suggestions.push("🎯 Add reflection: Share what you learned and how you'd apply it in the future.");

    if (result.clarity_score < 3) suggestions.push("💡 Improve clarity: Reduce filler words and keep sentences focused.");
    if (result.structure_score < 3) suggestions.push("💡 Enhance structure: Use transition words like 'First', 'Then', 'As a result'.");
    if (result.completeness_score < 3) suggestions.push("💡 Be more complete: Make sure to touch on all aspects of the experience.");

    if (result.total_score >= 80) suggestions.unshift("✨ Excellent answer! You covered the STAR framework comprehensively.");
    else if (result.total_score >= 60) suggestions.unshift("👍 Good answer! A few refinements will make it even stronger.");

    return suggestions;
}
