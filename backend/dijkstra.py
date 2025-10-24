import heapq

class Graph:
    def __init__(self):
        self.adj = {}

    def add_edge(self, u, v, w):
        self.adj.setdefault(u, []).append((v, w))

    def dijkstra(self, source):
        dist = {}
        prev = {}
        for node in self.adj.keys():
            dist[node] = float('inf')
            prev[node] = None
        dist[source] = 0
        pq = [(0, source)]
        while pq:
            d, u = heapq.heappop(pq)
            if d > dist.get(u, float('inf')):
                continue
            for v, w in self.adj.get(u, []):
                alt = d + w
                if alt < dist.get(v, float('inf')):
                    dist[v] = alt
                    prev[v] = u
                    heapq.heappush(pq, (alt, v))
        return dist, prev

    def reconstruct_path(self, prev, source, target):
        if target == source:
            return [source]
        path = []
        cur = target
        while cur is not None:
            path.append(cur)
            if cur == source:
                break
            cur = prev.get(cur)
        return list(reversed(path))
