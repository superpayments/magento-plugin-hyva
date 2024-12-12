document.addEventListener('DOMContentLoaded', function () {
    console.log('Hyva Super Payment Method JavaScript loaded!');

    const initSuperPaymentMethod = {
        method: document.querySelector('li[id*="super_payment_gateway"]'),
        isDefault: initSuperPaymentMethodConfig?.isDefault || false,
        canSetMethodByDefault: false,
        activeMethod: '',
        title: '',
        description: '',

        init() {
            if (!this.method) {
                console.error('Payment method element not found');
                return;
            }

            const label = this.method.querySelector('label');
            if (label) label.innerHTML = '';

            this.initEvents();
            this.getPaymentHtml(true);
        },

        initEvents() {
            window.addEventListener('checkout:step:loaded', (event) => {
                const component = Magewire.components.findComponent('checkout.payment.methods');
                const savedMethod = component?.serverMemo.data.method;

                !savedMethod ? this.canSetMethodByDefault = true : null;
            });

            window.addEventListener('checkout:payment:method-activate', (event) => {
                this.activeMethod = event.detail.method;
                this.getPaymentHtml();

                if (this.activeMethod === 'super_payment_gateway') {
                    this.clonePlaceHolderBtn();
                } else {
                    document.querySelector('[x-bind="buttonPlaceOrder()"]').classList.remove('hidden');
                    document.querySelector('.btn-superpayment-place-order')?.remove();
                }
            });

            window.addEventListener('checkout:shipping:method-activate', (event) => {
                this.getPaymentHtml();
            });

            document.addEventListener('checkout:superpayment:place-order', this.validateSubmition.bind(this));

            // Fix label strange behaviour
            document.addEventListener('livewire:load', () => {
                const label = this.method.querySelector('label');

                const checkoutUpdateEvents = [
                    'checkout.shipping-details.address-form',
                    'checkout.shipping.methods',
                    'checkout.payment.methods',
                    'price-summary.total-segments',
                ];

                Livewire.hook('message.sent', (_, component) => {
                    if (checkoutUpdateEvents.includes(component.id)) {
                        Magewire.dispatchEvent('loader:start');
                    }
                });

                Livewire.hook('message.received', (_, component) => {
                    if (component.id === 'checkout.payment.methods') {
                        requestAnimationFrame(() => {
                            this.getPaymentHtml();
                        });
                    }
                });
            });
        },

        getPaymentHtml(isFirstLoad = false) {
            const serviceUrl = `${window.location.origin}/superpayment/discount/offerbanner`;
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };

            setTimeout(() => Magewire.dispatchEvent('loader:start'), 2500);

            fetch(serviceUrl, options)
                .then(resp => {
                    Magewire.dispatchEvent('loader:start');
                    if (!resp.ok) throw new Error(`HTTP Error: ${resp.status}`);
                    return resp.json();
                })
                .then(json => {
                    const { title, description } = json;
                    Magewire.dispatchEvent('loader:start');

                    this.title = title || '';
                    this.description = description || '';
                    this.setPaymentData();

                    // Set by default if necessary
                    if (this.isDefault && this.canSetMethodByDefault && isFirstLoad) {
                        this.method.querySelector('input')?.click();
                    }

                    this.showDescription();
                })
                .catch(err => console.error('Fetch error:', err))
                .finally(() => {
                    setTimeout(() => Magewire.dispatchEvent('loader:done'), 2000);
                });
        },

        setPaymentData() {
            const label = this.method.querySelector('label');
            const content = this.method.querySelector('#payment-method-view-super_payment_gateway');

            content ? content.remove() : null;
            label.innerHTML = this.title;

            this.method.insertAdjacentHTML('beforeend', `
                <div id="payment-method-view-super_payment_gateway" class="hidden w-full pl-8 mt-4">
                    ${this.description}
                </div>
            `);
        },

        showDescription() {
            const description = this.method?.querySelector('#payment-method-view-super_payment_gateway');
            if (!description) return;

            this.activeMethod === 'super_payment_gateway'
                ? description.classList.remove('hidden')
                : description.classList.add('hidden');
        },

        clonePlaceHolderBtn() {
            const button = document.querySelector('[x-bind="buttonPlaceOrder()"]');

            if (!button) {
                console.error('Place Order button not found');
                return;
            } else {
                const existing = document.querySelector('.btn-superpayment-place-order');

                if (existing) {
                    existing.remove();
                } else {
                    const clone = button.cloneNode(true);
                    const attributes = ['x-spread', 'x-bind', 'data-step'];

                    attributes.forEach(attr => clone.removeAttribute(attr));
                    clone.classList.remove('btn-place-order');
                    clone.classList.add('btn-superpayment-place-order');

                    button.insertAdjacentElement('afterend', clone);

                    clone.addEventListener('click', (event) => {
                        document.dispatchEvent(new CustomEvent('checkout:superpayment:place-order'));
                    });
                }

                button.classList.add('hidden');
            }
        },

        validateSubmition() {
            const button = document.querySelector('[x-bind="buttonPlaceOrder()"]');

            if (window.superCheckout) {
                Magewire.dispatchEvent('loader:start');

                window.superCheckout.submit().then((resp) => {
                    if (resp.status === 'SUCCESS') {
                        button.click();
                    } else if (resp.status === 'FAILURE') {
                        this.setMessage('error', resp.errorMessage);
                    }
                }).catch((err) => {
                    console.error(err);
                    this.setMessage('error', `An error occurred on the server. Please try again, if the problem persists please contact us. (${err})`);
                }).finally(() => {
                    Magewire.dispatchEvent('loader:done');
                });
            } else {
                console.error('window.superCheckout doesn\'t exist');
            }
        },

        setMessage(type, text = '', time = 5000) {
            dispatchMessages([{ type, text }], time);
        }
    };

    initSuperPaymentMethod.init();

});
