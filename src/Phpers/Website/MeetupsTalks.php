<?php

namespace Phpers\Website;

class MeetupsTalks
{
    /**
     * @var Meetup[]
     */
    private $meetups = [];
    
    public function __construct(array $meetups)
    {
        $this->meetups = $meetups;
    }

    public function all()
    {
        $talks = [];
        foreach ($this->meetups as $meetup) {
            $talks = array_merge($talks, $meetup->talks());
        }

        return array_values($talks);
    }
}