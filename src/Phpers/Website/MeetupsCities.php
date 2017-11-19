<?php

namespace Phpers\Website;

class MeetupsCities
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
        $cities = [];
        foreach ($this->meetups as $meetup) {
            $cities[$meetup->city()->normalizedName()] = $meetup->city();
        }
        
        uksort($cities, 'strnatcasecmp');

        return array_values($cities);
    }
}