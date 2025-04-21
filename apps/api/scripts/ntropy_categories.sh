curl -X "POST" \
    "https://api.ntropy.com/v3/categories/consumer" \
    -H "Accept: application/json" \
    -H "X-API-KEY: $NTROPY_API_KEY"  \
    -H "Content-Type: application/json" \
    -d '{
        "incoming": [
            "earned income",
            "investment income and withdrawals",
            "refunds and reimbursements",
            "transfers in",
            "loans and advances received",
            "misc income",
            "cash deposits",
            "other incoming"
        ],
        "outgoing": [
            "housing",
            "transportation",
            "groceries",
            "food and dining out",
            "shopping and goods",
            "entertainment and recreation",
            "health and wellness",
            "personal care and services",
            "subscriptions and digital services",
            "debt and loan payments",
            "investments and savings",
            "insurance",
            "taxes and government fees",
            "travel",
            "fees and charges",
            "gifts and donations",
            "cash withdrawals",
            "transfers out",
            "education",
            "other outgoing"
        ]
    }'