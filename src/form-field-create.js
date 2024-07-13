("use strict");

const { addReservedClass } = require("./attrs-parse");
const { isNumeric, unescape } = require("./helpers");
const { getPhoneNumberPlaceholder } = require("./phone-number-placeholders");
const { getTranslation } = require("./translations");
var nunjucks = require("nunjucks");

const formFieldPattern = new RegExp(
	/\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(\*)?\s*=\s*(textinput|emailinput|urlinput|telinput|numberinput|selectbox|choiceinput|picturechoice)\((.*)\)/,
	"is",
);

/**
 * Generate the start tag and validate shared params for creating form fields.
 *
 * @param {boolean} required
 * @param {string} parsedAttrs
 * @param {string} params
 * @param {string} formDelimiter
 * @param {boolean} useFieldset
 * @returns {{startTag: string, validParams: Object, restParams: Object}}
 * start tag, validated params, rest of the params
 */
function formFieldSetup(
	required,
	parsedAttrs,
	params,
	formDelimiter,
	useFieldset,
) {
	// Set up defaults
	const validParams = {
		question: required
			? '<span class="bmd-text-nowrap">...<sup class="bmd-text-accent">*</sup></span>'
			: "...",
	};
	const restParams = {};

	// Go through the params
	for (let param of params.split(formDelimiter)) {
		param = param.trim();
		if (!param) continue;

		// A param can have a value (set by using "=") or be a boolean attribute
		let key, value, equalIndex;
		equalIndex = param.indexOf("=");
		if (equalIndex !== -1) {
			key = param.slice(0, equalIndex).trim().toLowerCase();
			value = param.slice(equalIndex + 1).trim();
		} else {
			key = param.toLowerCase();
			value = true;
		}

		// Validate the shared params and collect the rest
		if (key === "question" && value) {
			if (required) {
				let question = value.split(" ");
				const questionLastWord = question.pop();
				question.push(
					`<span class="bmd-text-nowrap">${questionLastWord}<sup class="bmd-text-accent">*</sup></span>`,
				);
				validParams[key] = question.join(" ");
			} else {
				validParams[key] = value;
			}
		} else if (key === "description" && value) {
			validParams[key] = value;
		} else if (key === "fieldsize" && value && value === "sm") {
			validParams[key] = value;
		} else if (key === "subfield" && value) {
			validParams[key] = value;
		} else if (key === "autofocus" && value) {
			validParams[key] = value;
		} else {
			restParams[key] = value;
		}
	}

	// Create the start tag and add the reserved class names
	const startTagName = useFieldset ? "fieldset" : "div";
	let startTag = `<${startTagName}>`;
	if (parsedAttrs) startTag = `<${startTagName} ${parsedAttrs}>`;
	startTag = addReservedClass(startTag, "bmd-form-field");
	if (validParams["fieldsize"] !== undefined)
		startTag = addReservedClass(startTag, "bmd-form-field-sm");
	if (validParams["subfield"] !== undefined)
		startTag = addReservedClass(startTag, "bmd-form-subfield");

	return {
		startTag: startTag,
		validParams: validParams,
		restParams: restParams,
	};
}

/* Text field */

const textFieldTemplate = `
{{ startTag }}
	<label class="bmd-form-question" for="{{ inputId }}">
		{{ validParams.question | safe }}
	</label>
	{% if validParams.description %}
	<p class="bmd-form-description">
		{{ validParams.description }}
	</p>
	{% endif %}
	<input
		name="{{ name }}"
		id="{{ inputId }}"
		type="{{ inputType }}"
		class="bmd-form-control"
		placeholder="{{ validParams.placeholder }}"
		{% if required %}required{% endif %}
		{% if validParams.value %}value="{{ validParams.value }}"{% endif %}
		{% if validParams.maxlength %}maxlength="{{ validParams.maxlength }}"{% endif %}
		{% if validParams.pattern %}pattern="{{ validParams.pattern }}"{% endif %}
		{% if validParams.disabled %}disabled{% endif %}
		{% if validParams.autofocus %}data-bmd-autofocus{% endif %}
	>
</div>
`;

