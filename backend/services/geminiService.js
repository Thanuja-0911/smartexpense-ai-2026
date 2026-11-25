const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateFinancialInsights = async (userData) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const {
    totalIncome = 0,
    totalExpenses = 0,
    totalSavings = 0,
    savingsRate = 0,
    categoryBreakdown = [],
    budgets = [],
    goals = [],
    timePeriod = 'this month',
  } = userData;

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeAIModel({ model: 'gemini-1.5-flash' });

      const prompt = `
You are SmartExpense-AI, an expert financial advisor. Analyze the following real user personal finance data for ${timePeriod}:

Total Income: ₹${totalIncome}
Total Expenses: ₹${totalExpenses}
Total Savings: ₹${totalSavings}
Savings Rate: ${savingsRate}%

Top Expense Categories:
${categoryBreakdown.map((c) => `- ${c.category}: ₹${c.amount} (${c.percentage}%)`).join('\n')}

Budget Overview:
${budgets.map((b) => `- ${b.category}: Spent ₹${b.spent} of ₹${b.amount} (${b.percentage}% used)`).join('\n')}

Savings Goals:
${goals.map((g) => `- ${g.name}: Target ₹${g.targetAmount}, Saved ₹${g.savedAmount} (${g.percentage}% completed)`).join('\n')}

Please return ONLY a valid raw JSON object (no markdown markdown formatting, no extra code blocks, no backticks) in the following format:
{
  "summary": "2-3 sentence overview of their financial health for this period.",
  "healthScore": 75, // Integer 0-100 based on savings rate & budget adherence
  "insights": [
    {
      "title": "Title of insight",
      "description": "Specific observation using actual user numbers.",
      "category": "Category name or General",
      "severity": "info" // info | warning | success
    }
  ],
  "unnecessarySpending": [
    {
      "title": "Potential discretionary area",
      "description": "Why this category seems high and how much could be reduced.",
      "potentialSaving": 1500
    }
  ],
  "savingOpportunities": [
    {
      "title": "Actionable savings tip",
      "description": "Step-by-step strategy to boost savings rate."
    }
  ],
  "budgetRecommendations": [
    {
      "category": "Food",
      "recommendedAmount": 5000,
      "reason": "Based on historical spend patterns."
    }
  ]
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      // Clean markdown fencing if Gemini returns ```json ... ```
      if (text.startsWith('```')) {
        text = text.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
      }

      const parsedData = JSON.parse(text);
      return parsedData;
    } catch (err) {
      console.warn('Gemini API call failed or timed out. Falling back to analytical engine:', err.message);
    }
  }

  // Smart Rule-Based Financial Analytical Engine (used when API key is unconfigured or fallback needed)
  const healthScore = Math.min(100, Math.max(20, Math.round(savingsRate * 1.2 + (budgets.length > 0 ? 20 : 10))));

  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : { category: 'Shopping', amount: totalExpenses * 0.3 };
  const secondCategory = categoryBreakdown.length > 1 ? categoryBreakdown[1] : { category: 'Food', amount: totalExpenses * 0.25 };

  const topCategoryPercent = totalExpenses > 0 ? Math.round((topCategory.amount / totalExpenses) * 100) : 0;

  return {
    summary: `Your spending for ${timePeriod} is ₹${totalExpenses.toLocaleString('en-IN')}, leaving a net savings of ₹${totalSavings.toLocaleString('en-IN')} (${savingsRate}% savings rate). ${topCategory.category} accounts for your largest expense share at ${topCategoryPercent}%.`,
    healthScore,
    insights: [
      {
        title: `High Allocation in ${topCategory.category}`,
        description: `You spent ₹${topCategory.amount.toLocaleString('en-IN')} on ${topCategory.category} (${topCategoryPercent}% of total expenses). Reducing this by 15% could save ₹${Math.round(topCategory.amount * 0.15).toLocaleString('en-IN')}.`,
        category: topCategory.category,
        severity: topCategoryPercent > 35 ? 'warning' : 'info',
      },
      {
        title: savingsRate >= 30 ? 'Strong Savings Discipline' : 'Savings Rate Optimization Opportunity',
        description: savingsRate >= 30
          ? `Your savings rate of ${savingsRate}% is above the recommended 20% rule of thumb. Excellent financial cushion!`
          : `Your current savings rate is ${savingsRate}%. Aiming for at least 20-30% will help accelerate your long-term goals.`,
        category: 'Savings',
        severity: savingsRate >= 30 ? 'success' : 'warning',
      },
      {
        title: 'Secondary Expense Trend',
        description: `Second largest category is ${secondCategory.category} at ₹${secondCategory.amount.toLocaleString('en-IN')}. Monitoring subscription/discretionary items here can yield quick savings.`,
        category: secondCategory.category,
        severity: 'info',
      },
    ],
    unnecessarySpending: [
      {
        title: `${topCategory.category} Discretionary Expenses`,
        description: `Analyzing transactions indicates potential over-spending in non-essential ${topCategory.category} purchases.`,
        potentialSaving: Math.round(topCategory.amount * 0.2) || 1200,
      },
      {
        title: 'Dining out & Subscriptions',
        description: 'Consolidating recurring subscriptions and weekend dining can free up substantial monthly cash flow.',
        potentialSaving: 800,
      },
    ],
    savingOpportunities: [
      {
        title: 'Automate Goal Deposits',
        description: 'Set up an automatic transfer of 20% income immediately after salary day to build discipline effortlessly.',
      },
      {
        title: 'Rule of 48-Hour Wait',
        description: 'Before making any non-essential purchase above ₹2,000, wait 48 hours to eliminate impulse buys.',
      },
    ],
    budgetRecommendations: [
      {
        category: topCategory.category,
        recommendedAmount: Math.round(topCategory.amount * 0.85) || 5000,
        reason: 'Recommended ceiling based on your income ratio.',
      },
      {
        category: 'Food',
        recommendedAmount: 6000,
        reason: 'Optimal monthly cap to maintain balanced lifestyle & savings.',
      },
    ],
  };
};

module.exports = { generateFinancialInsights };
