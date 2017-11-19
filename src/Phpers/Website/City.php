<?php

namespace Phpers\Website;

final class City
{
    private $name;
    private $long;
    private $lat;

    public function __construct($name, $lat = '', $long = '')
    {
        $this->name = $name;
        $this->long = $long;
        $this->lat = $lat;
    }

    public function longitude()
    {
        return $this->long;
    }

    public function latitude()
    {
        return $this->lat;
    }

    public function __toString()
    {
        return $this->name;
    }

    public function normalizedName()
    {
        return str_replace(
            ['ą', 'ć', 'ę', 'ń', 'ó', 'ś', 'ź', 'ż', ' '],
            ['a', 'c', 'e', 'n', 'o', 's', 'z', 'z', '_'],
            mb_strtolower($this->name)
        );
    }
}