const multilineTextFieldTemplate = `
{{ startTag }}
	<label class="bmd-form-question" for="{{ inputId }}">
		{{ validParams.question | safe }}
	</label>
	{% if validParams.description %}
	<p class="bmd-form-description">
		{{ validParams.description }}
	</p>
	{% endif %}
	<textarea
		name="{{ name }}"
		id="{{ inputId }}"
		class="bmd-form-control"
		placeholder="{{ validParams.placeholder }}"
		{% if required %}required{% endif %}
		{% if validParams.maxlength %}maxlength="{{ validParams.maxlength }}"{% endif %}
		{% if validParams.disabled %}disabled{% endif %}
		{% if validParams.autofocus %}data-bmd-autofocus{% endif %}
		aria-details="{{ inputId }}-form-text"
	>{% if validParams.value %}{{ validParams.value }}{% endif %}</textarea>
	<div id="{{ inputId }}-form-text" class="bmd-form-text-bottom bmd-d-flex bmd-align-items-center">
		<kbd class="bmd-d-flex bmd-align-items-center bmd-me-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="bmd-icon bmd-mt-1 bmd-me-2" aria-hidden="true" focusable="false"><path d="M464 56V32h48V56 288v24H488 93.1l79 79 17 17-33.9 33.9-17-17L18.2 305l-17-17 17-17 120-120 17-17L189.1 168l-17 17-79 79H464V56z"/></svg> Enter</kbd>
		{{ translations.newLineText }}
	</div>
</div>
`;

/**
 * Create a text form field. Supported types are "text", "email", "url", and
 * "tel". For the multiline "text" type, the <textarea> element is used.
 *
 * @param {string} name
 * @param {"text"|"email"|"url"|"tel"} inputType
 * @param {boolean} required
 * @param {string} parsedAttrs
 * @param {string} params
 * @param {string} formDelimiter
 * @param {string} localization
 * @returns {string} text input form field as HTML string
 */
function createTextField(
	name,
	inputType,
	required,
	parsedAttrs,
	params,
	formDelimiter,
	localization,
) {
	// Set up the start tag, valid params, the rest, and translations
	const {
		startTag: startTag,
		validParams: validParams,
		restParams: restParams,
	} = formFieldSetup(required, parsedAttrs, params, formDelimiter, false);
	const translations = {};

	// Add the default placeholder based on input type
	validParams["placeholder"] = getTranslation(
		localization,
		"text-input-placeholder",
	);
	if (inputType === "email") {
		validParams["placeholder"] = "name@example.com";
	} else if (inputType === "url") {
		validParams["placeholder"] = "https://example.com";
	}

	// Go through the rest of the params and validate
	for (let [key, value] of Object.entries(restParams)) {
		if (key === "placeholder" && value && typeof value === "string") {
			validParams[key] = value;
		} else if (key === "disabled" && value) {
			validParams[key] = value;
		} else if (key === "multiline" && value) {
			validParams[key] = value;
		} else if (
			key === "maxlength" &&
			value &&
			value >>> 0 === parseFloat(value)
		) {
			validParams[key] = value;
		} else if (key === "pattern" && value && typeof value === "string") {
			validParams[key] = value;
		} else if (key === "value" && value && typeof value === "string") {
			validParams[key] = value;
		} else if (key === "country" && value && typeof value === "string") {
			validParams[key] = value;
		} else {
			console.warn(
				`[FORM-FIELDS] "${name}": "${key} = ${value}" is not a valid parameter`,
			);
		}
	}

	// Add the telephone input placeholder using the country (if applicable)
	if (inputType === "tel") {
		validParams["country"] = validParams["country"] || "US";
		validParams["placeholder"] = getPhoneNumberPlaceholder(
			validParams["country"],
		);
	}

	// Set up template
	// If multiline, template is switched to use the <textarea> element
	let template = textFieldTemplate;
	if (inputType === "text" && validParams["multiline"] !== undefined) {
		template = multilineTextFieldTemplate;
		translations["newLineText"] = getTranslation(
			localization,
			"textarea-new-line-text",
		);
	}

	// Use Nunjucks to create the form field
	nunjucks.configure({ autoescape: false });
	return nunjucks.renderString(template, {
		startTag: startTag,
		name: name,
		inputId: `id_${name}`,
		inputType: inputType,
		required: required,
		validParams: validParams,
		translations: translations,
	});
}

/* Number field */

