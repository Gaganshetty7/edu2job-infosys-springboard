import pandas as pd

# change this to your CSV file path
CSV_PATH = "dataset.csv"

df = pd.read_csv(CSV_PATH)

# adjust these names if your columns differ
degree_col = "qualification"
skills_col = "skills"
exp_col = "experience_level"

# unique degrees
unique_degrees = (
    df[degree_col]
    .dropna()
    .astype(str)
    .str.strip()
    .unique()
)

# experience levels
unique_experience = (
    df[exp_col]
    .dropna()
    .astype(str)
    .str.strip()
    .unique()
)

# NOTE: skills are usually comma separated — we split them properly
all_skills = []

for s in df[skills_col].dropna():
    parts = [p.strip() for p in str(s).split(",") if p.strip()]
    all_skills.extend(parts)

unique_skills = sorted(set(all_skills))

print("DEGREES:", list(unique_degrees))
print("EXPERIENCE:", list(unique_experience))
print("SKILLS:", unique_skills)
