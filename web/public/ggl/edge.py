from .ggl_logging import new_logger

logger = new_logger(__name__)


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
                logger.error(
                    f'Edge {self} already outputs to {name} of {node}')
                found = True
        if not found:
            self.points.append(EdgePoint(node, name))


class Edge:
    """
    Edges (wires) are connections which carry values between Nodes
    """

    def __init__(self, srcnode, srcname, dstnode, dstname, js_id=None):
        """
        __init__() initializes an Edge with the object and endpoint name
        for the output (source) Node and the input (dest) Node.
        """
        self.srcpoint = EdgePoint(srcnode, srcname)
        self.destpoints = EdgePoints(dstnode, dstname)
        self.value = 0
        self.prev_value = None                  # track previous value
        self.js_id = js_id

    def get_dest_nodes(self):
        return self.destpoints.get_dest_nodes()

    def propagate(self, value=0, output_name='0', bits=0):
        """
        Edges simply carry the value
        The reason Edges don't propagate to their outpoints (as Nodes do)
        is that would create a depth-first traversal, and the Circuit 
        simulation runs a work queue which is populated breadth-first
        """

        if self.js_id is not None:
            try:
                import builtins
                # If we have a JS object ID and we're running under pyodide,
                # use the pyodide API to update the value of the JS object
                if self.js_id and hasattr(builtins, 'updateCallback'):
                    active = value == 1
                    updateCallback = builtins.updateCallback
                    updateCallback('step', self.js_id, {'active': active, 'style': 'processing'})
            except Exception as e:
                logger.error(f'Callback failed: {e}')
        self.value = value
        return self.get_dest_nodes()