const numberFieldTemplate = `
{{ startTag }}
	<label class="bmd-form-question" for="{{ inputId }}">
		{{ validParams.question | safe }}
	</label>
	{% if validParams.description %}
	<p class="bmd-form-description">
		{{ validParams.description }}
	</p>
	{% endif %}
	<div class="bmd-input-group">
		{% if validParams.unit %}
		<span id="{{ inputId }}-unit" class="bmd-input-group-text">{{ validParams.unit }}</span>
		{% endif %}
		<input
			name="{{ name }}"
			id="{{ inputId }}"
			type="number"
			class="bmd-form-control"
			placeholder="{{ validParams.placeholder }}"
			{% if required %}required{% endif %}
			{% if validParams.value %}value="{{ validParams.value }}"{% endif %}
			{% if validParams.min %}min="{{ validParams.min }}"{% endif %}
			{% if validParams.max %}max="{{ validParams.max }}"{% endif %}
			{% if validParams.step %}step="{{ validParams.step }}"{% endif %}
			{% if validParams.disabled %}disabled{% endif %}
			{% if validParams.autofocus %}data-bmd-autofocus{% endif %}
			{% if validParams.unit and validParams.unitend %}
			aria-describedby="{{ inputId }}-unit {{ inputId }}-unit-end"
			{% elif validParams.unit %}
			aria-describedby="{{ inputId }}-unit"
			{% elif validParams.unitend %}
			aria-describedby="{{ inputId }}-unit-end"
			{% endif %}
		>
		{% if validParams.unitend %}
		<span id="{{ inputId }}-unit-end" class="bmd-input-group-text">{{ validParams.unitend }}</span>
		{% endif %}
	</div>
</div>
`;

/**
 * Create a number form field.
 *
 * @param {string} name
 * @param {boolean} required
 * @param {string} parsedAttrs
 * @param {string} params
 * @param {string} formDelimiter
 * @param {string} localization
 * @returns {string} number input form field as HTML string
 */
function createNumberField(
	name,
	required,
	parsedAttrs,
	params,
	formDelimiter,
	localization,
) {
	// Set up the start tag, valid params, the rest, and translations
	const {
		startTag: startTag,
		validParams: validParams,
		restParams: restParams,
	} = formFieldSetup(required, parsedAttrs, params, formDelimiter, false);
	const translations = {};

	// Add the default placeholder
	validParams["placeholder"] = getTranslation(
		localization,
		"number-input-placeholder",
	);

	// Go through the rest of the params and validate
	for (let [key, value] of Object.entries(restParams)) {
		if (key === "placeholder" && value && typeof value === "string") {
			validParams[key] = value;
		} else if (key === "disabled" && value) {
			validParams[key] = value;
		} else if (key === "max" && isNumeric(value)) {
			validParams[key] = value;
		} else if (key === "min" && isNumeric(value)) {
			validParams[key] = value;
		} else if (key === "step" && isNumeric(value)) {
			validParams[key] = value;
		} else if (key === "unit" && value && typeof value === "string") {
			validParams[key] = value;
		} else if (key === "unitend" && value && typeof value === "string") {
			validParams[key] = value;
		} else if (key === "value" && isNumeric(value)) {
			validParams[key] = value;
		} else {
			console.warn(
				`[FORM-FIELDS] "${name}": "${key} = ${value}" is not a valid parameter`,
			);
		}
	}

	// Use Nunjucks to create the form field
	nunjucks.configure({ autoescape: false });
	return nunjucks.renderString(numberFieldTemplate, {
		startTag: startTag,
		name: name,
		inputId: `id_${name}`,
		required: required,
		validParams: validParams,
		translations: translations,
	});
}

/* Select field */

const selectFieldTemplate = `
{{ startTag }}
	<label class="bmd-form-question" for="{{ inputId }}">
		{{ validParams.question | safe }}
	</label>
	{% if validParams.description %}
	<p class="bmd-form-description">
		{{ validParams.description }}
	</p>
	{% endif %}
	<select
		name="{{ name }}"
		id="{{ inputId }}"
		class="bmd-form-select"
		{% if required %}required{% endif %}
		{% if validParams.disabled %}disabled{% endif %}
		{% if validParams.autofocus %}data-bmd-autofocus{% endif %}
	>
		<option
			value=""
			{% if required %}disabled{% endif %}
			{% if not validParams.selected %}selected{% endif %}
		>
			{{ validParams.placeholder }}
		</option>
		{% for option in validParams.options %}
		<option
			value="{{ option.value }}"
			{% if validParams.selected == option.value and option.value %}selected{% endif %}
		>
			{{ option.label }}
		</option>
		{% endfor %}
	</select>
</div>
`;

