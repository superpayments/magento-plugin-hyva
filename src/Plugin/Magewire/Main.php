<?php declare(strict_types=1);

namespace Superpayments\SuperPaymentHyva\Plugin\Magewire;

use Hyva\Checkout\Magewire\Main as Subject;
use Hyva\Checkout\Model\Magewire\Payment\PlaceOrderServiceProcessor;
use Magento\Checkout\Model\Session as SessionCheckout;

class Main
{
    protected SessionCheckout $sessionCheckout;
    protected PlaceOrderServiceProcessor $placeOrderServiceProcessor;

    public function __construct(
        PlaceOrderServiceProcessor $placeOrderServiceProcessor,
        SessionCheckout $sessionCheckout
    ) {
        $this->placeOrderServiceProcessor = $placeOrderServiceProcessor;
        $this->sessionCheckout = $sessionCheckout;
    }

    public function aroundPlaceOrder(Subject $subject, callable $proceed)
    {
        $quote = $this->sessionCheckout->getQuote();
        $method = $quote->getPayment()->getMethod();

        if ($method === 'super_payment_gateway') {
            $process = $this->placeOrderServiceProcessor->process($subject);
        } else {
            return $proceed();
        }
    }
}
