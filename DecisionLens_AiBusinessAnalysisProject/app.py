
import streamlit as st
import pandas as pd
import plotly.express as px

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

st.set_page_config(
    page_title="DecisionLens AI",
    page_icon="🔎",
    layout="wide"
)

st.title("🔎 DecisionLens AI")
st.caption("Think clearly. Decide confidently.")

st.markdown(
    "An explainable decision-support tool "
    "for comparing alternatives and identifying risks."
)

st.header("1. Define Your Decision")

decision = st.text_area(
    "Describe the decision you need to make",
    placeholder="Example: Choose a cloud platform for a new software project."
)

st.header("2. Add Your Alternatives")

num_options = st.number_input(
    "Number of alternatives",
    min_value=2,
    max_value=5,
    value=3
)

alternatives = {}

for i in range(int(num_options)):

    with st.expander(f"Alternative {i+1}", expanded=True):

        name = st.text_input(
            "Alternative name",
            value=["AWS", "Azure", "Google Cloud", "Option 4", "Option 5"][i],
            key=f"name_{i}"
        )

        description = st.text_area(
            "Description",
            key=f"description_{i}"
        )

        alternatives[name] = description

st.header("3. Define Evaluation Criteria")

criteria_names = [
    "Cost",
    "Security",
    "Scalability",
    "Ease of Use"
]

weights = {}

cols = st.columns(4)

for i, criterion in enumerate(criteria_names):

    with cols[i]:

        weights[criterion] = st.number_input(
            criterion + " weight (%)",
            min_value=0,
            max_value=100,
            value=[30, 30, 25, 15][i],
            key=f"weight_{i}"
        )

st.info(
    f"Total weight: {sum(weights.values())}% "
    "(must equal 100%)"
)

st.header("4. Score Each Alternative")

scores = {}

for name in alternatives:

    scores[name] = {}

    with st.expander(f"Scores for {name}"):

        cols = st.columns(4)

        for i, criterion in enumerate(criteria_names):

            with cols[i]:

                scores[name][criterion] = st.slider(
                    criterion,
                    min_value=1,
                    max_value=10,
                    value=7,
                    key=f"score_{name}_{criterion}"
                )

risk_keywords = {
    "Financial Risk": [
        "expensive", "high cost", "budget",
        "pricing", "costly"
    ],
    "Security Risk": [
        "vulnerability", "weak security",
        "data breach", "security issue"
    ],
    "Scalability Risk": [
        "limited scalability", "capacity",
        "performance limitation"
    ],
    "Operational Risk": [
        "complex", "difficult to manage",
        "maintenance", "technical complexity"
    ],
    "Dependency Risk": [
        "vendor lock-in", "vendor dependency",
        "proprietary"
    ]
}

if st.button("Analyze Decision", type="primary"):

    if not decision.strip():
        st.error("Please describe your decision.")

    elif any(not n.strip() for n in alternatives):
        st.error("Please enter a name for every alternative.")

    elif any(not d.strip() for d in alternatives.values()):
        st.error("Please describe every alternative.")

    elif len(set(alternatives.keys())) != len(alternatives):
        st.error("Alternative names must be unique.")

    elif sum(weights.values()) != 100:
        st.error("Evaluation weights must total 100%.")

    else:

        documents = [decision] + list(alternatives.values())

        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2)
        )

        matrix = vectorizer.fit_transform(documents)

        similarities = cosine_similarity(
            matrix[0:1],
            matrix[1:]
        )[0]

        results = []

        for (name, description), similarity in zip(
            alternatives.items(), similarities
        ):

            decision_score = sum(
                scores[name][criterion] *
                weights[criterion] / 100
                for criterion in criteria_names
            )

            relevance = float(similarity) * 100

            final_score = (
                0.7 * decision_score +
                0.3 * (relevance / 10)
            )

            description_lower = description.lower()

            risks = {
                risk: [
                    word for word in keywords
                    if word in description_lower
                ]
                for risk, keywords in risk_keywords.items()
            }

            risks = {
                risk: evidence
                for risk, evidence in risks.items()
                if evidence
            }

            results.append({
                "Alternative": name,
                "Decision Score": round(decision_score, 2),
                "NLP Relevance": round(relevance, 2),
                "Final Score": round(final_score, 2),
                "Detected Risks": len(risks),
                "Risk Details": risks
            })

        report = pd.DataFrame(results)

        report = report.sort_values(
            "Final Score",
            ascending=False
        ).reset_index(drop=True)

        st.success("Decision analysis completed!")

        st.header("5. Analysis Results")

        best = report.iloc[0]

        st.metric(
            "Top Ranked Alternative",
            best["Alternative"],
            f"{best['Final Score']}/10"
        )

        st.subheader("Alternative Ranking")

        st.dataframe(
            report[
                [
                    "Alternative",
                    "Decision Score",
                    "NLP Relevance",
                    "Final Score",
                    "Detected Risks"
                ]
            ],
            use_container_width=True
        )

        fig = px.bar(
            report,
            x="Alternative",
            y="Final Score",
            color="Final Score",
            text="Final Score",
            title="Final Alternative Ranking"
        )

        fig.update_layout(template="plotly_white")

        st.plotly_chart(
            fig,
            use_container_width=True
        )

        st.header("6. Risk Analysis")

        for _, row in report.iterrows():

            with st.expander(
                f"{row['Alternative']} — "
                f"{row['Detected Risks']} flagged risks"
            ):

                if row["Risk Details"]:

                    for risk, evidence in row["Risk Details"].items():

                        st.warning(
                            f"{risk}: Evidence found: "
                            f"{', '.join(evidence)}"
                        )

                else:
                    st.success(
                        "No keyword-based risk signals detected."
                    )

        st.header("7. Explainable Recommendation")

        st.write(
            f"The highest-ranked alternative is "
            f"**{best['Alternative']}**, based on the "
            f"criteria and weights you supplied."
        )

        st.write(
            "This is a ranking of the provided inputs, "
            "not a guarantee that this alternative is objectively best."
        )

        st.download_button(
            "Download Decision Report",
            report.drop(columns=["Risk Details"]).to_csv(index=False),
            file_name="decisionlens_report.csv",
            mime="text/csv"
        )
