# County Health Analytics — Mini Project 2a

Interactive visual analytics dashboard built with **Next.js 14**, **D3.js v7**, and **Tailwind CSS**.  
Python (scikit-learn) handles PCA and K-Means computation.

## Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Frontend  | Next.js 14 (App Router), TypeScript       |
| Charts    | D3.js v7                                  |
| Styling   | Tailwind CSS v3                           |
| Backend   | Python · scikit-learn · Flask (optional)  |

## Project Structure

```
analytics-app/
├── public/
│   └── data/
│       └── pca_data.json          ← precomputed data (committed)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx               ← server component, loads JSON
│   │   └── globals.css
│   ├── components/
│   │   ├── Dashboard.tsx          ← root client component, holds state
│   │   ├── Header.tsx
│   │   ├── Panel.tsx              ← reusable card wrapper
│   │   ├── ScreePlot.tsx          ← Task 1: PCA eigenvalue bar chart
│   │   ├── KMeansPlot.tsx         ← Task 3: elbow plot
│   │   ├── Biplot.tsx             ← Task 1: PCA biplot with loadings
│   │   ├── AttributeTable.tsx     ← Task 2: top-4 attributes + legend
│   │   └── ScatterplotMatrix.tsx  ← Task 2: 4×4 SPLOM
│   └── lib/
│       ├── types.ts               ← shared TypeScript interfaces
│       ├── constants.ts           ← cluster colors, margins
│       └── TooltipContext.tsx     ← global hover tooltip via React context
└── server.py                      ← Python backend (precompute or serve)
```

## Quick Start

### 1. Precompute data (Python)

```bash
# Place merged_full_analysis_dataset.csv next to server.py
pip install scikit-learn pandas numpy flask flask-cors
python server.py --precompute      # writes public/data/pca_data.json
```

### 2. Run Next.js dev server

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Optional: run Flask API alongside

```bash
python server.py                   # API at http://localhost:5001/api/data
```

## Features

### Task 1 — PCA
- **Scree plot**: eigenvalue bar chart with cumulative variance overlay (dashed red) and 85% threshold line
- Click any bar to set **intrinsic dimensionality dᵢ** — highlighted bars update instantly
- **Biplot**: all 283 county points projected onto PC1/PC2, colored by cluster; loading arrows for all 20 attributes

### Task 2 — Scatterplot Matrix
- Top 4 attributes selected by highest Σ(loading²) across first dᵢ PCA components
- Displayed in ranked table with scores
- **4×4 SPLOM**: off-diagonal = scatter, diagonal = attribute label + mini histogram; points colored by cluster

### Task 3 — K-Means
- **Elbow plot**: MSE (inertia) vs k=1…10 with connecting line; click any bar to change k
- All views re-render instantly when k changes
- Cluster colors consistent across biplot, SPLOM, and legend

## Interactions

| Element        | Action                        | Effect                              |
|----------------|-------------------------------|-------------------------------------|
| Scree bar      | Click                         | Change dᵢ; update attribute table  |
| Elbow bar      | Click                         | Change k; recolor all scatter views |
| Any data point | Hover                         | Tooltip: county, state, values      |
| Loading arrow  | Hover                         | Tooltip: attribute name + loadings  |
