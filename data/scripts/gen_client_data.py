# python data/scripts/gen_client_data.py
import json
import numpy as np
import umap # type: ignore
from typing import TypedDict

MAJOR_DATA_PATH = 'data/major_data.json'
OUTPUT_PATH = 'public/data.json'

class MajorData(TypedDict):
    学科门类: str
    专业类: str
    专业名称: str
    专业代码: str
    简介: str
    知识结构与学习方式: str
    人格特质与能力要求: str
    就业方向与竞争门槛: str
    未来发展与常见误解: str
    人生状态与自我实现: str
    embedding: list[float] # 1024 维向量

class ClientData(TypedDict):
    学科门类: str
    专业类: str
    专业名称: str
    专业代码: str
    简介: str
    embedding: list[float] # 2 维向量

reducer = umap.UMAP(
    n_neighbors=50, # 这个值可以根据数据的密度进行调整，较大的值会考虑更多的邻居，适合较稀疏的数据；较小的值会更关注局部结构，适合较密集的数据
    min_dist=0.5, # 这个值控制了降维后点之间的最小距离，较小的值会使得点更紧密地聚集在一起，适合需要强调局部结构的数据；较大的值会使得点更分散，适合需要强调全局结构的数据
    n_components=2, # 降维到二维，方便可视化
    metric='cosine', # 使用余弦距离来衡量高维空间中的点之间的相似度，这对于文本数据的向量表示通常是一个不错的选择，因为它关注的是向量之间的角度关系，而不是它们的绝对距离
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
        '简介': item['简介'],
        'embedding': item['embedding'],
    })

print('开始降维...')
reduce_result = reducer.fit_transform(np.array([item['embedding'] for item in to_reduce_data])) # type: ignore

reduced_data: list[ClientData] = []

for item, coord in zip(to_reduce_data, reduce_result): # type: ignore
    reduced_data.append({
        '学科门类': item['学科门类'],
        '专业类': item['专业类'],
        '专业名称': item['专业名称'],
        '专业代码': item['专业代码'],
        '简介': item['简介'],
        'embedding': [float(coord[0]), float(coord[1])], # type: ignore
    })

# 标准化
print('开始标准化...')
std1 = np.std([item['embedding'][0] for item in reduced_data])
std2 = np.std([item['embedding'][1] for item in reduced_data])
mean1 = np.mean([item['embedding'][0] for item in reduced_data])
mean2 = np.mean([item['embedding'][1] for item in reduced_data])
for item in reduced_data:
    item['embedding'][0] = (item['embedding'][0] - mean1) / std1 # type: ignore
    item['embedding'][1] = (item['embedding'][1] - mean2) / std2 # type: ignore

# 保存结果
with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(reduced_data, f, ensure_ascii=False)
print(f'结果已保存到 {OUTPUT_PATH}')
