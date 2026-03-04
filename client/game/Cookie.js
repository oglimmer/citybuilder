const Cookie = {
	set(cookieName, cookieValue) {
		document.cookie = `${cookieName}=${escape(cookieValue)}`;
	},
	get(cookieName) {
		const theCookie = ` ${document.cookie}`;
		let ind = theCookie.indexOf(` ${cookieName}=`);
		if (ind === -1) {
			ind = theCookie.indexOf(`;${cookieName}=`);
		}
		if (ind === -1 || cookieName === '') {
			return '';
		}
		let ind1 = theCookie.indexOf(';', ind + 1);
		if (ind1 === -1) {
			ind1 = theCookie.length;
		}
		return unescape(theCookie.substring(ind + cookieName.length + 2, ind1));
	}
};

export default Cookie;
