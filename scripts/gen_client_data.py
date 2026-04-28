import json
import numpy as np
import umap
from typing import TypedDict

MAJOR_DATA_PATH = 'data/major_data.json'
OUTPUT_PATH = 'src/data.json'

class MajorData(TypedDict):
    学科门类: str
    专业类: str
    专业名称: str
    专业代码: str
    定义与本质: str
    知识结构: str
    学习方式: str
    适合人群: str
    常见误解: str
    就业方向: str
    竞争与门槛: str
    校际差异: str
    高中准备: str
    未来发展: str
    embedding: list[float] # 1024 维向量

class ClientData(TypedDict):
    学科门类: str
    专业类: str
    专业名称: str
    专业代码: str
    定义与本质: str
    embedding: list[float] # 2 维向量

reducer = umap.UMAP(
    n_neighbors=30,
    min_dist=0.2,
    n_components=2,
    metric='cosine',
)

with open(MAJOR_DATA_PATH, 'r', encoding='utf-8') as f:
    original_data = json.load(f)

to_reduce_data: list[ClientData] = []

for item in original_data:
    to_reduce_data.append({
        '学科门类': item['学科门类'],
        '专业类': item['专业类'],
        '专业名称': item['专业名称'],
        '专业代码': item['专业代码'],
        '定义与本质': item['定义与本质'],
        'embedding': item['embedding'],
    })

reduce_result = reducer.fit_transform(np.array([item['embedding'] for item in to_reduce_data]))

reduced_data: list[ClientData] = []

for item, coord in zip(to_reduce_data, reduce_result):
    reduced_data.append({
        '学科门类': item['学科门类'],
        '专业类': item['专业类'],
        '专业名称': item['专业名称'],
        '专业代码': item['专业代码'],
        '定义与本质': item['定义与本质'],
        'embedding': [float(coord[0]), float(coord[1])],
    })

std1 = np.std([item['embedding'][0] for item in reduced_data])
std2 = np.std([item['embedding'][1] for item in reduced_data])
mean1 = np.mean([item['embedding'][0] for item in reduced_data])
mean2 = np.mean([item['embedding'][1] for item in reduced_data])

for item in reduced_data:
    item['embedding'][0] = (item['embedding'][0] - mean1) / std1
    item['embedding'][1] = (item['embedding'][1] - mean2) / std2

with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(reduced_data, f, ensure_ascii=False, indent=2)
