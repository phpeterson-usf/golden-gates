Prompt: 
  I am puzzling about how to implement this in the python implementation of GGL. I have the following
  concerns:
  1. All of the variables are global, rather than part of a python object. Therefore a 4-bit adder would
  have all of the same values in each adder, which will not produce a correct sum
  2. THe inputs and outputs of a subcircuit like the 1-bit adder need to somehow be exposed to the parent
  circuit so the user can wire up connections. I don't know how to do that in python
  3. The use of "circuit.Component()" is confusing. It looks like a constructor, but I can't think of what
  its implementation could do to make a reusable component.

  Could you propose python implementation options which address these concerns, while maintaining the
  minimal and elegant API design from the spec?

  ---

The user is asking about implementing subcircuits in the GGL Python implementation. They have three
  specific concerns:

  1. Global variables - if we just use global variables like a, b, cin, etc., then when you instantiate
  multiple full adders, they would all share the same variable names and values, which would be incorrect.
  2. Exposing subcircuit I/O - the parent circuit needs to be able to connect to the inputs and outputs of
  the subcircuit instances.
  3. The circuit.Component() constructor - what does this actually do to create a reusable component?

  Let me think through some implementation approaches:

  Approach 1: Class-based Components
  We could create a class for each subcircuit type, where the constructor builds the internal circuit and
  exposes input/output attributes.

```python
  class FullAdder1Bit:
      def __init__(self):
          # Create internal circuit
          self.internal_circuit = circuit.Circuit()

          # Create inputs and outputs as attributes
          self.a = io.input(bits=1, label="a")
          self.b = io.input(bits=1, label="b")
          self.cin = io.input(bits=1, label="cin")
          self.sum = io.output(bits=1, label="sum")
          self.cout = io.output(bits=1, label="cout")

          # Build internal logic
          # ... gates and connections

      def input(self, name):
          return getattr(self, name)

      def output(self, name):
          return getattr(self, name)
```
  But this changes the API significantly from what's shown in the spec.

  Approach 2: Factory Function with Closure
  The circuit.Component(c) could return a factory function that creates instances with unique internal
  state:

```python
  def create_full_adder_circuit():
      c = circuit.Circuit()
      # ... build circuit as shown

      def full_adder_factory():
          # Return a new instance with unique internal state
          return ComponentInstance(c)

      return full_adder_factory

  full_adder_1bit = create_full_adder_circuit()
```

  I see a potential solution emerging that addresses the core challenges. The factory function approach
  allows creating multiple independent instances of a subcircuit, each with its own unique internal state.
  This prevents variable name conflicts and provides a clean mechanism for instantiating reusable
  components. The closure ensures that each instance gets a fresh set of internal connections, solving the
  global variable problem while maintaining a flexible interface for circuit composition.

  The key is creating a mechanism that generates unique instances while preserving the original circuit's
  structure. By using a factory function that returns a new component instance, we can dynamically create
  subcircuits without sharing global state.

  The proposed implementation would support creating multiple full adder circuits that can be independently
  configured and connected, providing maximum flexibility in circuit design.

⏺ You raise excellent concerns about the subcircuit implementation. Let me propose Python implementation
  options that address these issues while maintaining the elegant API.

  Option 1: Component Factory with Instance Isolation

  The key insight is that circuit.Component(c) should return a factory function that creates isolated
  instances:

```python
  class ComponentInstance:
      def __init__(self, template_circuit):
          self.template = template_circuit
          self._inputs = {}
          self._outputs = {}
          self._internal_components = {}

          # Clone the template circuit with fresh component instances
          self._build_instance()

      def _build_instance(self):
          """Create fresh instances of all components from template"""
          component_map = {}  # Maps template components to instance components

          # Clone all components with fresh state
          for comp_id, template_comp in self.template.components.items():
              if template_comp.type == 'input':
                  new_comp = io.input(bits=template_comp.bits, label=template_comp.label)
                  self._inputs[template_comp.label] = new_comp
              elif template_comp.type == 'output':
                  new_comp = io.output(bits=template_comp.bits, label=template_comp.label)
                  self._outputs[template_comp.label] = new_comp
              else:
                  # Clone internal components (gates, etc.)
                  new_comp = template_comp.clone()
                  self._internal_components[comp_id] = new_comp

              component_map[template_comp] = new_comp

          # Recreate connections with fresh components
          for connection in self.template.connections:
              src = component_map[connection.source]
              dst = component_map[connection.destination]
              # Internal connections are handled within this instance
              self._connect_internal(src, dst)

      def input(self, name):
          """Access input by name: fa0.input('a')"""
          return self._inputs[name]

      def output(self, name):
          """Access output by name: fa0.output('sum')"""
          return self._outputs[name]

      @property
      def inputs(self):
          """Access inputs by index: fa0.inputs[0]"""
          return list(self._inputs.values())

      @property
      def outputs(self):
          """Access outputs by index: fa0.outputs[0]"""
          return list(self._outputs.values())

  def Component(circuit):
      """Factory function that returns a component constructor"""
      def component_factory():
          return ComponentInstance(circuit)
      return component_factory
```
  Option 2: Scoped Circuit Builder

  Use a context manager to create isolated scopes:

