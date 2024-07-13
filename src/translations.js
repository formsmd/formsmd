("use strict");

const translations = {
	en: {
		"choice-field-required": "Please select an item in the list.",
		"choose-many-text": "Choose as many as you like",
		"copy-btn": "Copy",
		"copy-btn-success": "Copied",
		"end-slide-title": "Thank you",
		"end-slide-subtitle": "You've reached the end. Thanks for reading!",
		"form-submit-btn": "OK",
		"form-submitted-title": "Thank you",
		"form-submitted-subtitle": "Your response has been recorded. Thank you!",
		"list-check": "Not checked",
		"list-checked": "Checked",
		"loading": "Loading",
		"made-in-btn": 'Made in <strong class="bmd-antialiased">blocks.md</strong>',
		"made-in-loader":
			'<div class="bmd-specific-fs-14">Made in</div><div class="bmd-specific-fs-20 bmd-text-emphasis"><strong>blocks.md</strong></div>',
		"next-btn": "Next",
		"number-input-placeholder": "Type a number here...",
		"page-progress": "Page progress (%)",
		"previous-btn": "Previous",
		"restart-btn": "Restart",
		"select-box-placeholder": "Select an option",
		"slide-error": "Something went wrong. Please try again.",
		"start-btn": "Start",
		"text-input-placeholder": "Type your answer here...",
		"textarea-new-line-text": "to add new line",
		"toggle-color-scheme-btn": "Toggle color scheme",
		"try-again-btn": "Try again",
	},
	bn: {
		"choice-field-required": "অনুগ্রহ করে একটি আইটেম নির্বাচন করুন।",
		"choose-many-text": "এক বা একাধিক নির্বাচন করুন",
		"copy-btn": "কপি",
		"copy-btn-success": "সম্পন্ন",
		"end-slide-title": "ধন্যবাদ",
		"end-slide-subtitle": "আপনি শেষ পর্যন্ত পৌঁছেছেন৷ পড়ার জন্য ধন্যবাদ!",
		"form-submit-btn": "ওকে",
		"form-submitted-title": "ধন্যবাদ",
		"form-submitted-subtitle": "আপনার জবাব রেকর্ড করা হয়েছে। ধন্যবাদ!",
		"list-check": "চিহ্নিত না",
		"list-checked": "চিহ্নিত",
		"loading": "লোড হচ্ছে",
		"made-in-btn": '<strong class="bmd-antialiased">blocks.md</strong> তে তৈরি',
		"made-in-loader":
			'<div class="bmd-specific-fs-20 bmd-text-emphasis"><strong>blocks.md</strong></div><div class="bmd-specific-fs-14">তে তৈরি</div>',
		"next-btn": "পরবর্তী",
		"number-input-placeholder": "এখানে একটি সংখ্যা টাইপ করুন...",
		"page-progress": "পৃষ্ঠার অগ্রগতি (%)",
		"previous-btn": "পূর্ববর্তী",
		"restart-btn": "আবার শুরু",
		"select-box-placeholder": "যেকোনো একটি নির্বাচন করুন",
		"slide-error": "কিছু ভুল হয়েছে। অনুগ্রহপূর্বক আবার চেষ্টা করুন.",
		"start-btn": "শুরু",
		"text-input-placeholder": "এখানে আপনার উত্তর টাইপ করুন...",
		"textarea-new-line-text": "নতুন লাইন যোগ করতে",
		"toggle-color-scheme-btn": "রঙের স্কিম টগল করুন",
		"try-again-btn": "আবার চেষ্টা করুন",
	},
	es: {
		"choice-field-required": "Seleccione un artículo de la lista.",
		"choose-many-text": "Elige tantos como quieras",
		"copy-btn": "Copia",
		"copy-btn-success": "Copiado",
		"end-slide-title": "Gracias",
		"end-slide-subtitle": "Has llegado al final. Gracias por leernos!",
		"form-submit-btn": "OK",
		"form-submitted-title": "Gracias",
		"form-submitted-subtitle": "Su respuesta ha quedado registrada. Gracias!",
		"list-check": "No comprobado",
		"list-checked": "Comprobado",
		"loading": "Cargando",
		"made-in-btn":
			'Fabricado en <strong class="bmd-antialiased">blocks.md</strong>',
		"made-in-loader":
			'<div class="bmd-specific-fs-14">Fabricado en</div><div class="bmd-specific-fs-20 bmd-text-emphasis"><strong>blocks.md</strong></div>',
		"next-btn": "Siguiente",
		"number-input-placeholder": "Escriba un número aquí...",
		"page-progress": "Avance de página (%)",
		"previous-btn": "Anterior",
		"restart-btn": "Reinicie",
		"select-box-placeholder": "Seleccione una opción",
		"slide-error": "Algo ha ido mal. Por favor, inténtelo de nuevo.",
		"start-btn": "Inicio",
		"text-input-placeholder": "Escriba aquí su respuesta...",
		"textarea-new-line-text": "para añadir una nueva línea",
		"toggle-color-scheme-btn": "Alternar combinación de colores",
		"try-again-btn": "Inténtalo de nuevo",
	},
};

/**
 * Given a localization setting and key, get the correct translation string.
 *
 * @param {string} localization
 * @param {string} key
 * @returns {string}
 */
function getTranslation(localization, key) {
	if (translations[localization] === undefined) localization = "en";
	return translations[localization][key] || "";
}

exports.getTranslation = getTranslation;
