var clamp = function(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

var sign = function(number){
	if (number >= 0) return 1
		else return -1

}

var radiansToDegrees = function(convertThis){
	return convertThis * 180 / Math.PI
}

function map(value, inputMin, inputMax, outputMin, outputMax){
	outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);	
	if(outVal >  outputMax){
		outVal = outputMax;
	}
	if(outVal <  outputMin){
		outVal = outputMin;
	}	
	return outVal;
}