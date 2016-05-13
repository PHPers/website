<?php

class SculpinKernel extends \Sculpin\Bundle\SculpinBundle\HttpKernel\AbstractKernel
{
    protected function getAdditionalSculpinBundles()
    {
        return array(
            \Mavimo\Sculpin\Bundle\RedirectBundle\SculpinRedirectBundle::class,
            \Phpers\Bundle\WebsiteBundle\PhpersWebsiteBundle::class
        );
    }
}