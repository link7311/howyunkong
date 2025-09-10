// 檢查裝置是否為 iPad
function isIpad() {
	return /iPad|Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document;
}

function initDevice() {
	$(window).on("resize", function() {
		if ($(this).width() > 1200) {
			if (window.device == 'mobile') {
				location.reload()
			}
			window.device = 'desktop';
		} else {
			if (window.device == 'desktop') {
				location.reload()
			}
			window.device = 'mobile';
		}
		if ($(this).width() > 1100 && $(this).width() < 1400 && isIpad()) {
			$("#landscape-lock").removeClass("hidden")
		} else {
			$("#landscape-lock").addClass("hidden")
		}
	}).trigger("resize")


	if (navigator.appVersion.indexOf("Mac") != -1) {
		$("body").get(0).style.setProperty('--lock', "15px");
	} else {
		$("body").get(0).style.setProperty('--lock', "17px");
	}
}

export {
	initDevice,
}