This repository contains the module that enables SuperPayments support for Hyvä.
This module has a dependency on the SuperPayments Magento 2 module, see https://github.com/superpayments/magento-plugin.

## Installation


1. Install the module using composer: 

```bash
composer require superpayments/superpayment-hyva
```

2. Enable the module:

```bash
bin/magento module:enable Superpayments_SuperPaymentHyva
```

3. Upgrade the database:

```bash
bin/magento setup:upgrade
```

4. Let Hyvä know about the new module:

```bash
php bin/magento hyva:config:generate
```

5. Generate the CSS files:

```bash
npm --prefix vendor/hyva-themes/magento2-default-theme/web/tailwind/ run ci
npm --prefix vendor/hyva-themes/magento2-default-theme/web/tailwind/ run build-prod
```

Or from your theme:

```bash
npm --prefix app/design/frontend/<Vendor>/<Theme>/web/tailwind run ci
npm --prefix app/design/frontend/<Vendor>/<Theme>/web/tailwind run build-prod
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
