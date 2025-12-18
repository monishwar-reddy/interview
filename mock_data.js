/**
 * MOCK DATA
 * Standardized loan data for hackathon demo purposes
 */

const MOCK_LOANS = [
    {
        id: "l_001",
        borrower: "TechFlow Systems Ltd",
        amount: 25000000,
        currency: "USD",
        sector: "SaaS",
        extractedDate: "2024-10-15",
        covenants: [
            {
                type: "Leverage Ratio",
                threshold: 4.0,
                condition: "max",
                current_value: 3.2,
                status: "safe"
            },
            {
                type: "Interest Coverage Ratio",
                threshold: 3.0,
                condition: "min",
                current_value: 3.5,
                status: "safe"
            }
        ],
        raw_text: "The Borrower shall maintain a Leverage Ratio not exceeding 4.00:1.00 calculated on a rolling four-quarter basis. The Interest Coverage Ratio shall not be less than 3.00:1.00."
    },
    {
        id: "l_002",
        borrower: "GreenField Agriculture Inc",
        amount: 12000000,
        currency: "USD",
        sector: "Agriculture",
        extractedDate: "2024-11-01",
        covenants: [
            {
                type: "Debt Service Coverage Ratio",
                threshold: 1.25,
                condition: "min",
                current_value: 1.10,
                status: "danger"
            }
        ],
        raw_text: "Borrower must maintain a Debt Service Coverage Ratio (DSCR) of at least 1.25x at all times."
    }
];

const MOCK_EXTRACTED_TERMS = {
    borrower: "Demo Corp International",
    amount: "50,000,000 USD",
    date: "2024-12-10",
    covenants: [
        { name: "Net Leverage Ratio", limit: "3.50x", type: "Financial" },
        { name: "Interest Coverage", limit: "Min 2.50x", type: "Financial" },
        { name: "Capex Limit", limit: "$5M / year", type: "Negative" }
    ]
};
