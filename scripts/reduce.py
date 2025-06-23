import json
import numpy as np
import umap

with open('lib/data.json', 'r', encoding='utf-8') as f:
    original_data = json.load(f)

items = original_data['data']

vectors = np.array([item['专业描述向量'] for item in items])

reducer = umap.UMAP(
    n_neighbors=30,
    min_dist=0.2,
    n_components=2,
    metric='cosine',
)

embedding = reducer.fit_transform(vectors)

for item, coord in zip(items, embedding):
    item['专业描述向量'] = [float(coord[0]), float(coord[1])]

std1 = np.std([item['专业描述向量'][0] for item in items])
std2 = np.std([item['专业描述向量'][1] for item in items])
mean1 = np.mean([item['专业描述向量'][0] for item in items])
mean2 = np.mean([item['专业描述向量'][1] for item in items])
for item in items:
    item['专业描述向量'][0] = (item['专业描述向量'][0] - mean1) / std1
    item['专业描述向量'][1] = (item['专业描述向量'][1] - mean2) / std2

with open('client/public/data_umap.json', 'w', encoding='utf-8') as f:
    json.dump(original_data, f, ensure_ascii=False, indent=2)