/**
 * Create a select form field.
 *
 * @param {string} name
 * @param {boolean} required
 * @param {string} parsedAttrs
 * @param {string} params
 * @param {string} formDelimiter
 * @param {string} localization
 * @returns {string} select box form field as HTML string
 */
function createSelectField(
	name,
	required,
	parsedAttrs,
	params,
	formDelimiter,
	localization,
) {
	// Set up the start tag, valid params, the rest, and translations
	const {
		startTag: startTag,
		validParams: validParams,
		restParams: restParams,
	} = formFieldSetup(required, parsedAttrs, params, formDelimiter, false);
	const translations = {};

	// Add the default placeholder
	validParams["placeholder"] = getTranslation(
		localization,
		"select-box-placeholder",
	);

	// Go through the rest of the params and validate
	for (let [key, value] of Object.entries(restParams)) {
		if (key === "placeholder" && value && typeof value === "string") {
			validParams[key] = value;
		} else if (key === "disabled" && value) {
			validParams[key] = value;
		} else if (key === "options" && value && typeof value === "string") {
			const options = [];
			for (let option of value.split(",")) {
				// Skip empty options
				option = unescape(option.trim());
				if (!option) continue;

				let optionValue = option;
				let optionLabel = option;

				// For options, the "value" attribute can be specified by placing text
				// inside double-quotes
				optionLabel = optionLabel.replace(
					/"\s*(.*?)\s*"/s,
					function (match, content) {
						optionValue = content;
						return "";
					},
				);

				// Make sure to trim
				options.push({ value: optionValue.trim(), label: optionLabel.trim() });
			}
			validParams[key] = options;
		} else if (key === "selected" && value && typeof value === "string") {
			validParams[key] = value;
		} else {
			console.warn(
				`[FORM-FIELDS] "${name}": "${key} = ${value}" is not a valid parameter`,
			);
		}
	}

	// Use Nunjucks to create the form field
	nunjucks.configure({ autoescape: false });
	return nunjucks.renderString(selectFieldTemplate, {
		startTag: startTag,
		name: name,
		inputId: `id_${name}`,
		required: required,
		validParams: validParams,
		translations: translations,
	});
}

/* Choice field */

const choiceFieldTemplate = `
{{ startTag }}
	<legend class="bmd-form-question">
		{{ validParams.question | safe }}
	</legend>
	{% if validParams.description %}
	<p class="bmd-form-description">
		{{ validParams.description }}
	</p>
	{% endif %}
	{% if validParams.multiple %}
	<div class="bmd-form-text">
		{{ translations.chooseManyText }}
	</div>
	{% endif %}
	<div class="bmd-check-grid-wrapper">
		<div class="bmd-check-grid{% if isPictureChoice or validParams.horizontal %} bmd-check-grid-h{% endif %}{% if isPictureChoice and validParams.supersize %} bmd-check-grid-h-lg{% endif %}">
			{% for choice in validParams.choices %}
			<div class="bmd-form-check{% if isPictureChoice %} bmd-form-img-check{% endif %}">
				<input
					name="{{ name }}"
					id="{{ inputId }}-{{ loop.index }}"
					type="{% if validParams.multiple %}checkbox{% else %}radio{% endif %}"
					class="bmd-form-check-input"
					value="{{ choice.value }}"
					{% if validParams.checked %}{% if choice.value in validParams.checked %}checked{% endif %}{% endif %}
					{% if validParams.disabled %}disabled{% endif %}
					{% if validParams.autofocus %}data-bmd-autofocus{% endif %}
				>
				<label class="bmd-form-check-label" for="{{ inputId }}-{{ loop.index }}">
					{% if isPictureChoice %}
					<span class="bmd-form-check-frame">
						<img src="{{ choice.image }}" alt="{{ choice.label }}">
					</span>
					{% if not validParams.hidelabels %}{{ choice.label }}{% endif %}
					{% else %}
					{{ choice.label }}
					{% endif %}
					<span class="bmd-form-check-mark">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="bmd-icon" aria-hidden="true" focusable="false"><path d="M441 103c9.4 9.4 9.4 24.6 0 33.9L177 401c-9.4 9.4-24.6 9.4-33.9 0L7 265c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l119 119L407 103c9.4-9.4 24.6-9.4 33.9 0z"/></svg>
					</span>
				</label>
			</div>
			{% endfor %}
		</div>
	</div>
</fieldset>
`;

