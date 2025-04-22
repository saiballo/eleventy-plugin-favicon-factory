<p align="center">
	<img src="https://www.11ty.dev/img/logo-github.svg" width="100" height="100" alt="11ty logo">
</p>

# eleventy-plugin-favicon-factory

> A plugin for Eleventy that, starting from an SVG file, generates favicons in various sizes and, if requested, also creates the manifest file. The plugin also takes care of injecting the generated HTML code into your pages.


![](https://img.shields.io/badge/Made%20with%20love%20and%20with-javascript%2C%20node-blue)
[![MIT license](https://img.shields.io/badge/License-MIT-green.svg)](https://lbesson.mit-license.org/)

## Installation

Available on [npm](https://www.npmjs.com/package/@saiballo/eleventy-plugin-svg-embed):

```sh
npm install @saiballo/eleventy-plugin-favicon-factory --save
```
Add the plugin to your `eleventy.config.js`:

```js
const favicon = require("@saiballo/eleventy-plugin-favicon-factory");

module.exports =  function(eleventyConfig) {

	eleventyConfig.addPlugin(favicon);
};
```

#### Options Parameters
You can add an options object to the plugin configuration. Below is the complete list of default available parameters.

```js
module.exports =  function(eleventyConfig) {

	eleventyConfig.addPlugin(favicon, {
		"outputFolder": "favicon",
		"prefixName": "favicon",
		"imgPathHref": "",
		"manifestGenerate": true,
		"manifestName": "manifest",
		"manifestOutputFolder": "",
		"manifestData": {
			"name": "MyApp",
			"shortName": "MyApp but short",
			"description": "Progressive Web App",
			"startUrl": "/",
			"display": "standalone",
			"backgroundColor": "#ffffff",
			"themeColor": "#000000"
		},
		"sizeList": [16, 32, 48, 57, 72, 76, 96, 114, 120, 144, 152, 180, 192, 256, 512],
		"runOnlyDevMode": true,
		"tabIndent": 2
	});
};
```

#### Parameters
```js
// output folder for image files. path is relative to "dist" project folder. e.g. this html value for links will be set to "/dist/assets/img/favicon/favicon.[png,ico,svg]"
// if folder structure does not exsist it will be created
"outputFolder": "assets/img/favicon"

// image name used for the generated favicons
"prefixName": "favicon",

// usually left empty. if not, it overrides the default HTML href value. e.g. for "https://www.site.com" it will be se to https://www.site.com/favicon.[png,ico,svg]
"imgPathHref": ""

// true | false. if "true", a manifest file will be generated
"manifestGenerate": true

// manifest filename to use in the generated HTML snippet
"manifestName": "manifest"

// output folder for the manifest file. path is relative to "dist" project folder. leave empty to place it in the root "dist" folder
"manifestOutputFolder": ""

// set your main manifest data (icon entries will be added by the plugin)
"manifestData": {
	"name": "MyApp",
	"shortName": "MyApp but short",
	"description": "Progressive Web App",
	"startUrl": "/",
	"display": "standalone",
	"backgroundColor": "#ffffff",
	"themeColor": "#000000"
},

// choose which icon sizes to generate. these are the recommended values
"sizeList": [16, 32, 48, 57, 72, 76, 96, 114, 120, 144, 152, 180, 192, 256, 512]

// true | false. if set to "true" favicons (and optionally the manifest) are generated only once in dev mode. if "false" favicons are regenerated even in production
"runOnlyDevMode": true

// set the number of tab indentations for the generated HTML snippet
"tabIndent": 2
```

## Usage

In your template you can add a shortcut (the example below is for Nunjucks). The Favicon file must be in svg format and it will be copied into "outputFolder" folder:

```js
{% favicon "path/to/your/image/favicon.svg" %}
```

## Team ARMADA 429
<img src="https://raw.githubusercontent.com/saiballo/saiballo/refs/heads/master/armada429.png" width="100" height="100">

* Lorenzo "Saibal" Forti

## License

![](https://img.shields.io/badge/License-Copyleft%20Saibal%20--%20All%20Rights%20Reserved-red)
