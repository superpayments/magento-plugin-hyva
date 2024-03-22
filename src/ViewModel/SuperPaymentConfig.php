<?php

namespace Superpayments\SuperPaymentHyva\ViewModel;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\View\Element\Block\ArgumentInterface;

class SuperPaymentConfig implements ArgumentInterface
{
    /** @var ScopeConfigInterface */
    private $scopeConfig;

    public function __construct(
        ScopeConfigInterface $scopeConfig,
    ) {
        $this->scopeConfig = $scopeConfig;
    }

    public function getDefaultSelectedValue()
    {
        return $this->scopeConfig->getValue(
            'payment/super_payment_gateway/default_selected',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
    }
}
