# Golden Gates

## Background

### What is it?

Golden Gates is a schematic circuit design tool intended to support CS 315 - Computer Architecture, at the University of San Francisco.

### Do we need another circuit simulator? 

1. We understand that many HDL projects exist, though most (Verilog, etc.) are more EE/CE-oriented than we intend. 
1. We intend to provide a modern, accessible tool to demystify the chain from compiler to microarchitecture, for an audience of Computer Science students. (that is, we don't care about calculating propagation delay)

### Long-term vision

We would like to include support for a (RISC-V) C compiler and machine code to the system, visually illustrating the path from C source code to microarchitecture.

### Non-goals

We would like to keep the door open to sythesizing student designs onto an FPGA. However, our current class projects are too complex to synthesize onto a reasonably-priced FPGA. Maybe someday.

## Usage

Insert instructions on using Golden Gates here.

## Development

### Overview

If you want to develop for Golden Gates, the tool chain works like this:
1. The front-end is a Vue.js app. You should be able to run it by
    1. Install node.js
    1. run `npm run dev` to install the packages in the lockfile
    1. browse to localhost:3000 to run the single-page app
1. Changes to some JS/CSS components can be hot-reloaded. However, changes to GGL python code require a restart of the server (CTRL-C and `npm run dev` again)
1. At this time, the whole system runs in the browser, with no server (or "server-less" software)
1. All pushes to the `main` branch trigger a build on our [production deployment](https://golden-gates-nine.vercel.app) at Vercel.


### GGL

1. The simulation engine, GGL (Golden Gates Language) is a subset of python, where the implementation supports the logical (non-presentation) part of circuit simulation
1. GGL was derived by feeding the spec for [Digital](https://github.com/hneemann/digital) through OpenAI O3 to get a [python spec](https://github.com/phpeterson-usf/golden-gates/blob/main/gglang/design/ggl-design-o3-deep-research-v2.md)
1. Our GGL implementation can be unit-tested using our [autograder](https://github.com/phpeterson-usf/autograder) tool.
    ```text
    cd golden-gates/web/public/ggl
    grade test
    ```
1. Autograder searches up the directory tree for [config.toml](https://github.com/phpeterson-usf/golden-gates/blob/main/web/public/ggl/config.toml), and uses that to find the [test case files](https://github.com/phpeterson-usf/golden-gates/blob/main/web/public/ggl/tests/ggl/ggl.toml). 
1. The execution environment for browser-side python is [pyodide](https://pyodide.org/en/stable/), which is very cool, though it imposes some restrictions on importable python modules.