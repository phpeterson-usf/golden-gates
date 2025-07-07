from .edge import Edge
from .node import Node, Connector
from .ggl_logging import get_logger, set_global_js_logging

logger = get_logger('circuit')

MAX_ITERATIONS = 100  # Prevent infinite loops

class Circuit:
    """
    Circuits are a collection of Nodes which may be run()
    to produce a value in Output Nodes
    """
    def __init__(self, label='', js_logging=None):
        self.label = label
        # These are Nodes, NOT in/outpoints, pending a design for subcircuits
        self.inputs = []
        self.outputs = []
        self.all_nodes = set()
        
        # Set up logging for this circuit and all its components
        if js_logging is not None:
            set_global_js_logging(js_logging)

    def preflight(self):
        """
        TODO: 
        - don't allow mismatched bit widths. Can that be done here?
        - don't allow more than one output to the same input
        """
        return True

    def run(self):
        """
        run() initiates a simulation starting with Input Nodes
        Each Node in the work queue does its function, and returns
        a list of any Nodes which must be re-evaluated
        """
        # work = []
        # for i in self.inputs:
        #     work.append(i)
        # while len(work) > 0:
        #     node = work[0]
        #     new_work = node.propagate()
        #     work.remove(node)
        #     if new_work:
        #         work += new_work
            # TODO: for cyclic circuits (SR-latch, D-flip-flop), well need
            # to check for stable outputs to avoid infinite loops
        work = list(self.inputs)  # Start with all Input Nodes
        iteration = 0

        while iteration < MAX_ITERATIONS:
            iteration += 1
            logger.info(f"Simulation iteration {iteration}")

            changes = 0
            new_work = []

            for node in work:
                downstream = node.propagate()

                # after propagation, check if any connected edges changed
                for edges in node.outputs.points.values():
                    for edge in edges:
                        if edge.prev_value != edge.value:
                            changes += 1
                            new_work += edge.get_dest_nodes()

            if changes == 0:
                logger.info("Circuit stabilized.")
                break

            work = list(set(new_work))  # remove duplicates to prevent cycling through

        if iteration == MAX_ITERATIONS:
            logger.warning("Circuit did not stabilize within max iterations.")

    def connect(self, src, dest):
        """
        Connect nodes using connectors or nodes directly.
        - For nodes with single outputs/inputs, can pass the node directly
        - For multiple outputs/inputs, must use node.output("name") or node.input("name")
        """
        # Determine source
        if isinstance(src, Connector):
            srcnode, srcname = src.node, src.name
        elif isinstance(src, Node):
            # Direct node - must have single output
            output_names = list(src.outputs.points.keys())
            if len(output_names) != 1:
                raise ValueError(f"Node {src} has {len(output_names)} outputs, must use .output('name')")
            srcnode, srcname = src, output_names[0]
        else:
            raise TypeError("Source must be a Node or Connector")
        
        # Determine destination
        if isinstance(dest, Connector):
            destnode, destname = dest.node, dest.name
        elif isinstance(dest, Node):
            # Direct node - must have single input
            input_names = list(dest.inputs.points.keys())
            if len(input_names) != 1:
                raise ValueError(f"Node {dest} has {len(input_names)} inputs, must use .input('name')")
            destnode, destname = dest, input_names[0]
        else:
            raise TypeError("Destination must be a Node or Connector")
        
        # Create the edge
        edge = Edge(srcnode, srcname, destnode, destname)
        srcnode.append_output_edge(srcname, edge)
        destnode.set_input_edge(destname, edge)
        
        # Keep a list of Input Nodes so we can start the simulation from there
        if srcnode.kind == 'Input' and srcnode not in self.inputs:
            self.inputs.append(srcnode)
        
        self.all_nodes.update([srcnode, destnode])
