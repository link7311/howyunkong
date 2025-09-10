function padLeft(str, len) {
	str = '' + str;
	return str.length >= len ? str : new Array(len - str.length + 1).join("0") + str;
}


export {
	padLeft,
}