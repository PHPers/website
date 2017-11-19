<?php

namespace Phpers\Website;

final class Talk
{
    private $title;
    private $desc;

    public function __construct($title, $description)
    {
        $this->title = $title;
        $this->desc = $description;
    }

    public function title()
    {
        return $this->title;
    }

    public function description()
    {
        return $this->desc;
    }
}