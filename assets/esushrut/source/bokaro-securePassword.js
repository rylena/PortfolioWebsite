// September 1, 2026 capture: active function from ssoLogin.js.
function securePassword() {
	var hashValue = "";
	// var objPassHash = new
	// jsSHA(document.getElementsByName("varPassword")[0].value+document.getElementsByName("varUserName")[0].value,
	// "ASCII");
	var objPassHash = new jsSHA('SHA-512', 'TEXT', 1);
	// ---var objPassHash = new
	// jsSHA(document.getElementsByName("varUserName")[0].value+document.getElementsByName("varUserName")[0].value,
	// "ASCII");
	try {
		// hashValue = objPassHash.getHash("SHA-1", "HEX");
		objPassHash.update(document.getElementsByName("varPassword")[0].value
				+ document.getElementsByName("varUserName")[0].value);
		hashValue = objPassHash.getHash("HEX");
	} catch (e) {
		return false;
	}

	// objPassHash = new jsSHA(hashValue + sessionToken, "ASCII");
	// alert("Hash1"+hashValue);
	// alert("Session Toekn"+sessionToken);
	var objPassHash1 = new jsSHA('SHA-512', 'TEXT', 1);
	objPassHash1.update(hashValue + sessionToken);
	try {
		// hashValue = objPassHash.getHash("SHA-1", "HEX");
		hashValue = objPassHash1.getHash("HEX");
	} catch (e) {
		return false;
	}

	// alert("Encrypted Password in SHA-512 encoding is "+hashValue);
	// swal({ text: "Encrypted Password in SHA-512 encoding is !"+hashValue,
	// button:"OK", });

	document.getElementsByName("varPassword")[0].value = hashValue;
	return true;

}
