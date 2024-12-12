document.addEventListener('DOMContentLoaded', function () {

    const initSuperPaymentMethod = {
        method: document.querySelector('li[id*="super_payment_gateway"]'),
        isDefault: initSuperPaymentMethodConfig?.isDefault || false,
        canSetMethodByDefault: false,
        activeMethod: '',
        title: '',
        description: '',
        htmlProcessing: false,

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

                if (this.activeMethod === 'super_payment_gateway') {
                    this.clonePlaceHolderBtn();
                } else {
                    document.querySelector('[x-bind="buttonPlaceOrder()"]').classList.remove('hidden');
                    document.querySelector('.btn-superpayment-place-order')?.remove();
                    this.addSuperPaymentMethodTitle();
                }
            });

            window.addEventListener('checkout:superpayment:place-order', this.validateSubmition.bind(this));

            if (window.Magewire) {
                window.Magewire.hook('message.processed', (message, component) => {
                    if (component.id === 'price-summary.total-segments') {
                        requestAnimationFrame(() => {
                            this.getPaymentHtml();
                        });
                    }

                    if (component.id === 'checkout.payment.methods') {
                        if (component?.serverMemo?.data?.method === 'super_payment_gateway') {
                            this.htmlProcessing = false;
                            requestAnimationFrame(() => {
                                this.getPaymentHtml();
                            });
                        } else {
                            this.addSuperPaymentMethodTitle();
                        }
                    }
                });
            }

        },

        getPaymentHtml(isFirstLoad = false) {
            if (this.htmlProcessing) {
                return;
            }

            const serviceUrl = `${window.location.origin}/superpayment/discount/offerbanner`;
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };

            fetch(serviceUrl, options)
                .then(resp => {
                    if (!resp.ok) throw new Error(`HTTP Error: ${resp.status}`);
                    return resp.json();
                })
                .then(json => {
                    const { title, description } = json;

                    this.title = title || '';
                    this.description = description || '';
                    this.setPaymentData();

                    // Set by default if necessary
                    if (this.isDefault && this.canSetMethodByDefault && isFirstLoad) {
                        this.method.querySelector('input')?.click();
                    }

                    this.showDescription();
                })
                .catch(err => console.error('Fetch error:', err));

            this.htmlProcessing = true;
            setTimeout(() => {
                this.htmlProcessing = false;
                //this.addSuperPaymentMethodTitle();
            }, 1500);
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
        },

        addSuperPaymentMethodTitle() {
            if (this.htmlProcessing) {
                return;
            }

            const paymentLabel = document.querySelector('#payment-method-option-super_payment_gateway label');

            if (paymentLabel) {
                const hasNonTitleChildren = Array.from(paymentLabel.children).some(
                    (child) => !child.classList.contains('super-payment-method-title')
                );

                if (hasNonTitleChildren) {
                    const newContent = document.createElement('div');
                    newContent.className = 'super-payment-method-title';
                    newContent.innerHTML = '<super-payment-method-title page="checkout"></super-payment-method-title>';
                    paymentLabel.replaceChildren(newContent);
                }
            }
        }

    };

    initSuperPaymentMethod.init();
});
