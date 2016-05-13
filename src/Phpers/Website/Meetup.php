<?php

namespace Phpers\Website;

class Meetup
{
    private $sponsors = [];
    private $speakers = [];
    private $talks = [];
    private $city = '';
    
    private function __construct()
    {
    }

    /**
     * @param array $meetupArray
     * @return Meetup
     */
    public static function fromArray(array $meetupArray)
    {
        $latitude = 0;
        $longitude = 0;

        if (isset($meetupArray['venue']['location'])) {
            $latLong = explode(',', $meetupArray['venue']['location']);
            $latitude = trim($latLong[0]);
            $longitude = trim($latLong[1]);
        }
        
        $meetup = new Meetup();
        $meetup->city = isset($meetupArray['city']) ?
            new City($meetupArray['city'], $latitude, $longitude) :
            new City('')
        ;
        self::addSponsors($meetup, $meetupArray);
        self::addSpeakers($meetup, $meetupArray);
        self::addTalks($meetup, $meetupArray);
        
        return $meetup;
    }
    
    private static function addSponsors(Meetup $meetup, array $meetupArray)
    {
        if (! isset($meetupArray['sponsors'])) {
            return;
        }
        
        if (! is_array($meetupArray['sponsors'])) {
            return;
        }
        
        foreach ($meetupArray['sponsors'] as $sponsor) {
            $meetup->sponsors[] = new Sponsor(
                $sponsor['name'],
                $sponsor['logo'],
                $sponsor['site']
            );
        }
    }
    
    private static function addSpeakers(Meetup $meetup, array $meetupArray)
    {
        if (! isset($meetupArray['talks'])) {
            return;
        }

        if (! is_array($meetupArray['talks'])) {
            return;
        }

        foreach ($meetupArray['talks'] as $talk) {
            $meetup->speakers[] = new Speaker($talk['speaker']);
        }
    }
    
    private static function addTalks(Meetup $meetup, array $meetupArray)
    {
        if (! isset($meetupArray['talks'])) {
            return;
        }

        if (! is_array($meetupArray['talks'])) {
            return;
        }

        foreach ($meetupArray['talks'] as $talk) {
            $meetup->talks[] = new Talk($talk['title'], $talk['description']);
        }
    }

    /**
     * @return Sponsor[]
     */
    public function sponsors()
    {
        return $this->sponsors;
    }
    
    /**
     * @return Speaker[]
     */
    public function speakers()
    {
        return $this->speakers;
    }

    /**
     * @return City
     */
    public function city()
    {
        return $this->city;
    }

    /**
     * @return Talk[]
     */
    public function talks()
    {
        return $this->talks;
    }
}