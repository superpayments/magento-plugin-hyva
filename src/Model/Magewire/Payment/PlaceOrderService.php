<?php

namespace Superpayments\SuperPaymentHyva\Model\Magewire\Payment;
use Hyva\Checkout\Model\Magewire\Payment\AbstractPlaceOrderService;
use Magento\Quote\Model\Quote;

class PlaceOrderService extends AbstractPlaceOrderService
{
    public function getRedirectUrl(Quote $quote, ?int $orderId = null): string
    {
        return '/superpayment/payment/redirect';
    }
}
