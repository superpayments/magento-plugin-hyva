This repository contains the module that enables SuperPayments support for Hyvä, https://www.hyva.io/.

## Prerequisites

You must install the following **before** you install the Super Payments Hyvä plugin.

1. Install the SuperPayments Magento 2 Module, https://github.com/superpayments/magento-plugin

2, Install the Hyva Checkout, https://docs.hyva.io/checkout/hyva-checkout/getting-started/index.html

3. Hyva Theme, https://docs.hyva.io/hyva-themes/getting-started/index.html (there is a default theme)

4. Hyva Compatibility Module, https://docs.hyva.io/hyva-themes/compatibility-modules/index.html#compat-module-development-videos

## Generate the Super Payments Hyvä Module

1. Update the Super Payments Hyvä Module version.

2. A new release can be created through using: https://github.com/superpayments/magento-plugin-hyva/releases/new.

## Installation the module manually

1. Download and extract the ZIP file.

2. Connect to the Magento server.

3. Navigate to the "app/code" directory. Create a folder named "Superpayments", then enter the newly created folder and create another folder named "SuperPaymentHyva".

4. Go to the path "app/code/Superpayments/SuperPaymentHyva". Copy all the Super Payments Hyvä Module folders and files from the "src" folder in the downloaded module.

5.  In the terminal, run the command:

```bash
php bin/magento hyva:config:generate
```

6. Check the file "app/etc/hyva-themes.json" to ensure that the path to the Hyva compatibility module files is correctly specified. This is necessary for generating styles.

7. Generate the CSS files:

```bash
npm --prefix vendor/hyva-themes/magento2-default-theme/web/tailwind/ run ci
npm --prefix vendor/hyva-themes/magento2-default-theme/web/tailwind/ run build-prod
```

Or from your theme:

```bash
npm --prefix app/design/frontend/<Vendor>/<Theme>/web/tailwind run ci
npm --prefix app/design/frontend/<Vendor>/<Theme>/web/tailwind run build-prod
```

8. Run the command and then configure the module in the admin panel.

```bash
php bin/magento setup:upgrade
```

## Missing styles?

Make sure that PostCSS uses the `postcssImportHyvaModules` plugin in your theme:

1. Go to your theme folder: `app/design/frontend/<Vendor>/<Theme>/web/tailwind`
2. Install the module:
```bash
npm install --save-dev @hyva-themes/hyva-modules
```
3. Open your `postcss.config.js` and add this as the first line:
```js
const { postcssImportHyvaModules } = require("@hyva-themes/hyva-modules");
```
4. Make sure the plugin is includes in the plugins list:
```js
module.exports = {
    plugins: [
        postcssImportHyvaModules,
        // ...
    ],
};
```
