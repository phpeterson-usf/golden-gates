What is it

Golden Gates is a web app intended to help computer science students learn the fundamentals of digital design. 

Why another digital design tool?

I’ve used some other tools, which worked ok. However, I wanted a tool with a smooth modern UI, adding live collaboration, usable on any computer with a browser, at no cost to students. 

How to use it

Basics
Golden Gates uses a drag-and-drop UI to place logic gates, wires, and composite components onto a circuit
Larger circuits can be composed of smaller circuits
Once a circuit is laid out, you can simulate its behavior using input and output components
Multiple circuits can be shown at once, both while editing and simulating. Therefore, you can watch how a child circuit runs while also watching its parent
Projects
A project is composed of multiple circuits. Projects are intended to be gradable assignments in a classroom environment
You can share projects, and everyone who has the project open can collaborate on the circuit’s design

How it works

Single Page App written in React and Typescript, rendering circuits in SVG
Docker container containing
A web server written in Typescript, using the Express.js server framework and nginx proxy/load balancer
RethinkDB for document storage and live collaboration
Golden Gates is generously hosted by cs.usfca.edu, where I teach
