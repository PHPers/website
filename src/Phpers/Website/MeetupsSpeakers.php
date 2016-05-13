<?php

namespace Phpers\Website;

class MeetupsSpeakers
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
        $speakers = [];
        foreach ($this->meetups as $meetup) {
            $speakers = array_merge($speakers, $meetup->speakers());
        }
        
        $speakers = array_unique($speakers);
        natcasesort($speakers);
        
        return array_values($speakers);
    }
}