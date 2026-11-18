// September 1, 2026 capture: function from sso_main_login.js.
_FUN_MAIN_LOGIN.changeHospitalSelected = function(a) {
	let b = null;
	//console.log(a);
	if (typeof a === 'string')
		b = a.split("#");
	else {
		return false;
	}

	document.getElementById('OPDToday').innerHTML = b[1];
	document.getElementById('EmergencyToday').innerHTML = b[2];
	document.getElementById('IPDToday').innerHTML = b[3];
	document.getElementById('LabTestToday').innerHTML = b[4];
	document.getElementById('ABHAToday').innerHTML = b[5];
	document.getElementById('RxToday').innerHTML = b[6];
	document.getElementById('PharmacyToday').innerHTML = b[7];

	document.getElementById('OPDTotal').innerHTML = b[8];
	document.getElementById('EmergencyTotal').innerHTML = b[9];
	document.getElementById('IPDTotal').innerHTML = b[10];
	document.getElementById('LabTestTotal').innerHTML = b[11];
	document.getElementById('ABHATotal').innerHTML = b[12];
	document.getElementById('RxTotal').innerHTML = b[13];
	document.getElementById('PharmacyTotal').innerHTML = b[14];
};
