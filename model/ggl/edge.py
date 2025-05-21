import logging

logger = logging.getLogger('edge')

class EdgePoint:
    """
    A single EdgePoint specifies the Node and endpoint name (e.g. 'cin')
    that an Edge connects to
    """
    def __init__(self, node, name):
        self.node = node
        self.name = name

class EdgePoints:
    """
    EdgePoints is a list of EdgePoint objects
    """
    def __init__(self, node, name):
        self.points = [EdgePoint(node, name)]

    def get_dest_nodes(self):
        return [p.node for p in self.points]

    def append(self, node, name):
        """
        append() adds a unique Node and endpoint name (e.g. 'cin' to the list
        """
        found = False
        for p in self.points:
            if p.name == name and p.node == node:
                logger.error(f'Edge {self} already outputs to {name} of {node}')
                found = True
        if not found:
            self.points.append(EdgePoint(node, name))

class Edge:
    """
    Edges (wires) are connections which carry values between Nodes
    """
    def __init__(self, srcnode, srcname, dstnode, dstname):
        """
        __init__() initializes an Edge with the object and endpoint name
        for the output (source) Node and the input (dest) Node.
        """
        self.srcpoint = EdgePoint(srcnode, srcname)
        self.destpoints = EdgePoints(dstnode, dstname)
        self.value = 0

    def get_dest_nodes(self):
        return self.destpoints.get_dest_nodes()

    def propagate(self, value=0):
        """
        Edges simply carry the value
        The reason Edges don't propagate to their outpoints (as Nodes do)
        is that would create a depth-first traversal, and the Circuit 
        simulation runs a work queue which is populated breadth-first
        """
        self.value = value
