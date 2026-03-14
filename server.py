"""
server.py — Python analytics backend
Computes PCA + K-Means and writes output to public/data/pca_data.json.

Usage:
  pip install flask flask-cors scikit-learn pandas numpy
  python server.py              # runs Flask API on :5001
  python server.py --precompute # just writes JSON, no server

The Next.js frontend reads public/data/pca_data.json directly.
"""
import argparse
import json
import os
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

DATA_PATH = os.path.join(os.path.dirname(__file__), 'public', 'data')
CSV_PATH  = os.path.join(os.path.dirname(__file__), 'merged_full_analysis_dataset.csv')
OUT_PATH  = os.path.join(DATA_PATH, 'pca_data.json')

NUM_COLS = [
    'Years of Potential Life Lost Rate', 'Average Number of Physically Unhealthy Days',
    'Average Number of Mentally Unhealthy Days', '% Fair or Poor Health', 'Injury Death Rate',
    'Primary Care Physicians Rate', '% Uninsured', '% Unemployed', 'Income Ratio',
    '% Children in Poverty', 'Median Household Income', 'Life Expectancy',
    'Drug Overdose Mortality Rate', 'Firearm Fatalities Rate', 'Homicide Rate',
    'High School Graduation Rate', '% Adults with Obesity', '% Adults Reporting Currently Smoking',
    '% Rural', 'Population',
]


def compute(csv_path: str = CSV_PATH) -> dict:
    df = pd.read_csv(csv_path)
    df_clean = df.dropna(subset=NUM_COLS).copy()
    print(f"  Clean rows: {len(df_clean)}")

    X = df_clean[NUM_COLS].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # ── PCA ───────────────────────────────────────────────────
    pca = PCA()
    X_pca = pca.fit_transform(X_scaled)
    cumvar = np.cumsum(pca.explained_variance_ratio_)

    # Intrinsic dimensionality: first component where cumvar >= 85 %
    di = int(next((i + 1 for i, cv in enumerate(cumvar) if cv >= 0.85), len(cumvar)))

    # Top-4 attributes: highest Σ(loading²) across the first di components
    loadings = pca.components_[:di]          # shape (di, n_features)
    sq_sum   = (loadings ** 2).sum(axis=0)   # shape (n_features,)
    top4_idx = np.argsort(sq_sum)[-4:][::-1]
    top4_attrs  = [NUM_COLS[i] for i in top4_idx]
    top4_scores = [float(sq_sum[i]) for i in top4_idx]

    # ── K-Means k = 1 … 10 ───────────────────────────────────
    mse_list   = []
    all_labels = {}
    for k in range(1, 11):
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        km.fit(X_scaled)
        mse_list.append(float(km.inertia_))
        all_labels[k] = km.labels_.tolist()

    # Elbow via second derivative
    arr   = np.array(mse_list)
    best_k = int(np.argmax(np.diff(np.diff(arr))) + 2)

    # ── Assemble output ───────────────────────────────────────
    points = []
    for i, (_, row) in enumerate(df_clean.iterrows()):
        pt: dict = {
            'county': row['County'],
            'state':  row['State'],
            'pc1':    float(X_pca[i, 0]),
            'pc2':    float(X_pca[i, 1]),
        }
        for attr in top4_attrs:
            pt[attr] = float(row[attr])
        for k in range(1, 11):
            pt[f'cluster_{k}'] = int(all_labels[k][i])
        points.append(pt)

    loading_vectors = [
        {'attr': NUM_COLS[i], 'pc1': float(pca.components_[0, i]), 'pc2': float(pca.components_[1, i])}
        for i in range(len(NUM_COLS))
    ]

    return {
        'eigenvalues':       pca.explained_variance_.tolist(),
        'explained_var_ratio': pca.explained_variance_ratio_.tolist(),
        'cumulative_var':    cumvar.tolist(),
        'di':                di,
        'best_k':            best_k,
        'mse':               mse_list,
        'loading_vectors':   loading_vectors,
        'top4_attrs':        top4_attrs,
        'top4_scores':       top4_scores,
        'points':            points,
        'n_components':      int(len(pca.explained_variance_)),
        'components': pca.components_.tolist(),  # full loading matrix
    }


def precompute():
    print("Computing PCA + K-Means …")
    result = compute()
    os.makedirs(DATA_PATH, exist_ok=True)
    with open(OUT_PATH, 'w') as f:
        json.dump(result, f)
    print(f"  Saved → {OUT_PATH}")
    print(f"  di={result['di']}, best_k={result['best_k']}")
    print(f"  top4: {result['top4_attrs']}")


def run_server():
    from flask import Flask, jsonify
    from flask_cors import CORS

    precompute()
    data = json.load(open(OUT_PATH))

    app = Flask(__name__)
    CORS(app)

    @app.route('/api/data')
    def api_data():
        return jsonify(data)

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok'})

    print("Flask API running at http://localhost:5001/api/data")
    app.run(port=5001, debug=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--precompute', action='store_true', help='Only write JSON, no server')
    args = parser.parse_args()

    if args.precompute:
        precompute()
    else:
        run_server()
