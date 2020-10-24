/********************************
* KM-Z80 web written by Katsumi *
*    This script is released    *
*      under the LGPL v2.1.     *
********************************/

// Initialize Z80 CPU
var speed=2000000; // 2 Mhz
var maxspeed=speed;
z80.setSpeed(speed);
z80.reset();
z80.events=function(){
	// z80.events() will be called every msec.
	i8253.events();
}
// Override JP command for loading from/saving to file.
var autostart=get.start;
z80.codeC3copy=z80.codeC3;
z80.codeC3=function(){
	if (0x30<=this.regPC) return this.codeC3copy();
	if (this.regPC<0x21) {
		if (autostart && this.regPC==0x04) {
			// Support kmz80web.html?start=XXXX
			// The proccess will come here when the first prompt.
			z80.loadPC(parseInt(autostart,16));
			autostart=false;
			return;
		}
		return this.codeC3copy();
	}
	switch(this.regPC){
		case 0x22: // Save header
			file.saveHeader();
			break;
		case 0x25: // Save body
			file.saveBody();
			break;
		case 0x28: // Load header
			file.loadHeader();
			break;
		case 0x2B: // Load body
			file.loadBody();
			break;
		case 0x2E: // Verify body
			file.verifyBody();
			break;
		default:
			this.codeC3copy();
			return;
	}
	z80.codeC9();
}
// Initialize Memory
memory.init(48); // 48 Kbytes memory
// Additional initializations
if (typeof mztape !="undefined") mztape.load();
if (get.debug && (!get.worker) && typeof debugDisplay !="undefined") {
	dom.showDebug();
}
// Following function will be called by initializing display.
start=function(){
	var time;
	time=new Date().getTime();
	setTimeout(function(){
			var from=time;
			var to=time=new Date().getTime();
			var msec=to-from;
			if (msec<50 && speed<maxspeed) {
				speed<<=1;
				 if (15625<speed && speed<31250) speed=15625;
				z80.setSpeed(speed);
				dom.showSpeed(speed);
			} else if (100<msec) {
				speed>>=1;
				if (speed<1) speed=1;
				z80.setSpeed(speed);
				dom.showSpeed(speed);
			}
			z80.exec(msec);
			if (z80.step) {
				showRegisters();
			} else {
				setTimeout(arguments.callee,10);
			}
		},10);
};

