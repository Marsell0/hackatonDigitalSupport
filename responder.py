from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.neighbors import BallTree
from sklearn.base import BaseEstimator
from sklearn.pipeline import make_pipeline

import pandas as pd

import numpy as np

data = pd.read_csv('data.tsv', sep='\t')

vectorizer = TfidfVectorizer()

vectorizer.fit(data.que)
matrix_big = vectorizer.transform(data.que)

svd = TruncatedSVD(n_components=11)
svd.fit(matrix_big)

matrix_small = svd.transform(matrix_big)


def softmax(x):
    proba = np.exp(-x)
    return proba / sum(proba)


class NeighborSampler(BaseEstimator):
    def __init__(self, k=5, temperature=1.0):
        self.k = k
        self.temperature = temperature

    def fit(self, X, y):
        self.tree_ = BallTree(X)
        self.y_ = np.array(y)

    def predict(self, X, random_state=None):
        distances, indices = self.tree_.query(X, return_distance=True, k=self.k)
        result = []

        for distance, index in zip(distances, indices):
            result.append(np.random.choice(index, p=softmax(distance * self.temperature)))

        return self.y_[result]


ns = NeighborSampler()

ns.fit(matrix_small, data.ans)

pipe = make_pipeline(vectorizer, svd, ns)


def reply(question: str) -> str:
    return pipe.predict([question])[0]
