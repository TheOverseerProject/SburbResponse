// String trim polyfill
if(typeof String.prototype.trim !== "function") {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
  };
}
// Array Remove - By John Resig (MIT Licensed)
if(typeof Array.prototype.remove !== "function") {
    Array.prototype.remove = function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
    };
}
// Array contains polyfill
if(typeof Array.prototype.contains !== 'function') {
    Array.prototype.contains = function(obj) {
        return this.indexOf(obj) > -1;
    };
}
// Not a polyfill but lets add it anyway
Array.prototype.destroy = function(obj) {
    var i = this.indexOf(obj);
    if(i >= 0){
        this.remove(i);
	}
};
// window.atob and window.btoa polyfill
(function(){var a=typeof window!="undefined"?window:exports,b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",c=function(){try{document.createElement("$");}catch(a){return a;}}();a.btoa||(a.btoa=function(a){for(var d,e,f=0,g=b,h="";a.charAt(f|0)||(g="=",f%1);h+=g.charAt(63&d>>8-f%1*8)){e=a.charCodeAt(f+=0.75);if(e>255)throw c;d=d<<8|e}return h}),a.atob||(a.atob=function(a){a=a.replace(/=+$/,"");if(a.length%4==1)throw c;for(var d=0,e,f,g=0,h="";f=a.charAt(g++);~f&&(e=d%4?e*64+f:f,d++%4)?h+=String.fromCharCode(255&e>>(-2*d&6)):0)f=b.indexOf(f);return h})})();

var Sburb = (function(Sburb){

Sburb.interpolationPercentage = 1;
//the draw loop
//MainLoop (modified) - Isaac Sukin MIT Licensed
var simulationTimestep = 1000 / 30,
	frameDelta = 0,
    lastFrameTimeMs = 0,
    fps = 30,
    lastFpsUpdate = 0,
    framesThisSecond = 0,
    numUpdateSteps = 0,
    minFrameDelay = 0,
    running = false,
    started = false,
    panic = false,
    windowOrRoot = typeof window === "object" ? window : Sburb,


    // The polyfill is adapted from the MIT-licensed
    // https://github.com/underscorediscovery/realtime-multiplayer-in-html5
    requestAnimationFrame = windowOrRoot.requestAnimationFrame || (function() {
        var lastTimestamp = Date.now(),
            now,
            timeout;
        return function(callback) {
            now = Date.now();
            timeout = Math.max(0, simulationTimestep - (now - lastTimestamp));
            lastTimestamp = now + timeout;
            return setTimeout(function() {
                callback(now + timeout);
            }, timeout);
        };
    })(),

    cancelAnimationFrame = windowOrRoot.cancelAnimationFrame || clearTimeout,

    NOOP = function() {},

    begin = NOOP,

    update = NOOP,

    draw = NOOP,

    end = NOOP,

    rafHandle;

Sburb.drawLoop = {

    getSimulationTimestep: function() {
        return simulationTimestep;
    },

    setSimulationTimestep: function(timestep) {
        simulationTimestep = timestep;
        return this;
    },

    getFPS: function() {
        return fps;
    },

    getMaxAllowedFPS: function() {
        return 1000 / minFrameDelay;
    },

    setMaxAllowedFPS: function(fps) {
        if (typeof fps === "undefined") {
            fps = Infinity;
        }
        if (fps === 0) {
            this.stop();
        } else {
            // Dividing by Infinity returns zero.
            minFrameDelay = 1000 / fps;
        }
        return this;
    },

    resetFrameDelta: function() {
        var oldFrameDelta = frameDelta;
        frameDelta = 0;
        return oldFrameDelta;
    },

    setBegin: function(fun) {
        begin = fun || begin;
        return this;
    },

    setUpdate: function(fun) {
        update = fun || update;
        return this;
    },

    setDraw: function(fun) {
        draw = fun || draw;
        return this;
    },

    setEnd: function(fun) {
        end = fun || end;
        return this;
    },


    start: function() {
        if (!started) {
            started = true;
            rafHandle = requestAnimationFrame(function(timestamp) {
                draw();
                running = true;
                lastFrameTimeMs = timestamp;
                lastFpsUpdate = timestamp;
                framesThisSecond = 0;

                rafHandle = requestAnimationFrame(animate);
            });
        }
        return this;
    },

    stop: function() {
        running = false;
        started = false;
        cancelAnimationFrame(rafHandle);
        return this;
    },

    isRunning: function() {
        return running;
    }
};

function animate(timestamp) {

    rafHandle = requestAnimationFrame(animate);
    if (timestamp < lastFrameTimeMs + minFrameDelay) {
        return;
    }
    frameDelta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;
    begin(timestamp, frameDelta);
    if (timestamp > lastFpsUpdate + 1000) {
        fps = 0.25 * framesThisSecond + 0.75 * fps;

        lastFpsUpdate = timestamp;
        framesThisSecond = 0;
    }
    framesThisSecond++;

    numUpdateSteps = 0;
    while (frameDelta >= simulationTimestep) {
        frameDelta -= simulationTimestep;
        update();
        if (++numUpdateSteps >= 240) {
            panic = true;
            break;
        }
    }
    Sburb.interpolationPercentage=frameDelta/simulationTimestep;
    draw();

    end(panic);

    panic = false;
}

// AMD support
if (typeof define === "function" && define.amd) {
    define(Sburb.drawLoop);
}
// CommonJS support
else if (typeof module === "object" && module !== null && typeof module.exports === "object") {
    module.exports = Sburb.drawLoop;
}


Sburb.end = function end(panic) {
    if (panic) {
        var discardedTime = Math.round(Sburb.drawLoop.resetFrameDelta());
        purgeKeys();
        console.warn("Main loop panicked, probably because the browser tab was put in the background. Discarding " + discardedTime + "ms");
    }
};



//650x450 screen
Sburb.Keys = {backspace:8,tab:9,enter:13,shift:16,ctrl:17,alt:18,escape:27,space:32,left:37,up:38,right:39,down:40,w:87,a:65,s:83,d:68,tilde:192};

Sburb.name = "SMHD";
Sburb.version = "2.0";
Sburb.Container = null; //"deploy" div
Sburb.Game = null; //the game div
Sburb.Map = null; //the map div
Sburb.Stage = null; //the canvas, we're gonna load it up with a bunch of flash-like game data like fps and scale factors
Sburb.Bins = {}; //the various bin divs
Sburb.cam = {x:0,y:0};
Sburb.crashed = false; // In case of catastrophic failure
Sburb.stage = null; //its context
Sburb.gameState = {};
Sburb.pressed = null; //the pressed keys
Sburb.pressedOrder = null; //reverse stack of keypress order. Higher index = pushed later
Sburb.debugger = null;
Sburb.assetManager = null; //the asset loader
Sburb.assets = null; //all images, sounds, paths
Sburb.sprites = null; //all sprites that were Serial loaded
Sburb.effects = null; //all effects that were Serial loaded
Sburb.buttons = null; //all buttons that were Serial loaded
Sburb.rooms = null; //all rooms
Sburb.char = null; //the player
Sburb.curRoom = null;
Sburb.destRoom = null; //current room, the room we are transitioning to, if it exists.
Sburb.destX = null;
Sburb.destY = null; //the desired location in the room we are transitioning to, if it exists.
Sburb.focus = null; //the focus of the camera (a sprite), usually just the char
Sburb.destFocus = null;
Sburb.choices = null; //the choices for where the player currently is
Sburb.inputDisabled = false; //disables player-control
Sburb.curAction = null; //the current action being performed
Sburb.actionQueues = []; //additional queues for parallel actions
Sburb.nextQueueId = 0; //the next created actionQueue, specified without a id, will get this number and increment it
Sburb.bgm = null; //the current background music
Sburb.hud = null; //the hud; help and sound buttons
Sburb.Mouse = {down:false,x:0,y:0}; //current recorded properties of the mouse
Sburb.waitFor = null;
Sburb.engineMode = "wander";
Sburb.fading = false;
Sburb.lastMusicTime = -1;
Sburb.musicStoppedFor = 0;
Sburb.loadingRoom = false; // Only load one room at a time
Sburb.tests = null;
Sburb.prefixed = null;
Sburb.firedAsync = false;
Sburb.password=""; //Used for choices
Sburb.pointArray=null; //where the corners and middle of the screen are, per resize function
Sburb.maxStaticScreen=0; //a big number to compare against

Sburb.updateLoop = null; //the main updateLoop, used to interrupt updating
Sburb.initFinished = null; //only used when _hardcode_load is true
Sburb._hardcode_load = null; //set to 1 when we don't want to load from XML: see initialize()
Sburb._include_dev = false;
var lastDrawTime = 0;

Sburb.testCompatibility = function(div, levelName, includeDevTools) {
    if(Modernizr.xhr2 && !Sburb.firedAsync) {
      try {
        // Test blob response
        var xhr = new XMLHttpRequest();
        xhr.open("GET",levelName,true);
        xhr.responseType = "blob";
        xhr.onload = function() {
            if((this.status == 200 || this.status == 0) && this.response) {
                Modernizr.addTest('xhrblob', function () { return true; });
            } else {
                Modernizr.addTest('xhrblob', function () { return false; });
            }
        };
        xhr.onabort = function() { Modernizr.addTest('xhrblob', function () { return false; }); };
        xhr.onerror = function() { Modernizr.addTest('xhrblob', function () { return false; }); };
        xhr.send();

        // Test Arraybuffer response
        xhr = new XMLHttpRequest();
        xhr.open("GET",levelName,true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function() {
            if((this.status == 200 || this.status == 0) && this.response) {
                var arr = this.response;
                Modernizr.addTest('xhrarraybuffer', function () { return true; });
            } else {
                Modernizr.addTest('xhrarraybuffer', function () { return false; });
            }
        };
        xhr.onabort = function() { Modernizr.addTest('xhrarraybuffer', function () { return false; }); };
        xhr.onerror = function() { Modernizr.addTest('xhrarraybuffer', function () { return false; }); };
        xhr.send();
      } catch (e) {
        alert(e.message + "\n\nIf you are running Google Chrome, you need to run it with the -allow-file-access-from-files switch to load this.");
      }

        Sburb.firedAsync = true;
    } else {
        Modernizr.addTest('xhrblob', function () { return false; });
        Modernizr.addTest('xhrarraybuffer', function () { return false; });
    }

    // Make sure Modernizr finished loading async tests
    if(!('xhrblob' in Modernizr && 'xhrarraybuffer' in Modernizr && 'datauri' in Modernizr)) {
        setTimeout(function() { Sburb.initialize(div, levelName, includeDevTools); }, 200);
        Sburb.crashed = true;
        return;
    }

    // Use Modernizr to test compatibility
    var errors = [];
    if(!Modernizr.fontface){ errors.push("- Lack of CSS @font-face support."); }
  	if(!Modernizr.canvas){ errors.push("- Lack of canvas support."); }
  	if(!Modernizr.canvastext){ errors.push("- Lack of canvas text support."); }
  	if(!Modernizr.json){ errors.push("- Lack of JSON support."); }
  	if(!Modernizr.xmlserializer){ errors.push("- Lack of XMLSerializer support."); }

    if(errors.length) {
        // Display what failed
        var deploy = '<div style="padding-left: 0; padding-right: 0; margin-left: auto; margin-right: auto; display: block; width:650px; height:450px; overflow: auto;">';
        deploy += '<p style="font-weight: bold;">Your browser is too old. Here are the problems we found:</p>';
        for(var i=0; i < errors.length; i++)
            deploy += '<p>'+errors[i]+'</p>';
        deploy += '<p>Maybe try Chrome instead?</p>';
        deploy += '</div>';
        document.getElementById(div).innerHTML = deploy;
        Sburb.crashed = true; // Stop initialization
    } else {
        Sburb.prefixed = Modernizr.prefixed;
        Sburb.tests = {};
        Sburb.tests['blobrevoke'] = Modernizr.blob && Modernizr.blob.revoke;
        if(Modernizr.audio && (Modernizr.audio.mp3 || Modernizr.audio.ogg)) {
            Sburb.tests['audio'] = new Boolean(true);
            Sburb.tests.audio.mp3 = Modernizr.audio.mp3;
            Sburb.tests.audio.ogg = Modernizr.audio.ogg;
        } else {
            Sburb.tests['audio'] = false;
        }
        if(Modernizr.localstorage || Modernizr.sessionstorage) {
            Sburb.tests['storage'] = new Boolean(true);
            Sburb.tests.storage.local = Modernizr.localstorage;
            Sburb.tests.storage.session = Modernizr.sessionstorage;
        } else {
            Sburb.tests['storage'] = false;
        }

        // Caution, weirdness ahead. Tests in order of preference, future tests should use increasing numbers. Do not change existing constants.
        // To deprecate a test, move it to the bottom of the list. To make it obsolete, comment it out.
        // Assets.js and Debugger.js are the only files to reference these constants
        Sburb.tests['loading'] = 0; // Just pass raw URL to elements
        if(Modernizr.xhrblob && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.creator) {
            Sburb.tests.loading = 11; // Load as blob, pass to blob constructor and generate Blob URI
        } else if(Modernizr.xhrblob && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.builder) {
            Sburb.tests.loading = 10; // Load as blob, pass to blob builder and generate Blob URI
        } else if(Modernizr.xhrblob && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.slice) {
            Sburb.tests.loading = 9; // Load as blob, pass to blob.slice and generate Blob URI
        } else if(Modernizr.xhrblob && Modernizr.datauri && Modernizr.filereader) {
            Sburb.tests.loading = 8; // Load as blob, pass to file reader and generate Data URI
        } else if(Modernizr.xhrarraybuffer && Modernizr.arraybuffer && Modernizr.arraybuffer.dataview && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.creator) {
            Sburb.tests.loading = 7; // Load as arraybuffer, convert to data view, pass to blob constructor and generate Blob URI
        } else if(Modernizr.xhrarraybuffer && Modernizr.arraybuffer && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.creator) {
            Sburb.tests.loading = 6; // Load as arraybuffer, use hacks to pass to blob constructor and generate Blob URI
        } else if(Modernizr.xhrarraybuffer && Modernizr.arraybuffer && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.builder) {
            Sburb.tests.loading = 5; // Load as arraybuffer, pass to blob builder and generate Blob URI
        } else if(Modernizr.xhrarraybuffer && Modernizr.arraybuffer && Modernizr.arraybuffer.dataview && Modernizr.datauri) {
            Sburb.tests.loading = 4; // Load as arraybuffer, convert to base 64 and generate Data URI
        } else if(Modernizr.overridemimetype && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.creator && Modernizr.arraybuffer && Modernizr.arraybuffer.dataview) {
            Sburb.tests.loading = 3; // Load as string, convert to arraybuffer, pass to blob constructor and generate Blob URI
        } else if(Modernizr.overridemimetype && Modernizr.blob && Modernizr.blob.url && Modernizr.blob.builder && Modernizr.arraybuffer && Modernizr.arraybuffer.dataview) {
            Sburb.tests.loading = 2; // Load as string, convert to arraybuffer, pass to blob builder and generate Blob URI
        } else if(Modernizr.overridemimetype && Modernizr.datauri) {
            Sburb.tests.loading = 1; // Load as string, clean it up, convert to base 64 and generate Data URI
        } else if(Modernizr.vbarray && Modernizr.datauri) {
            Sburb.tests.loading = 12; // Load as god knows what, use IE hacks, convert to base 64 and generate Data URI
        }
    }
};

Sburb.initialize = function(div,levelName,includeDevTools){
    Sburb.crashed = false;
    Sburb.testCompatibility(div, levelName, includeDevTools);
    if(Sburb.crashed){
        return; // Hard crash if the browser is too old. testCompatibility() will handle the error message
	}
	Sburb.debugger = new Sburb.Debugger(); // Load debugger first! -- But not quite

    var deploy = document.createElement('div');
    deploy.style.position = "relative";
    deploy.style.padding = "0";
    deploy.style.margin = "auto";

	var gameDiv = document.createElement('div');
    gameDiv.id = "SBURBgameDiv";
	gameDiv.onkeydown = _onkeydown;
	gameDiv.onkeyup = _onkeyup;
    gameDiv.style.position = "absolute";
    gameDiv.style.zIndex = "100";
    deploy.appendChild(gameDiv);

	var movieDiv = document.createElement('div');
    movieDiv.id = "SBURBmovieBin";
    movieDiv.style.position = "absolute";
    movieDiv.style.zIndex = "200";
    deploy.appendChild(movieDiv);

	var fontDiv = document.createElement('div');
    fontDiv.id = "SBURBfontBin";
    deploy.appendChild(fontDiv);

	var gifDiv = document.createElement('div');
    gifDiv.id = "SBURBgifBin";
    gifDiv.style.width = "0";
    gifDiv.style.height = "0";
    gifDiv.style.overflow = "hidden";
    deploy.appendChild(gifDiv);

	var gameCanvas = document.createElement("canvas");
    gameCanvas.id = "SBURBStage";
    gameCanvas.onmousemove = function(e) { Sburb.onMouseMove(e,this); };
    gameCanvas.tabIndex = 0;
	gameCanvas.scaleX = gameCanvas.scaleY = 3;
	gameCanvas.x = gameCanvas.y = 0;
	gameCanvas.fade = 0;
	gameCanvas.fadeRate = 0.1;
    gameCanvas.innerText = "ERROR: Your browser is too old to display this content!";
    gameDiv.appendChild(gameCanvas);


	var hammertime= new Hammer(gameCanvas);

	//Tap and click events are interlinked
	hammertime.on('tap', function(e){
		if(!Sburb.updateLoop){ return; }// Make sure we are loaded before trying to do things
		Sburb.Mouse.down = true; //gets set to false in Sburb.SpriteButton.prototype.updateMouse
		var point = tapCoords(e,gameCanvas);
		var mockSpace = {keyCode:Sburb.Keys.space};
		Sburb.Mouse.x = point.x;
		Sburb.Mouse.y = point.y;
		if(Sburb.dialoger && Sburb.dialoger.box && Sburb.dialoger.box.isVisuallyUnder(Sburb.Mouse.x*(Sburb.Stage.width/Sburb.Stage.currentWidth),Sburb.Mouse.y*(Sburb.Stage.height/Sburb.Stage.currentHeight)) && !Sburb.dialoger.choicePicking){
			Sburb.dialoger.nudge();
		} else {
			_onkeydown(mockSpace);
 		}
	});

	//Touch events have the side effect of being able to click and drag with the mouse to move the sprite
	//Since older devices emulate mouse clicks as opposed to using some sort of touch API, we want this enabled.
	//Also laptops with touch screens would be a pain to deal with
	hammertime.on('press', function(e){
		if(hasControl()){
			mockKeyConfig(e);
		}
	});

	hammertime.on('pan', function(e){
		if(hasControl()){
			purgeKeys();
			mockKeyConfig(e);
		}
	});

	hammertime.on('pressup panend swipe pancancel', function(e) {
		if(hasControl()){
			purgeKeys();
		}
	});

	//Mocks up key codes to send to the action queue if moving with touch/mouse input
	function mockKeyConfig(e){
		if(Sburb.updateLoop && !Sburb.inputDisabled) { // Make sure we are loaded before trying to do things.
			var point = tapCoords(e,gameCanvas);
			var mockKeyCode = getQ(point.x,point.y);
			for(var i=0; i<mockKeyCode.length; i++){
				if(!Sburb.pressed[mockKeyCode[i]]){
					Sburb.pressedOrder.push(mockKeyCode[i]);
				}
				Sburb.pressed[mockKeyCode[i]] = true;
			}
		}
	}

	var mapCanvas = document.createElement("canvas");
    mapCanvas.id = "SBURBMapCanvas";
    mapCanvas.width = 1;
    mapCanvas.height = 1;
    mapCanvas.style.display = "none";
    gameDiv.appendChild(mapCanvas);

	document.getElementById(div).appendChild(deploy);

    // Copy local variables into Sburb
    Sburb.Container = deploy;
    Sburb.Game = gameDiv;
    Sburb.Map = mapCanvas;
    Sburb.Stage = gameCanvas;
    Sburb.Bins["movie"] = movieDiv;
    Sburb.Bins["font"] = fontDiv;
    Sburb.Bins["gif"] = gifDiv;

    // Set default dimensions
    Sburb.setDimensions(1156,650);

	Sburb.stage = Sburb.Stage.getContext("2d");
	Sburb.Stage.onblur = _onblur;
	Sburb.dialoger = null;
    Sburb.assetManager = new Sburb.AssetManager();
	Sburb.assets = Sburb.assetManager.assets; // shortcut for raw asset access
	Sburb.rooms = {};
	Sburb.sprites = {};
	Sburb.effects = {};
	Sburb.buttons = {};
	Sburb.hud = {};
	Sburb.gameState = {};
	Sburb.pressed = {};
	Sburb.pressedOrder = [];


	//do not change the order of this array. Used for key mockup for touch/mouse events
	Sburb.quadrantAlign = [[Sburb.Keys.left,Sburb.Keys.up], [Sburb.Keys.left], [Sburb.Keys.left,Sburb.Keys.down],
		[Sburb.Keys.up], [Sburb.Keys.down], [Sburb.Keys.right,Sburb.Keys.up],[Sburb.Keys.right],
		[Sburb.Keys.right,Sburb.Keys.down]];

    Sburb.loadSerialFromXML(levelName); // comment out this line and
    //loadAssets();                        // uncomment these two lines, to do a standard hardcode load
    //_hardcode_load = 1;
    resize();

	window.addEventListener('resize', resize, false);

};

Sburb.setDimensions = function(width, height) {
    if(width) {
        Sburb.Container.style.width = width+"px";
        Sburb.Stage.width = width;
        Sburb.Stage.currentWidth = width;
    }
    if(height) {
        Sburb.Container.style.height = height+"px";
        Sburb.Stage.height = height;
        Sburb.Stage.currentHeight = height;
    }
};

function resize() {
	var width = window.innerWidth;

	if(width>Sburb.Stage.width){
		width=Sburb.Stage.width;
	}

	var ratio = Sburb.Stage.height/Sburb.Stage.width;
	var height = width * ratio;

    Sburb.Container.style.width = width+"px";
    Sburb.Container.style.height = height+"px";
	Sburb.Stage.style.width = width+'px'; //sorta weird, but this sets the box it displays in as opposed to the coordinates
	Sburb.Stage.style.height = height+'px';
	Sburb.Game.style.width = width+'px';
	Sburb.Game.style.height = height +'px';

	//These are for comparing relative point distance for mouse/touch movement
	//do not change the order of this array
	Sburb.pointArray = [[0,0],[0,height/2],[0,height],[width/2,0],
		[width/2,height],[width,0],[width,height/2],
		[width,height]];
	Sburb.maxStaticScreen = width*width+height*height+1;
	Sburb.Stage.currentWidth=width;
	Sburb.Stage.currentHeight=height;
}

function startUpdateProcess(){
	haltUpdateProcess();
	Sburb.drawLoop.setUpdate(Sburb.update).setDraw(Sburb.draw).setEnd(Sburb.end).start();
	Sburb.updateLoop=true;
	Sburb.assetManager.stop();
	if(!Sburb.bgm.playing){
		Sburb.bgm.play();
	}
}

function haltUpdateProcess(){
	if(Sburb.updateLoop){
		Sburb.updateLoop = null;
		Sburb.drawLoop.stop();
	}
	Sburb.assetManager.start();
}

Sburb.update = function update(){
	//update stuff
	handleInputs();
	handleHud();

	if(!Sburb.loadingRoom){
	    Sburb.curRoom.update();
	}

	focusCamera();
	handleRoomChange();
	Sburb.dialoger.update();
	chainAction();
	updateWait();
};

Sburb.draw = function draw(){
	//stage.clearRect(0,0,Stage.width,Stage.height);
	if(!Sburb.playingMovie){
		Sburb.stage.save();
		Sburb.Stage.offset = true;
		Sburb.stage.translate(-Sburb.Stage.x,-Sburb.Stage.y);

		Sburb.curRoom.draw();

		Sburb.stage.restore();
		Sburb.Stage.offset = false;

		if(Sburb.Stage.fade>0.1){
			Sburb.stage.fillStyle = "rgba(0,0,0,"+Sburb.Stage.fade+")";
			Sburb.stage.fillRect(0,0,Sburb.Stage.width,Sburb.Stage.height);
		}

		Sburb.dialoger.draw();
		drawHud();

		Sburb.stage.save();
		Sburb.Stage.offset = true;
		Sburb.stage.translate(-Sburb.Stage.x,-Sburb.Stage.y);

		Sburb.stage.restore();
		Sburb.Stage.offset = false;

	    Sburb.debugger.draw();
	}
};

var _onkeydown = function(e){
    if(Sburb.updateLoop && !Sburb.inputDisabled) { // Make sure we are loaded before trying to do things
	    if(Sburb.dialoger.talking && !Sburb.dialoger.choicePicking){
		    if(e.keyCode == Sburb.Keys.space && !Sburb.pressed[Sburb.Keys.space]){
			    Sburb.dialoger.nudge();
		    }
	    }else if(hasControl()){
		    if(e.keyCode == Sburb.Keys.space && !Sburb.pressed[Sburb.Keys.space] && Sburb.engineMode=="wander"){
			    Sburb.choices = [];
			    var queries = Sburb.char.getActionQueries();
			    for(var i=0;i<queries.length;i++){
				    Sburb.choices = Sburb.curRoom.queryActions(Sburb.char,queries[i].x,queries[i].y);
				    if(Sburb.choices.length>0){
				   	Sburb.performAction(Sburb.choices[0]);
					break;
				    }
			    }
		    }
	    }
	}
    /* There is a theoretical race condition here
       in which pressing a key within the milliseconds
       between injecting the canvas into the dom
       and initializing Sburb.pressed and Sburb.pressedOrder
       could throw an exception.

       I'm not too worried about it. -Fugi */
	if(!Sburb.pressed[e.keyCode]){
	    Sburb.pressedOrder.push(e.keyCode);
	}
	Sburb.pressed[e.keyCode] = true;
    // return true if we want to pass keys along to the browser, i.e. Ctrl-N for a new window
    if(e.altKey || e.ctrlKey || e.metaKey) {
		// don't muck with system stuff
		return true;
    }
    return false;
};

var _onkeyup = function(e){
    // See _onkeydown for race condition warning
    if(Sburb.pressed[e.keyCode]){
    	Sburb.pressedOrder.destroy(e.keyCode);
	}
	Sburb.pressed[e.keyCode] = false;
};

function purgeKeys(){
    // See _onkeydown for race condition warning
	Sburb.pressed = {};
	Sburb.pressedOrder = [];
}

var _onblur = function(e){
    // See _onkeydown for race condition warning
	purgeKeys();
};

Sburb.onMouseMove = function(e,canvas){
    // See _onkeydown for race condition warning
	var point = relMouseCoords(e,canvas);
	Sburb.Mouse.x = point.x;
	Sburb.Mouse.y = point.y;
};

function relMouseCoords(event,canvas){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = canvas;

    do{
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
    } while(currentElement = currentElement.offsetParent);
    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;
    return {x:canvasX,y:canvasY};
}


function tapCoords(event,canvas){
	var offsetX = event.center.x - canvas.getBoundingClientRect().left;
	var offsetY = event.center.y - canvas.getBoundingClientRect().top;

    return {x:offsetX,y:offsetY};
}

//Calculate which direction to move for press events. Compares line distance between two points
function getQ(x,y) {
	var qKey, qInt=Sburb.maxStaticScreen;
	for(var i=0; i<8; i++){
		var tmpQInt = Math.pow((x-Sburb.pointArray[i][0]),2)+Math.pow((y-Sburb.pointArray[i][1]),2);
		if(tmpQInt < qInt){
			qInt = tmpQInt;
			qKey = Sburb.quadrantAlign[i];
		}
	}
    return qKey;
}

function handleInputs(){
	if(Sburb.Stage){
		Sburb.Stage.style.cursor = "default";
	}
	if(hasControl() && !Sburb.inputDisabled){
		Sburb.char.handleInputs(Sburb.pressed, Sburb.pressedOrder);
	}else{
		Sburb.char.moveNone();
	}
	Sburb.debugger.handleInputs(Sburb.pressed);
}

function handleHud(){
	for(var content in Sburb.hud){
	    if(!Sburb.hud.hasOwnProperty(content)) continue;
	    var obj = Sburb.hud[content];
	    obj.update();
	}
}

function drawHud(){
	for(var content in Sburb.hud){
	    if(!Sburb.hud.hasOwnProperty(content)) continue;
	    Sburb.hud[content].draw();
	}
}

function hasControl(){
	return !Sburb.dialoger.talking
		&& !Sburb.destRoom
		&& !Sburb.fading
		&& !Sburb.destFocus;
}

function focusCamera(){
	if(!Sburb.destFocus){
		if(Sburb.focus){
			Sburb.cam.x = Sburb.focus.x-Sburb.Stage.width/2;
			Sburb.cam.y = Sburb.focus.y-Sburb.Stage.height/2;
		}
	}else if(Math.abs(Sburb.destFocus.x-Sburb.cam.x-Sburb.Stage.width/2)>4 || Math.abs(Sburb.destFocus.y-Sburb.cam.y-Sburb.Stage.height/2)>4){
		Sburb.cam.x += (Sburb.destFocus.x-Sburb.Stage.width/2-Sburb.cam.x)/5;
		Sburb.cam.y += (Sburb.destFocus.y-Sburb.Stage.height/2-Sburb.cam.y)/5;
	}else{
		Sburb.focus = Sburb.destFocus;
		Sburb.destFocus = null;
	}
	Sburb.Stage.x = Math.max(0,Math.min(Math.round(Sburb.cam.x/Sburb.Stage.scaleX)*Sburb.Stage.scaleX,Sburb.curRoom.width-Sburb.Stage.width));
	Sburb.Stage.y = Math.max(0,Math.min(Math.round(Sburb.cam.y/Sburb.Stage.scaleX)*Sburb.Stage.scaleX,Sburb.curRoom.height-Sburb.Stage.height));
}

function handleRoomChange(){
	if(Sburb.destRoom || Sburb.fading){
		if(Sburb.Stage.fade<1.1){
			Sburb.Stage.fade=Math.min(1.1,Sburb.Stage.fade+Sburb.Stage.fadeRate);
		}else if(Sburb.destRoom){
			var deltaX = Sburb.destX-Sburb.char.x;
			var deltaY = Sburb.destY-Sburb.char.y;
			var curSprite = Sburb.char;
			while(curSprite){
				curSprite.x+=deltaX;
				curSprite.y+=deltaY;
				curSprite.followBuffer = [];
				curSprite = curSprite.follower;
			}
			Sburb.moveSprite(Sburb.char,Sburb.curRoom,Sburb.destRoom);
			Sburb.curRoom.exit();
			Sburb.curRoom = Sburb.destRoom;
			Sburb.curRoom.enter();
			Sburb.destRoom = null;
		}else{
			Sburb.fading = false;
		}
	}else if(hasControl() && Sburb.Stage.fade>0.01){
		Sburb.Stage.fade=Math.max(0.01,Sburb.Stage.fade-Sburb.Stage.fadeRate);
		//apparently alpha 0 is buggy?
	}
}

function chainAction(){
	if(Sburb.curAction) {
		chainActionInQueue(Sburb);
	}
	for(var i=0;i<Sburb.actionQueues.length;i++) {
		var queue=Sburb.actionQueues[i];
		if(!queue.curAction) {
			Sburb.actionQueues.remove(i);
			i--;
			continue;
		}
		if(queue.paused || queue.waitFor) {
			if((queue.trigger && queue.trigger.checkCompletion())
                || queue.waitFor) {
				queue.paused = false;
				queue.trigger = null;
			} else {
				continue;
			}
		}
        chainActionInQueue(queue);
	}
}

function chainActionInQueue(queue) {
	if(queue.curAction.times<=0){
		if(queue.curAction.followUp){
			if(hasControl() || queue.curAction.followUp.noWait || queue.noWait){
				Sburb.performAction(queue.curAction.followUp,queue);
			}
		}else{
			queue.curAction = null;
		}
	}else if(hasControl() || queue.curAction.noWait || queue.noWait){
		Sburb.performAction(queue.curAction,queue);
	}
}

function updateWait(){
	if(Sburb.waitFor){
		if(Sburb.waitFor.checkCompletion()){
			Sburb.waitFor = null;
		}
	}
    if(Sburb.inputDisabled && Sburb.inputDisabled.checkCompletion){
        if(Sburb.inputDisabled.checkCompletion()){
            Sburb.inputDisabled = false;
        }
    }
}

Sburb.performAction = function(action, queue){
	if(action.silent){
		if((action.times==1)&&(!action.followUp)) {
			Sburb.performActionSilent(action);
			return null;
		}
		if((!queue)||(queue==Sburb)) {
			if(action.silent===true) {
				queue=new Sburb.ActionQueue(action);
			} else {
				var options=action.silent.split(":");
				var noWait=(options[0]=="full")?true:false;
				var id=null;
				if(noWait) {
					options.shift();
				}
				if(options.length>0) {
					id=options.shift();
				}
				queue=new Sburb.ActionQueue(action,id,options,noWait);
			}
			Sburb.actionQueues.push(queue);
		}
	}
	if(queue&&(queue!=Sburb)) {
		performActionInQueue(action, queue);
		return queue;
	}
	if(((Sburb.curAction && Sburb.curAction.followUp!=action && Sburb.curAction!=action) || !hasControl()) && action.soft){
		return null;
	}
	performActionInQueue(action, Sburb);
	return null;
};

function performActionInQueue(action, queue) {
	var looped = false;
	queue.curAction = action.clone();
	do{
		if(looped){
			queue.curAction = queue.curAction.followUp.clone();
		}
       	var result = Sburb.performActionSilent(queue.curAction);
        handleCommandResult(queue,result);
       	looped = true;
	}while(queue.curAction && queue.curAction.times<=0 && queue.curAction.followUp && queue.curAction.followUp.noDelay);
}

Sburb.performActionSilent = function(action){
	action.times--;
	var info = action.info();
	if(info){
		info = info.trim();
	}
	return Sburb.commands[action.command.trim()](info);
};

function handleCommandResult(queue,result){
    if(result){
        if(queue.hasOwnProperty("trigger")){
            queue.paused = true;
            queue.trigger = result;
        }else{
            queue.waitFor = result;
        }
    }
}



Sburb.changeRoom = function(newRoom,newX,newY){
	Sburb.destRoom = newRoom;
	Sburb.destX = newX;
	Sburb.destY = newY;
};



Sburb.moveSprite = function(sprite,oldRoom,newRoom){
	var curSprite = sprite;
	while(curSprite){
		oldRoom.removeSprite(curSprite);
		newRoom.addSprite(curSprite);
		curSprite = curSprite.follower;
	}
};



Sburb.setCurRoomOf = function(sprite){
	if(!Sburb.curRoom.contains(sprite)){
		for(var room in Sburb.rooms){
		    if(!Sburb.rooms.hasOwnProperty(room)) continue;
		    if(Sburb.rooms[room].contains(sprite)){
			    Sburb.changeRoom(Sburb.rooms[room],Sburb.char.x,Sburb.char.y);
			    return;
		    }
		}
	}
};

Sburb.changeBGM = function(newSong) {
    if(newSong){
		if(Sburb.bgm) {
			if (Sburb.bgm.asset == newSong.asset) {
				// maybe check for some kind of restart value
				return;
			}
			Sburb.bgm.stop();
		}
		Sburb.bgm = newSong;
		Sburb.bgm.stop();
		Sburb.bgm.play();
    }
};

Sburb.playEffect = function(effect,x,y){
	Sburb.curRoom.addEffect(effect.clone(x,y));
};

Sburb.playSound = function(sound){
	sound.stop();
	sound.play();
};

Sburb.playMovie = function(movie){
	var name = movie.name;
	document.getElementById(name).style.display = "block";
	document.getElementById("movie"+name).play();
	Sburb.waitFor = new Sburb.Trigger("movie,"+name+",5");
	Sburb.playingMovie = true;
};

Sburb.startUpdateProcess = startUpdateProcess;
Sburb.haltUpdateProcess = haltUpdateProcess;
return Sburb;
})(Sburb || {});


