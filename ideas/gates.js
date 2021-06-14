function drawGates() {
	var draw = SVG().addTo('body').size(300, 300)

	var path = draw.path('m0,0 h 50 a 50,50 0 0,1 0,100 h-50 V0,0 M0,15 a 10,10 0 1,1 -20,0 a 10,10 0 1,1 20,0  m0,30 a 10,10 0 1,1 -20,0 a 10,10 0 1,1 20,0 m0,30 a 10,10 0 1,1 -20,0 a 10,10 0 1,1 20,0z')
	path.fill('none').move(20, 20)
	path.stroke({ color: '#f06', width: 4, linecap: 'round', linejoin: 'round' })

	var orGate = draw.path('m 200,200 a 0,50 0 0,1 -100,0 z')
	orGate.fill('none')
	orGate.stroke({color: '#000', width: 4})
}
