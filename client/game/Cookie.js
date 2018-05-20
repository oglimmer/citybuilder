/* ------------------------------------------ */
/* class Cookie */
/* ------------------------------------------ */
var Cookie = {
	set : function(cookieName, cookieValue) {
		document.cookie = cookieName + "=" + escape(cookieValue);
	},
	get : function (cookieName) {
		var theCookie = " " + document.cookie;
		var ind = theCookie.indexOf(" " + cookieName + "=");
		if (ind == -1) {
			ind = theCookie.indexOf(";" + cookieName + "=");
		}
		if (ind == -1 || cookieName == "") {
			return "";
		}
		var ind1 = theCookie.indexOf(";", ind + 1);
		if (ind1 == -1) {
			ind1 = theCookie.length;
		}
		return unescape(theCookie.substring(ind + cookieName.length + 2, ind1));
	}
}