/**
 * Create a choice form field.
 *
 * @param {string} name
 * @param {boolean} isPictureChoice
 * @param {boolean} required
 * @param {string} parsedAttrs
 * @param {string} params
 * @param {string} formDelimiter
 * @param {string} localization
 * @returns {string} choice input form field as HTML string
 */
function createChoiceField(
	name,
	isPictureChoice,
	required,
	parsedAttrs,
	params,
	formDelimiter,
	localization,
) {
	// Set up the start tag, valid params, the rest, and translations
	// Make sure to use <fieldset> for the start tag during setup
	const {
		startTag: startTag,
		validParams: validParams,
		restParams: restParams,
	} = formFieldSetup(required, parsedAttrs, params, formDelimiter, true);
	const translations = {
		chooseManyText: getTranslation(localization, "choose-many-text"),
	};

	// Go through the rest of the params and validate
	for (let [key, value] of Object.entries(restParams)) {
		if (key === "disabled" && value) {
			validParams[key] = value;
		} else if (key === "multiple" && value) {
			validParams[key] = value;
		} else if (key === "horizontal" && value) {
			validParams[key] = value;
		} else if (key === "supersize" && value) {
			validParams[key] = value;
		} else if (key === "choices" && value && typeof value === "string") {
			const choices = [];
			for (let choice of value.split(",")) {
				// Skip empty choices
				choice = unescape(choice.trim());
				if (!choice) continue;

				// For image choices, the "src" for the image must come AFTER "&&"
				const choiceAndImage = choice.split("&&");
				let choiceValue = choiceAndImage[0];
				let choiceLabel = choiceAndImage[0];
				let choiceImage = choiceAndImage.length > 1 ? choiceAndImage[1] : "";

				// The "value" attribute can be specified by placing text inside
				// double-quotes
				choiceLabel = choiceLabel.replace(
					/"\s*(.*?)\s*"/s,
					function (match, content) {
						choiceValue = content;
						return "";
					},
				);

				// Make sure to trim
				choices.push({
					value: choiceValue.trim(),
					label: choiceLabel.trim(),
					image: choiceImage.trim(),
				});
			}
			validParams[key] = choices;
		} else if (key === "checked" && value && typeof value === "string") {
			validParams[key] = value.split(",").map(function (item) {
				return item.trim();
			});
		} else if (key === "hidelabels" && value) {
			validParams[key] = value;
		} else {
			console.warn(
				`[FORM-FIELDS] "${name}": "${key} = ${value}" is not a valid parameter`,
			);
		}
	}

	// Create the validation attributes (to be added to the start tag)
	let validationAttrs = `data-bmd-name="${name}"`;
	if (!validParams["multiple"]) {
		validationAttrs += ' data-bmd-type="radio"';
	} else {
		validationAttrs += ' data-bmd-type="checkbox"';
	}
	if (required) validationAttrs += " data-bmd-required";

	// Only keep one checked value in case of radio buttons
	if (!validParams["multiple"] && Array.isArray(validParams["checked"]))
		validParams["checked"].splice(1);

	// Use Nunjucks to create the form field
	nunjucks.configure({ autoescape: false });
	return nunjucks.renderString(choiceFieldTemplate, {
		startTag: `${startTag.slice(0, 9)} ${validationAttrs} ${startTag.slice(9)}`,
		name: name,
		inputId: `id_${name}`,
		isPictureChoice: isPictureChoice,
		required: required,
		validParams: validParams,
		translations: translations,
	});
}

exports.formFieldPattern = formFieldPattern;
exports.formFieldSetup = formFieldSetup;
exports.createTextField = createTextField;
exports.createNumberField = createNumberField;
exports.createSelectField = createSelectField;
exports.createChoiceField = createChoiceField;
