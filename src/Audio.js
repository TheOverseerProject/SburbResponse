var Sburb = (function(Sburb){

Sburb.globalVolume = 1;




///////////////////////////////////////
//Sound Class
///////////////////////////////////////

//Constructor
Sburb.Sound = function(asset){
	if (asset) {
		this.asset = asset;
		var that = this;
		window.addEventListener('beforeunload', function() {
			that.asset.pause();
		});
	}
};

//play this sound
Sburb.Sound.prototype.play = function(pos) {
	this.fixVolume();
	this.asset.play();
};

//stop this sound
Sburb.Sound.prototype.stop = function() {
	this.asset.stop();
	//console.log("stopping the sound...");
};

//ensure the sound is playing at the global volume
Sburb.Sound.prototype.fixVolume = function(){
	this.asset.volume(Sburb.globalVolume);
//	console.log(this.asset._volume);
};

//check if the sound is playing
Sburb.Sound.prototype.playing = function(pos) {
	return this.asset.playing();
};



/////////////////////////////////////
//BGM Class (inherits Sound)
/////////////////////////////////////

//constructor
Sburb.BGM = function(asset, startLoop, priority) {
    Sburb.Sound.call(this,asset);
    this.asset.loop(true);
};

Sburb.BGM.prototype = new Sburb.Sound();



return Sburb;
})(Sburb || {});
