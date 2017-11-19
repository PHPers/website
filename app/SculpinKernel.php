<?php

use Mavimo\Sculpin\Bundle\RedirectBundle\SculpinRedirectBundle;
use Phpers\Bundle\WebsiteBundle\PhpersWebsiteBundle;

class SculpinKernel extends \Sculpin\Bundle\SculpinBundle\HttpKernel\AbstractKernel
{
    protected function getAdditionalSculpinBundles()
    {
        return array(
            SculpinRedirectBundle::class,
            PhpersWebsiteBundle::class
        );
    }
}