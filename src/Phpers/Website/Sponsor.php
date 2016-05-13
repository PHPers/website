<?php

namespace Phpers\Website;

final class Sponsor
{
    private $name;
    private $logo;
    private $website;

    public function __construct($name, $logo, $website = '')
    {
        $this->name = $name;
        $this->logo = $logo;
        $this->website = $website;
    }

    public function name()
    {
        return $this->name;
    }

    public function logoUrl()
    {
        return $this->logo;
    }

    public function websiteUrl()
    {
        return $this->website;
    }
    
    public function __toString()
    {
        return $this->name();
    }
}