```python
  class CircuitScope:
      def __init__(self):
          self.components = {}
          self.connections = []
          self._current_scope = None

      def __enter__(self):
          self._current_scope = {}
          return self

      def __exit__(self, exc_type, exc_val, exc_tb):
          self._current_scope = None

      def create_component(self, comp_type, *args, **kwargs):
          """Create component in current scope"""
          comp = comp_type(*args, **kwargs)
          if self._current_scope is not None:
              # Store in local scope, not global
              comp._scope_id = id(self._current_scope)
          return comp

  # Usage:
  def create_full_adder():
      with CircuitScope() as scope:
          c = circuit.Circuit()

          # These are scoped to this function call
          a = scope.io.input(bits=1, label="a")
          b = scope.io.input(bits=1, label="b")
          # ... rest of circuit

          return circuit.Component(c)

  full_adder_1bit = create_full_adder()
```

  Option 3: Template-Based Approach (Recommended)

  This maintains the exact API from your spec:

```python
  class Circuit:
      def __init__(self):
          self.components = []
          self.connections = []
          self.inputs = {}
          self.outputs = {}

      def connect(self, src, dst):
          self.connections.append((src, dst))

  class ComponentTemplate:
      def __init__(self, circuit_definition):
          self.definition = circuit_definition
          # Analyze the circuit to identify inputs/outputs
          self._analyze_io()

      def _analyze_io(self):
          """Identify which components are inputs/outputs"""
          self.input_components = {}
          self.output_components = {}

          for comp in self.definition.components:
              if isinstance(comp, IOInput):
                  self.input_components[comp.label] = comp
              elif isinstance(comp, IOOutput):
                  self.output_components[comp.label] = comp

      def __call__(self):
          """Create a fresh instance of this component"""
          return ComponentInstance(self)

  class ComponentInstance:
      def __init__(self, template):
          self.template = template
          self._instance_id = id(self)  # Unique instance identifier

          # Create fresh instances with unique IDs
          self._input_instances = {}
          self._output_instances = {}
          self._internal_instances = {}

          self._instantiate_components()

      def _instantiate_components(self):
          """Create fresh component instances"""
          for label, template_comp in self.template.input_components.items():
              # Create new instance with unique internal state
              fresh_comp = IOInput(
                  bits=template_comp.bits,
                  label=f"{template_comp.label}_{self._instance_id}",
                  instance_id=self._instance_id
              )
              self._input_instances[label] = fresh_comp

          # Similar for outputs and internal components...

      def input(self, name):
          return self._input_instances[name]

      def output(self, name):
          return self._output_instances[name]

      @property
      def inputs(self):
          return [self._input_instances[k] for k in sorted(self._input_instances.keys())]

  # The Component constructor
  def Component(circuit):
      return ComponentTemplate(circuit)

  # Usage exactly as in spec:
  c = circuit.Circuit()
  # ... build circuit ...
  full_adder_1bit = circuit.Component(c)

  # Each call creates isolated instance:
  fa0 = full_adder_1bit()  # Fresh instance
  fa1 = full_adder_1bit()  # Another fresh instance
```

  Option 4: Registry-Based with Auto-Wiring

  For maximum elegance, use a registry pattern:

```python
  class ComponentRegistry:
      def __init__(self):
          self.active_instance = None

      def set_active_instance(self, instance):
          self.active_instance = instance

  # Global registry
  _component_registry = ComponentRegistry()

  class IOInput:
      def __init__(self, bits=1, label=""):
          self.bits = bits
          self.label = label

          # If we're building a component template, register with template
          # If we're in a parent circuit, register with parent
          if _component_registry.active_instance:
              _component_registry.active_instance.add_input(self)

  def Component(circuit_def_func):
      """Decorator that creates a component template"""
      def component_factory():
          instance = ComponentInstance()
          _component_registry.set_active_instance(instance)
          try:
              circuit_def_func()  # Execute the circuit definition
          finally:
              _component_registry.set_active_instance(None)
          return instance

      return component_factory

  # Usage:
  @Component
  def full_adder_1bit():
      a = io.input(bits=1, label="a")
      b = io.input(bits=1, label="b")
      # ... rest automatically registers with current instance
```

  Recommendation

  Option 3 is the cleanest because it:

  1. Solves variable collision: Each ComponentInstance has isolated internal state
  2. Exposes I/O properly: .input() and .output() methods plus indexed access
  3. Makes Component() intuitive: It's a template factory that returns instance constructors
  4. Maintains the exact API: No changes to the user-facing syntax

  The key insight is that circuit.Component(c) returns a constructor function, and each call to that
  constructor creates a fresh instance with isolated state.